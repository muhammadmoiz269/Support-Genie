
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { ticketData, userEmails } = await req.json()

    // Here you would integrate with your email service
    // For now, we'll just log the notification details
    console.log('Ticket created:', {
      ticketId: ticketData.id,
      category: ticketData.category,
      message: ticketData.message,
      priority: ticketData.priority,
      notifyUsers: userEmails
    })

    // Simulate email sending
    const emailPromises = userEmails.map(async (email: string) => {
      console.log(`Sending email notification to: ${email}`)
      console.log(`Subject: New ${ticketData.category} Ticket - Priority: ${ticketData.priority}`)
      console.log(`Message: ${ticketData.message}`)
      
      // Here you would integrate with services like:
      // - Resend
      // - SendGrid
      // - AWS SES
      // - Nodemailer
      
      return { email, status: 'sent' }
    })

    const results = await Promise.all(emailPromises)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notifications sent successfully',
        results 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error sending notifications:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send notifications',
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
