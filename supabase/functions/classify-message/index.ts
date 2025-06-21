
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

    // Prepare categories and keywords for OpenAI
    const categories = [...new Set(knowledgeBase.map(item => item.category))]
    const categoryDescriptions = knowledgeBase.map(item => 
      `${item.category}: Keywords include ${item.keywords.join(', ')}`
    ).join('\n')

    // OpenAI API call
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
            content: `You are a support ticket classifier for a retail POS system. Based on the user message, classify it into one of these categories and provide a helpful response.

Available categories:
${categoryDescriptions}

Your response should be a JSON object with:
- "category": the most appropriate category from the list
- "confidence": a number from 0-1 indicating confidence in classification
- "response": a helpful response to the user's query based on the knowledge base
- "priority": "high", "medium", or "low" based on urgency

Prioritize as "high" for: API issues, transaction delays, hardware problems
Prioritize as "medium" for: product flow, inventory, customer management
Prioritize as "low" for: onboarding, general questions`
          },
          {
            role: 'user',
            content: `Classify this message: "${message}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
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
        response: 'Thank you for your message. I\'ve created a support ticket and our team will review it.',
        priority: 'medium'
      }
    }

    // Find matching knowledge base article for more detailed response
    const matchingArticle = knowledgeBase.find(item => 
      item.category === classification.category
    )

    if (matchingArticle && classification.confidence > 0.7) {
      classification.response = matchingArticle.content
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
        response: 'I apologize, but I\'m having trouble processing your request right now. A support ticket has been created and our team will review it.',
        priority: 'medium'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
