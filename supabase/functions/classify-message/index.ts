
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
      .order('created_at', { ascending: false })

    if (kbError) {
      throw new Error(`Knowledge base fetch error: ${kbError.message}`)
    }

    console.log(`Fetched ${knowledgeBase?.length || 0} knowledge base articles`)

    // Prepare categories and detailed knowledge for Gemini
    const categories = [...new Set(knowledgeBase.map(item => item.category))]
    const knowledgeBaseContent = knowledgeBase.map(item => 
      `Category: ${item.category}
Title: ${item.title}
Content: ${item.content}
Keywords: ${item.keywords.join(', ')}
---`
    ).join('\n\n')

    console.log('Available categories:', categories)
    console.log('User message:', message)

    // Gemini API call with enhanced prompt for better keyword matching
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Deno.env.get('GOOGLE_API_KEY')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert support assistant for a retail POS system. Your goal is to understand the user's query and provide the most helpful solution from the knowledge base.

KNOWLEDGE BASE:
${knowledgeBaseContent}

Available categories: ${categories.join(', ')}

CLASSIFICATION INSTRUCTIONS:
1. Carefully analyze the user's message against ALL knowledge base articles
2. Pay special attention to the KEYWORDS field in each article - these are critical for accurate classification
3. If the user's message contains any keywords that match a knowledge base article, that category should be strongly considered
4. Look for exact keyword matches, partial matches, and semantic similarity
5. The keywords field is specifically designed to catch queries that should be classified under that category
6. Do NOT default to "General" if there are relevant keyword matches in the knowledge base

RESPONSE INSTRUCTIONS:
1. Find the most relevant knowledge base article(s) that can solve their issue
2. Provide a clear, step-by-step solution using information from the knowledge base
3. If multiple articles are relevant, combine the information intelligently
4. Always end with asking if the issue is resolved: "Is this issue resolved? Please reply with 'yes' or 'no'."

Your response should be a JSON object with:
- "category": the most appropriate category from the available categories (avoid "General" unless no other category fits)
- "confidence": a number from 0-1 indicating confidence in classification (higher confidence for keyword matches)
- "response": a detailed, helpful response that directly addresses their query using knowledge base content, always ending with the resolution question
- "priority": "high" for urgent issues (API, transactions, hardware), "medium" for operational issues, "low" for general questions
- "requiresTicket": false (since we'll create tickets conditionally based on user response)

Focus on providing actionable solutions rather than generic responses. Remember: keywords in the knowledge base are specifically designed to catch relevant queries.

User query: "${message}"

Please respond with ONLY the JSON object, no additional text.`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        }
      })
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', geminiResponse.status, errorText)
      throw new Error(`Gemini API error: ${geminiResponse.status} ${errorText}`)
    }

    const geminiData = await geminiResponse.json()
    const aiResponse = geminiData.candidates[0].content.parts[0].text

    console.log('Gemini response:', aiResponse)

    let classification
    try {
      // Clean the response to extract JSON if there's extra text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse
      classification = JSON.parse(jsonString)
      console.log('Parsed classification:', classification)
    } catch (e) {
      console.error('JSON parsing error:', e)
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
