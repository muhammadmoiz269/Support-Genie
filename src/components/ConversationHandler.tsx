
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ClassificationResult } from "@/services/messageClassificationService";

interface ConversationHandlerProps {
  originalMessage: string;
  classification: ClassificationResult;
  onConversationComplete: () => void;
}

const ConversationHandler = ({ originalMessage, classification, onConversationComplete }: ConversationHandlerProps) => {
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleResolutionResponse = async (isResolved: boolean) => {
    setIsProcessing(true);

    if (!isResolved) {
      // Create support ticket immediately for instant user feedback
      try {
        const { data: ticketData, error: ticketError } = await supabase
          .from('support_tickets')
          .insert({
            message: originalMessage,
            category: classification.category,
            status: 'open',
            priority: classification.priority
          })
          .select()
          .single();

        if (ticketError) {
          console.error('Error creating support ticket:', ticketError);
          toast({
            title: "Error creating ticket",
            description: "There was an error creating the support ticket. Please try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        // Show immediate success feedback
        toast({
          title: "Support ticket created!",
          description: `Ticket ${ticketData.id.slice(0, 8)} has been created for "${classification.category}" category. Our support team will assist you further.`,
        });

        // Handle email notifications in the background (non-blocking)
        handleEmailNotifications(ticketData).catch(error => {
          console.error('Background email notification error:', error);
          // Don't show error to user since ticket was created successfully
        });

      } catch (error) {
        console.error('Error creating support ticket:', error);
        toast({
          title: "Error creating ticket",
          description: "There was an error creating the support ticket. Please try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
    } else {
      toast({
        title: "Great!",
        description: "I'm glad I could help resolve your issue.",
      });
    }

    setIsWaitingForResponse(false);
    setIsProcessing(false);
    onConversationComplete();
  };

  // Background function to handle email notifications
  const handleEmailNotifications = async (ticketData: any) => {
    try {
      // Get users assigned to this category
      const { data: assignments, error: assignmentError } = await supabase
        .from('user_category_assignments')
        .select(`
          category_users (
            name,
            email
          )
        `)
        .eq('category', classification.category);

      if (!assignmentError && assignments.length > 0) {
        const userEmails = assignments
          .map(assignment => assignment.category_users?.email)
          .filter(email => email);

        if (userEmails.length > 0) {
          // Call the email notification function in the background
          const { error: notificationError } = await supabase.functions.invoke('send-ticket-notification', {
            body: {
              ticketData,
              userEmails
            }
          });

          if (notificationError) {
            console.error('Error sending background notifications:', notificationError);
          } else {
            console.log('Email notifications sent successfully in background');
          }
        }
      }
    } catch (notificationError) {
      console.error('Error handling background notifications:', notificationError);
    }
  };

  if (!isWaitingForResponse) {
    return null;
  }

  return (
    <div className="flex justify-start">
      <div className="bg-white text-gray-800 rounded-lg rounded-bl-sm shadow-sm px-4 py-3 max-w-xs lg:max-w-md">
        <p className="text-sm mb-3">Please let me know:</p>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => handleResolutionResponse(true)}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Yes, resolved
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleResolutionResponse(false)}
            disabled={isProcessing}
          >
            No, need help
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationHandler;
