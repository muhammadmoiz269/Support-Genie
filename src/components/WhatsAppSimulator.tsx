
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { messageClassificationService, type ClassificationResult } from "@/services/messageClassificationService";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  category?: string;
  confidence?: number;
}

const WhatsAppSimulator = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const createSupportTicket = async (message: string, classification: ClassificationResult) => {
    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          message,
          category: classification.category,
          status: 'open',
          priority: classification.priority
        })
        .select()
        .single();

      if (ticketError) {
        console.error('Error creating support ticket:', ticketError);
        return null;
      }

      return ticketData;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      toast({
        title: "Error creating ticket",
        description: "There was an error creating the support ticket. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;

    setIsProcessing(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');

    try {
      // Use OpenAI-powered classification
      const classification = await messageClassificationService.classifyMessage(currentMessage);
      
      userMessage.category = classification.category;
      userMessage.confidence = classification.confidence;
      
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? userMessage : msg
      ));

      // Create support ticket
      const ticketData = await createSupportTicket(currentMessage, classification);
      
      if (ticketData) {
        toast({
          title: "Support ticket created!",
          description: `Ticket ${ticketData.id.slice(0, 8)} created with category: ${classification.category} (${Math.round(classification.confidence * 100)}% confidence)`,
        });
      }

      // Auto-respond with AI-generated response
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: classification.response,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);

    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Processing error",
        description: "There was an error processing your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'API Issue': 'bg-red-100 text-red-800',
      'Transaction Delay': 'bg-orange-100 text-orange-800',
      'Product Flow': 'bg-blue-100 text-blue-800',
      'Onboarding': 'bg-green-100 text-green-800',
      'Inventory': 'bg-purple-100 text-purple-800',
      'Customer Management': 'bg-teal-100 text-teal-800',
      'Daily Operations': 'bg-indigo-100 text-indigo-800',
      'Hardware Support': 'bg-yellow-100 text-yellow-800',
      'Multi-Location': 'bg-pink-100 text-pink-800',
      'Gift Cards': 'bg-cyan-100 text-cyan-800',
      'General': 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.General;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="bg-green-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp Chat Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-green-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.sender === 'user' ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3" />
                    )}
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{message.text}</p>
                  {message.category && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge className={`text-xs ${getCategoryColor(message.category)}`}>
                        {message.category}
                      </Badge>
                      {message.confidence && (
                        <span className="text-xs opacity-60">
                          {Math.round(message.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-lg rounded-bl-sm shadow-sm px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-3 w-3" />
                    <span className="text-sm">AI is analyzing your message...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <Textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type a customer message..."
                className="flex-1 min-h-[40px] max-h-[120px]"
                disabled={isProcessing}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage} 
                size="icon"
                disabled={isProcessing || !currentMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle>AI-Powered Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-4">
              Every message is now analyzed by AI using OpenAI API and knowledge base from Supabase! Try these sample messages:
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="font-medium text-red-800">API Issue (High Priority):</p>
                <p className="text-sm">"My API calls are returning 500 errors and I can't process any transactions"</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="font-medium text-orange-800">Transaction Delay (High Priority):</p>
                <p className="text-sm">"Customer payment has been pending for 30 minutes and they're getting frustrated"</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="font-medium text-yellow-800">Hardware Support (High Priority):</p>
                <p className="text-sm">"Our receipt printer stopped working during peak hours"</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-800">Product Flow (Medium Priority):</p>
                <p className="text-sm">"I can't find how to apply a discount to a customer's order"</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-medium text-green-800">Onboarding (Low Priority):</p>
                <p className="text-sm">"How do I set up user accounts for my new employees?"</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800">✨ New Features:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• AI-powered message classification with confidence scores</li>
                <li>• Dynamic knowledge base from Supabase</li>
                <li>• Intelligent priority assignment</li>
                <li>• Context-aware responses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppSimulator;
