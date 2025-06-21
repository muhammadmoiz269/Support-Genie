
// This file now serves as a fallback for basic classification when OpenAI is not available
// The main classification is now handled by the messageClassificationService

export const generateSampleTickets = () => {
  return [
    {
      id: 'TK-001',
      message: 'Card reader is showing connection errors during checkout',
      category: 'Hardware Support',
      status: 'open' as const,
      priority: 'high' as const,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      customer: 'store.manager@retailstore.com',
    },
    {
      id: 'TK-002',
      message: 'Payment has been stuck on processing for 15 minutes',
      category: 'Transaction Delay',
      status: 'pending' as const,
      priority: 'high' as const,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      customer: 'cashier@retailstore.com',
    },
    {
      id: 'TK-003',
      message: 'Need help setting up inventory tracking for new products',
      category: 'Inventory',
      status: 'closed' as const,
      priority: 'medium' as const,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      customer: 'inventory@retailstore.com',
    },
    {
      id: 'TK-004',
      message: 'Cannot find the discount button during checkout',
      category: 'Product Flow',
      status: 'open' as const,
      priority: 'medium' as const,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      customer: 'newcashier@retailstore.com',
    },
    {
      id: 'TK-005',
      message: 'Gift card balance not showing correctly',
      category: 'Gift Cards',
      status: 'open' as const,
      priority: 'medium' as const,
      createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      customer: 'customer.service@retailstore.com',
    },
  ];
};

// Legacy functions for backward compatibility
export const classifyMessage = (message: string): string => {
  // This is now a fallback - main classification happens via OpenAI
  return 'General';
};

export const getKnowledgeBaseSuggestion = (message: string): string | null => {
  // This is now a fallback - main suggestions come from OpenAI + Supabase
  return null;
};
