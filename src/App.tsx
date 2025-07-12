import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import WhatsAppSimulator from '@/components/WhatsAppSimulator';
import SupportDashboard from '@/components/SupportDashboard';
import KnowledgeBase from '@/components/KnowledgeBase';
import UserManagement from '@/components/UserManagement';
import { MessageSquare, BarChart3, BookOpen, Users } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('simulator');

  return (
    <>
      <Toaster />

      <nav className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('simulator')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === 'simulator'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp Simulator
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === 'dashboard'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Support Dashboard
              </button>
              <button
                onClick={() => setActiveTab('knowledge')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === 'knowledge'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                }`}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Knowledge Base
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === 'users'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                User Management
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'simulator' && <WhatsAppSimulator />}
        {activeTab === 'dashboard' && <SupportDashboard />}
        {activeTab === 'knowledge' && <KnowledgeBase />}
        {activeTab === 'users' && <UserManagement />}
      </main>
    </>
  );
}

export default App;
