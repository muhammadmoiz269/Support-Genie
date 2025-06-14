
// Knowledge base with sample data
const knowledgeBase = [
  {
    keywords: ['api', 'error', '500', '404', 'authentication', 'token'],
    category: 'API Issue',
    response: 'I understand you\'re experiencing API issues. Please check your authentication token and ensure you\'re using the correct endpoint. If the issue persists, please share your API key (without sensitive data) for further assistance.',
  },
  {
    keywords: ['payment', 'transaction', 'pending', 'delay', 'stuck', 'processing'],
    category: 'Transaction Delay',
    response: 'I see your transaction is delayed. Most payments process within 5-10 minutes. If it\'s been longer, please provide your transaction ID and I\'ll check the status immediately.',
  },
  {
    keywords: ['account', 'setup', 'register', 'sign up', 'onboarding', 'getting started'],
    category: 'Onboarding',
    response: 'Welcome! I\'d be happy to help you set up your account. You can start by visiting our onboarding guide at /getting-started. Do you need help with any specific step?',
  },
  {
    keywords: ['checkout', 'button', 'interface', 'navigation', 'flow', 'product'],
    category: 'Product Flow',
    response: 'I can help you navigate our product. The checkout button is typically located at the bottom of your cart. If you\'re having trouble finding it, try refreshing the page or clearing your browser cache.',
  },
];

export const classifyMessage = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  for (const item of knowledgeBase) {
    if (item.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return item.category;
    }
  }
  
  return 'General';
};

export const getKnowledgeBaseSuggestion = (message: string): string | null => {
  const lowerMessage = message.toLowerCase();
  
  for (const item of knowledgeBase) {
    if (item.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return item.response;
    }
  }
  
  return null;
};

// Sample tickets for the dashboard
export const generateSampleTickets = () => {
  return [
    {
      id: 'TK-001',
      message: 'My API calls are returning 500 errors consistently',
      category: 'API Issue',
      status: 'open',
      priority: 'high',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      customer: 'john.doe@example.com',
    },
    {
      id: 'TK-002',
      message: 'Payment has been pending for over an hour',
      category: 'Transaction Delay',
      status: 'pending',
      priority: 'medium',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      customer: 'jane.smith@example.com',
    },
    {
      id: 'TK-003',
      message: 'Need help understanding the webhook configuration',
      category: 'General',
      status: 'closed',
      priority: 'low',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      customer: 'support@company.com',
    },
    {
      id: 'TK-004',
      message: 'Cannot find the integration settings page',
      category: 'Product Flow',
      status: 'open',
      priority: 'medium',
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      customer: 'admin@startup.io',
    },
  ];
};
