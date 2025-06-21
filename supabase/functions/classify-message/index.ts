
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get knowledge base from Supabase
    const { data: knowledgeBase, error: kbError } = await supabaseClient
      .from('knowledge_base')
      .select('*')

    if (kbError) {
      throw new Error(`Knowledge base fetch error: ${kbError.message}`)
    }

    // Prepare categories and detailed knowledge for OpenAI
    const categories = [...new Set(knowledgeBase.map(item => item.category))]
    const knowledgeBaseContent = knowledgeBase.map(item => 
      `Category: ${item.category}
Title: ${item.title}
Content: ${item.content}
Keywords: ${item.keywords.join(', ')}`
    ).join('\n\n---\n\n')

    // OpenAI API call with enhanced prompt for better understanding
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert support assistant for a retail POS system. Your goal is to understand the user's query and provide the most helpful solution from the knowledge base.

KNOWLEDGE BASE:
${knowledgeBaseContent}

Available categories: ${categories.join(', ')}

INSTRUCTIONS:
1. Analyze the user's message to understand their specific problem
2. Find the most relevant knowledge base article(s) that can solve their issue
3. Provide a clear, step-by-step solution using information from the knowledge base
4. If multiple articles are relevant, combine the information intelligently
5. Always end with asking if the issue is resolved: "Is this issue resolved? Please reply with 'yes' or 'no'."

Your response should be a JSON object with:
- "category": the most appropriate category from the available categories
- "confidence": a number from 0-1 indicating confidence in classification  
- "response": a detailed, helpful response that directly addresses their query using knowledge base content, always ending with the resolution question
- "priority": "high" for urgent issues (API, transactions, hardware), "medium" for operational issues, "low" for general questions
- "requiresTicket": false (since we'll create tickets conditionally based on user response)

Focus on providing actionable solutions rather than generic responses.`
          },
          {
            role: 'user',
            content: `User query: "${message}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    })

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`)
    }

    const openAIData = await openAIResponse.json()
    const aiResponse = openAIData.choices[0].message.content

    let classification
    try {
      classification = JSON.parse(aiResponse)
    } catch (e) {
      // Fallback if JSON parsing fails
      classification = {
        category: 'General',
        confidence: 0.5,
        response: 'Thank you for your message. Let me help you with that. Is this issue resolved? Please reply with "yes" or "no".',
        priority: 'medium',
        requiresTicket: false
      }
    }

    return new Response(
      JSON.stringify(classification),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        category: 'General',
        response: 'I apologize, but I\'m having trouble processing your request right now. Is this issue resolved? Please reply with "yes" or "no".',
        priority: 'medium',
        requiresTicket: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
