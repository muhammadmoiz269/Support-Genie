
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, MessageSquare } from 'lucide-react';
import { classifyMessage, getKnowledgeBaseSuggestion } from '@/utils/messageProcessor';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  category?: string;
  suggestion?: string;
}

const WhatsAppSimulator = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const { toast } = useToast();

  const createSupportTicket = async (message: string, category: string) => {
    try {
      // Determine priority based on category
      const getPriority = (cat: string) => {
        switch (cat) {
          case 'API Issue':
            return 'high';
          case 'Transaction Delay':
            return 'high';
          case 'Product Flow':
            return 'medium';
          case 'Onboarding':
            return 'low';
          default:
            return 'medium';
        }
      };

      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          message,
          category,
          status: 'open',
          priority: getPriority(category)
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
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    // Classify the message
    const category = classifyMessage(currentMessage);
    userMessage.category = category;

    // Get knowledge base suggestion
    const suggestion = getKnowledgeBaseSuggestion(currentMessage);
    
    setMessages(prev => [...prev, userMessage]);

    // Always create a support ticket for every user query
    const ticketData = await createSupportTicket(currentMessage, category);
    
    if (ticketData) {
      toast({
        title: "Support ticket created!",
        description: `Ticket ${ticketData.id.slice(0, 8)} created with category: ${category}`,
      });
    }

    // Auto-respond if suggestion found, otherwise provide a generic response
    setTimeout(() => {
      const botResponse = suggestion || 
        "Thank you for your message. I've created a support ticket for your query and our team will review it. You can track the status in our support dashboard.";
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setCurrentMessage('');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'API Issue': 'bg-red-100 text-red-800',
      'Transaction Delay': 'bg-orange-100 text-orange-800',
      'Product Flow': 'bg-blue-100 text-blue-800',
      'Onboarding': 'bg-green-100 text-green-800',
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
                    <Badge className={`mt-2 text-xs ${getCategoryColor(message.category)}`}>
                      {message.category}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <Textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type a customer message..."
                className="flex-1 min-h-[40px] max-h-[120px]"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle>Classification Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-4">
              Every message creates a support ticket! Try these sample messages to see different categories:
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">API Issue (High Priority):</p>
                <p className="text-sm">"My API calls are returning 500 errors"</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Transaction Delay (High Priority):</p>
                <p className="text-sm">"My payment has been pending for 2 hours"</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Onboarding (Low Priority):</p>
                <p className="text-sm">"How do I set up my account?"</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-800">Product Flow (Medium Priority):</p>
                <p className="text-sm">"I can't find the checkout button"</p>
                <p className="text-xs text-blue-600 mt-1">Product-related queries get "Product Flow" category!</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">General (Medium Priority):</p>
                <p className="text-sm">"I have a custom integration question"</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppSimulator;
