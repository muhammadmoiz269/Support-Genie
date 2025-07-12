
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

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

    console.log('Processing ticket notification:', {
      ticketId: ticketData.id,
      category: ticketData.category,
      message: ticketData.message,
      priority: ticketData.priority,
      notifyUsers: userEmails
    })

    // Send emails to all assigned users
    const emailPromises = userEmails.map(async (email: string) => {
      try {
        console.log(`Sending email notification to: ${email}`)
        
        const emailResponse = await resend.emails.send({
          from: "support-genie@resend.dev",
          to: [email],
          subject: `New ${ticketData.category} Ticket - Priority: ${ticketData.priority}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                New Support Ticket Assigned
              </h2>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #007bff; margin-top: 0;">Ticket Details</h3>
                <p><strong>Ticket ID:</strong> ${ticketData.id.slice(0, 8)}</p>
                <p><strong>Category:</strong> ${ticketData.category}</p>
                <p><strong>Priority:</strong> <span style="color: ${ticketData.priority === 'high' ? '#dc3545' : ticketData.priority === 'medium' ? '#ffc107' : '#28a745'}; font-weight: bold;">${ticketData.priority.toUpperCase()}</span></p>
                <p><strong>Status:</strong> ${ticketData.status}</p>
                <p><strong>Created:</strong> ${new Date(ticketData.created_at).toLocaleString()}</p>
              </div>
              
              <div style="background-color: #fff; border: 1px solid #dee2e6; padding: 15px; border-radius: 8px;">
                <h4 style="color: #333; margin-top: 0;">Customer Message:</h4>
                <p style="line-height: 1.6; color: #555;">${ticketData.message}</p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 8px;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  This ticket has been assigned to you based on your category responsibilities. 
                  Please review and respond to the customer as soon as possible.
                </p>
              </div>
              
              <hr style="margin: 20px 0; border: none; height: 1px; background-color: #dee2e6;">
              
              <p style="color: #666; font-size: 12px; text-align: center; margin: 0;">
                This is an automated notification from Support Genie System
              </p>
            </div>
          `,
        })

        console.log(`Email sent successfully to ${email}:`, emailResponse)
        return { email, status: 'sent', messageId: emailResponse.data?.id }
      } catch (emailError) {
        console.error(`Failed to send email to ${email}:`, emailError)
        return { email, status: 'failed', error: emailError.message }
      }
    })

    const results = await Promise.all(emailPromises)
    
    // Check if any emails failed
    const failedEmails = results.filter(result => result.status === 'failed')
    const successfulEmails = results.filter(result => result.status === 'sent')

    console.log('Email sending results:', {
      successful: successfulEmails.length,
      failed: failedEmails.length,
      results
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notifications processed: ${successfulEmails.length} sent, ${failedEmails.length} failed`,
        results,
        summary: {
          totalEmails: userEmails.length,
          successful: successfulEmails.length,
          failed: failedEmails.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in send-ticket-notification function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process ticket notifications',
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
