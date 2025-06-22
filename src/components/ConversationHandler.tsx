
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
      // Create support ticket using the specific message and classification for this conversation
      try {
        const { data: ticketData, error: ticketError } = await supabase
          .from('support_tickets')
          .insert({
            message: originalMessage, // This is now the correct message for this specific classification
            category: classification.category, // This is the correct category for this specific classification
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
        } else {
          toast({
            title: "Support ticket created!",
            description: `Ticket ${ticketData.id.slice(0, 8)} has been created for "${classification.category}" category. Our support team will assist you further.`,
          });
        }
      } catch (error) {
        console.error('Error creating support ticket:', error);
        toast({
          title: "Error creating ticket",
          description: "There was an error creating the support ticket. Please try again.",
          variant: "destructive",
        });
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
