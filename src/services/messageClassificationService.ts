
import { supabase } from "@/integrations/supabase/client";

export interface ClassificationResult {
  category: string;
  confidence: number;
  response: string;
  priority: 'high' | 'medium' | 'low';
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
        response: 'I see you\'re having API-related issues. Please check your API credentials and try again.',
        priority: 'high'
      };
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('transaction') || lowerMessage.includes('stuck')) {
      return {
        category: 'Transaction Delay',
        confidence: 0.6,
        response: 'I understand you\'re experiencing payment processing issues. Please check your connection and try again.',
        priority: 'high'
      };
    }
    
    if (lowerMessage.includes('setup') || lowerMessage.includes('install') || lowerMessage.includes('training')) {
      return {
        category: 'Onboarding',
        confidence: 0.6,
        response: 'I can help you with setup and onboarding. Please let me know what specific area you need assistance with.',
        priority: 'low'
      };
    }
    
    if (lowerMessage.includes('checkout') || lowerMessage.includes('barcode') || lowerMessage.includes('discount')) {
      return {
        category: 'Product Flow',
        confidence: 0.6,
        response: 'I can help you with the checkout process and product flow. What specific issue are you experiencing?',
        priority: 'medium'
      };
    }
    
    if (lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
      return {
        category: 'Inventory',
        confidence: 0.6,
        response: 'I can assist with inventory management. Please describe your specific inventory question.',
        priority: 'medium'
      };
    }
    
    if (lowerMessage.includes('hardware') || lowerMessage.includes('printer') || lowerMessage.includes('scanner')) {
      return {
        category: 'Hardware Support',
        confidence: 0.6,
        response: 'I can help troubleshoot hardware issues. Please describe the specific hardware problem you\'re experiencing.',
        priority: 'high'
      };
    }
    
    return {
      category: 'General',
      confidence: 0.4,
      response: 'Thank you for your message. I\'ve created a support ticket and our team will review it.',
      priority: 'medium'
    };
  }
};
