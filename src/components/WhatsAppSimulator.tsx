
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { messageClassificationService, type ClassificationResult } from "@/services/messageClassificationService";
import ConversationHandler from './ConversationHandler';
import axios from 'axios'
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  category?: string;
  confidence?: number;
  classification?: ClassificationResult;
  showConversationHandler?: boolean;
  correspondingUserMessageId?: string; // Link to the user message this bot response is for
}

const WhatsAppSimulator = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const ACCOUNT_SID = 'AC693f156e099cf22a58f1ba99695449a1';
        const AUTH_TOKEN = 'e0682014a48996dd537cdcd4acbde891';
        const FROM_NUMBER = 'whatsapp:+14155238886'; // Twilio sandbox
        const TO_NUMBER = `whatsapp:${+923102475070}`;

  useEffect(() => {
   const fetchMessages = async () => {
    try {
      const res = await axios.get('https://cbff3bec5748.ngrok-free.app/messages');
      const msgArray = res.data?.messages || [];
      const newest = msgArray[0];

      const lastMsg = messages[0];
      console.log("🚀 ~ fetchMessages ~ lastMsg:", lastMsg)

      const isDuplicate = lastMsg && new Date(lastMsg.timestamp).getTime() === new Date(newest.timestamp).getTime();

      console.log("🚀 ~ fetchMessages ~ msgArray:", msgArray, isDuplicate)

      if (!isDuplicate) {
        const formatted = {
          id: `${newest?.timestamp}-${Math.random()}`,
          text: newest?.body || `Hello ${messages.length}`,
          sender: newest?.from?.includes('whatsapp:+19477292251') ? ('bot' as const) : ('user' as const),
          timestamp: new Date(newest?.timestamp),
        };
        
        setMessages(prev => [...prev, formatted]);
      }
      // const formattedMessages = data.map((msg: any) => ({
      //   id: `${msg.timestamp}-${Math.random()}`,
      //   text: msg.body,
      //   sender: msg.from.includes('whatsapp:+14155238886') ? 'bot' : 'user',
      //   timestamp: new Date(msg.timestamp),
      // }));

      // setMessages(formattedMessages);
    } catch (error) {
      console.error('❌ Axios error while fetching messages:', error);
    }
  };

  fetchMessages(); // initial fetch
  const interval = setInterval(fetchMessages, 5000); // polling
  return () => clearInterval(interval); // cleanup
  }, []);

  const handleSendMessage = async () => {
    

    if (!currentMessage.trim() || isProcessing) return;

    setIsProcessing(true);

    
   
    let messageToProcess, errorData;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    try {

     
    // userMessage.text = jsonRes.body
    // if (response.ok) {
    //     console.log('✅ Message sent successfully!', response);

     
    
        setMessages(prev => [...prev, userMessage]);
        messageToProcess = currentMessage;
        setCurrentMessage('');

    // } else {
    //     errorData = await response.json();
    //     console.log(`❌ Failed: ${errorData.message}`);
    // }

      // Use Gemini-powered classification
      const classification = await messageClassificationService.classifyMessage(messageToProcess);
      
      userMessage.category = classification.category;
      userMessage.confidence = classification.confidence;
      userMessage.classification = classification;
      
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? userMessage : msg
      ));

      // Auto-respond with AI-generated response
      setTimeout(async () => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: classification.response,
          sender: 'bot',
          timestamp: new Date(),
          classification,
          showConversationHandler: true,
          correspondingUserMessageId: userMessage.id // Link this bot response to the specific user message
        };
        const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;

    const body = new URLSearchParams({
        From: FROM_NUMBER,
        To: TO_NUMBER,
        Body: botMessage.text
    });

    
      const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
    });

    let jsonRes = await response.json()
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

  const handleConversationComplete = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, showConversationHandler: false } : msg
    ));
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
      'Product Search & Filter': 'bg-lime-100 text-lime-800',
      'General': 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.General;
  };

  // Helper function to find the corresponding user message for a bot message
  const findCorrespondingUserMessage = (botMessage: Message): Message | undefined => {
    return messages.find(msg => msg.id === botMessage.correspondingUserMessageId);
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
              <div key={message.id} className="space-y-2">
                <div
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
                
                {message.showConversationHandler && message.classification && (
                  <ConversationHandler
                    originalMessage={findCorrespondingUserMessage(message)?.text || ''}
                    classification={message.classification}
                    onConversationComplete={() => handleConversationComplete(message.id)}
                  />
                )}
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
          <CardTitle>Enhanced AI Support System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-4">
              The AI now provides intelligent solutions and only creates tickets when needed! Try these sample messages:
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="font-medium text-red-800">API Issue:</p>
                <p className="text-sm">"My API calls are returning 500 errors and I can't process any transactions"</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="font-medium text-orange-800">Transaction Delay:</p>
                <p className="text-sm">"Customer payment has been pending for 30 minutes"</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-800">Product Flow:</p>
                <p className="text-sm">"How do I apply a discount to a customer's order?"</p>
              </div>
              <div className="p-3 bg-lime-50 rounded-lg border border-lime-200">
                <p className="font-medium text-lime-800">Search & Filter:</p>
                <p className="text-sm">"Search not working"</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800">✨ New Features:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• AI extracts relevant solutions from knowledge base</li>
                <li>• Provides step-by-step solutions</li>
                <li>• Asks for resolution confirmation</li>
                <li>• Only creates tickets when issues aren't resolved</li>
                <li>• Smart priority and category assignment</li>
                <li>• Correct message-to-ticket mapping</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppSimulator;
