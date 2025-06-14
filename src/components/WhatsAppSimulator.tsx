
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

  const isTaskMessage = (message: string): boolean => {
    const taskKeywords = ['task', 'todo', 'need to', 'schedule', 'reminder', 'meeting', 'deadline', 'complete', 'finish'];
    const lowerMessage = message.toLowerCase();
    return taskKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const createTaskFromMessage = async (message: string) => {
    try {
      // Create support ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          message,
          category: 'Task Request',
          status: 'open',
          priority: 'medium'
        })
        .select()
        .single();

      if (ticketError) {
        console.error('Error creating support ticket:', ticketError);
        return;
      }

      // Create task
      const { error: taskError } = await supabase
        .from('tasks')
        .insert({
          name: message.length > 50 ? message.substring(0, 47) + '...' : message,
          status: 'pending',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0]
        });

      if (taskError) {
        console.error('Error creating task:', taskError);
        return;
      }

      toast({
        title: "Task created successfully!",
        description: "A new task has been added to your dashboard.",
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error creating task",
        description: "There was an error creating the task. Please try again.",
        variant: "destructive",
      });
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

    // Auto-respond if suggestion found
    if (suggestion) {
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: suggestion,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);

      toast({
        title: "Auto-suggestion found!",
        description: `Classified as: ${category}`,
      });
    } else {
      // Check if it's a task-related message
      if (isTaskMessage(currentMessage)) {
        await createTaskFromMessage(currentMessage);
        
        setTimeout(() => {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "I've created a task for you based on your message. You can view it in the Support Dashboard.",
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, botMessage]);
        }, 1000);
      } else {
        toast({
          title: "Query logged for manual review",
          description: `Category: ${category} - No auto-suggestion available`,
          variant: "destructive",
        });
      }
    }

    setCurrentMessage('');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'API Issue': 'bg-red-100 text-red-800',
      'Transaction Delay': 'bg-orange-100 text-orange-800',
      'Product Flow': 'bg-blue-100 text-blue-800',
      'Onboarding': 'bg-green-100 text-green-800',
      'Task Request': 'bg-purple-100 text-purple-800',
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
              Try these sample messages to see the classification in action:
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">API Issue:</p>
                <p className="text-sm">"My API calls are returning 500 errors"</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Transaction Delay:</p>
                <p className="text-sm">"My payment has been pending for 2 hours"</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Onboarding:</p>
                <p className="text-sm">"How do I set up my account?"</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Product Flow:</p>
                <p className="text-sm">"I can't find the checkout button"</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-medium text-purple-800">Task Creation:</p>
                <p className="text-sm">"I need to schedule a meeting tomorrow"</p>
                <p className="text-xs text-purple-600 mt-1">Will create a task automatically!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppSimulator;
