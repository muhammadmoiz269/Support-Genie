
import { supabase } from "@/integrations/supabase/client";

export interface ClassificationResult {
  category: string;
  confidence: number;
  response: string;
  priority: 'high' | 'medium' | 'low';
  requiresTicket?: boolean;
}

export const messageClassificationService = {
  async classifyMessage(message: string): Promise<ClassificationResult> {
    try {
      const { data, error } = await supabase.functions.invoke('classify-message', {
        body: { message }
      });

      if (error) {
        console.error('Error calling classify-message function:', error);
        // Fallback to basic classification
        return this.fallbackClassification(message);
      }

      return data as ClassificationResult;
    } catch (error) {
      console.error('Error in message classification:', error);
      return this.fallbackClassification(message);
    }
  },

  // Fallback classification when OpenAI is not available
  fallbackClassification(message: string): ClassificationResult {
    const lowerMessage = message.toLowerCase();
    
    // Basic keyword matching as fallback
    if (lowerMessage.includes('api') || lowerMessage.includes('error') || lowerMessage.includes('authentication')) {
      return {
        category: 'API Issue',
        confidence: 0.6,
        response: 'I see you\'re having API-related issues. Please check your API credentials and network connection. Try restarting your application and ensure your API endpoints are correct. Is this issue resolved? Please reply with "yes" or "no".',
        priority: 'high',
        requiresTicket: false
      };
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('transaction') || lowerMessage.includes('stuck')) {
      return {
        category: 'Transaction Delay',
        confidence: 0.6,
        response: 'I understand you\'re experiencing payment processing issues. Please check your internet connection, verify payment gateway settings, and try processing a test transaction. If the issue persists, restart the payment terminal. Is this issue resolved? Please reply with "yes" or "no".',
        priority: 'high',
        requiresTicket: false
      };
    }
    
    if (lowerMessage.includes('setup') || lowerMessage.includes('install') || lowerMessage.includes('training')) {
      return {
        category: 'Onboarding',
        confidence: 0.6,
        response: 'I can help you with setup and onboarding. Please check our setup guide in the documentation, ensure all prerequisites are met, and follow the step-by-step installation process. Is this issue resolved? Please reply with "yes" or "no".',
        priority: 'low',
        requiresTicket: false
      };
    }
    
    if (lowerMessage.includes('checkout') || lowerMessage.includes('barcode') || lowerMessage.includes('discount')) {
      return {
        category: 'Product Flow',
        confidence: 0.6,
        response: 'I can help you with the checkout process. Please verify that your barcode scanner is connected, check product codes in your inventory, and ensure discount settings are properly configured. Is this issue resolved? Please reply with "yes" or "no".',
        priority: 'medium',
        requiresTicket: false
      };
    }
    
    if (lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
      return {
        category: 'Inventory',
        confidence: 0.6,
        response: 'I can assist with inventory management. Please check your inventory synchronization settings, verify product data is up to date, and ensure your inventory tracking is enabled. Is this issue resolved? Please reply with "yes" or "no".',
        priority: 'medium',
        requiresTicket: false
      };
    }
    
    if (lowerMessage.includes('hardware') || lowerMessage.includes('printer') || lowerMessage.includes('scanner')) {
      return {
        category: 'Hardware Support',
        confidence: 0.6,
        response: 'I can help troubleshoot hardware issues. Please check all cable connections, restart the device, ensure drivers are updated, and verify power supply. Is this issue resolved? Please reply with "yes" or "no".',
        priority: 'high',
        requiresTicket: false
      };
    }
    
    return {
      category: 'General',
      confidence: 0.4,
      response: 'Thank you for your message. I\'ve reviewed your query and I\'m here to help. Could you provide more specific details about the issue you\'re experiencing? Is this issue resolved? Please reply with "yes" or "no".',
      priority: 'medium',
      requiresTicket: false
    };
  }
};
