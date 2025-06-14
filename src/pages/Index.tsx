
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WhatsAppSimulator from '@/components/WhatsAppSimulator';
import SupportDashboard from '@/components/SupportDashboard';
import KnowledgeBase from '@/components/KnowledgeBase';
import { MessageSquare, Dashboard, BookOpen } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Customer Support Automation System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Intelligent WhatsApp request classification, auto-suggestions from knowledge base, 
            and comprehensive support dashboard for your team.
          </p>
        </div>

        <Tabs defaultValue="simulator" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="simulator" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              WhatsApp Simulator
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Dashboard className="h-4 w-4" />
              Support Dashboard
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Knowledge Base
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simulator">
            <WhatsAppSimulator />
          </TabsContent>

          <TabsContent value="dashboard">
            <SupportDashboard />
          </TabsContent>

          <TabsContent value="knowledge">
            <KnowledgeBase />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
