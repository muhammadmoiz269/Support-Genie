
// Enhanced knowledge base with detailed retail POS content
const knowledgeBase = [
  {
    keywords: ['api', 'error', '500', '404', 'authentication', 'token', 'integration', 'merchant', 'endpoint'],
    category: 'API Issue',
    response: 'I understand you\'re experiencing POS API issues. Please check: 1) Your API key is active in your merchant dashboard, 2) You\'re using the correct endpoint (sandbox vs production), 3) Your IP is whitelisted, 4) Authorization header format is correct. Common errors: 401 (invalid credentials), 403 (insufficient permissions), 429 (rate limit). If issues persist, regenerate your API key.',
  },
  {
    keywords: ['payment', 'transaction', 'pending', 'delay', 'stuck', 'processing', 'card', 'mobile', 'receipt'],
    category: 'Transaction Delay',
    response: 'I see your payment is delayed. POS transactions typically take 2-5 seconds for cards, up to 10 seconds for mobile payments. Please check: 1) Internet connection, 2) Card reader hardware, 3) Transaction status in your POS dashboard. For stuck transactions over 2 minutes, you can void and retry. Always provide receipt copies for pending transactions.',
  },
  {
    keywords: ['setup', 'install', 'register', 'onboarding', 'training', 'staff', 'hardware', 'configuration'],
    category: 'Onboarding',
    response: 'Welcome to our POS system! For setup: 1) Connect hardware (card readers, printers, scanners), 2) Configure software (tax rates, product catalog), 3) Set up payments, 4) Create staff accounts with permissions, 5) Run test transactions. I can guide you through any specific step. New staff should shadow experienced team members initially.',
  },
  {
    keywords: ['checkout', 'interface', 'navigation', 'barcode', 'scanner', 'product', 'flow', 'returns', 'discounts'],
    category: 'Product Flow',
    response: 'For POS navigation: 1) Main screen shows product search and transaction total, 2) Use barcode scanner or manual SKU entry, 3) Apply discounts via "Discount" button, 4) Select payment method to complete sale, 5) Print receipt. For returns: use "Return" mode, scan items, select reason, process refund. Split payments are supported by adding partial amounts.',
  },
  {
    keywords: ['inventory', 'stock', 'tracking', 'receiving', 'catalog', 'reorder', 'reports', 'adjustments'],
    category: 'Inventory',
    response: 'For inventory management: 1) View real-time stock levels and set low-stock alerts, 2) Use "Receive Stock" to update quantities, 3) Make stock adjustments with reason codes, 4) Manage product catalog with SKUs and pricing, 5) Generate inventory reports. Set automatic reorder points for popular items and use cycle counting for accuracy.',
  },
  {
    keywords: ['customer', 'loyalty', 'points', 'rewards', 'profiles', 'marketing', 'email'],
    category: 'Customer Management',
    response: 'Our customer management system allows you to: 1) Store customer profiles with contact info and purchase history, 2) Set up loyalty programs with points and tiers, 3) Search customers by phone/email during checkout, 4) Send targeted marketing campaigns, 5) View customer analytics. Ask for phone numbers during checkout to build your customer database.',
  },
  {
    keywords: ['closing', 'cash', 'count', 'settlement', 'end of day', 'procedures', 'backup'],
    category: 'Daily Operations',
    response: 'For end-of-day procedures: 1) Count cash in register and compare to expected amount, 2) Process credit card batch settlement, 3) Generate daily sales reports, 4) Make cash drop and prepare bank deposit, 5) Backup system data, 6) Complete security checklist. Document any discrepancies and investigate transaction logs.',
  },
  {
    keywords: ['hardware', 'printer', 'scanner', 'card reader', 'troubleshooting', 'cables', 'touchscreen'],
    category: 'Hardware Support',
    response: 'For hardware issues: 1) Receipt printer: check paper, clean print head, verify connections, 2) Card reader: clean slot, check cables, test with known card, 3) Scanner: clean lens, check settings and distance, 4) Cash drawer: verify power and cable connections, 5) Touchscreen: clean and calibrate. Try restarting the system and checking all connections first.',
  },
  {
    keywords: ['multi-location', 'franchise', 'transfers', 'centralized', 'multiple stores'],
    category: 'Multi-Location',
    response: 'Our multi-location features include: 1) Centralized dashboard for all stores, 2) Location-specific settings and permissions, 3) Inventory transfers between locations, 4) Consolidated reporting across stores, 5) Staff management by location. Real-time sync ensures data consistency. Franchise owners see only their data while corporate has full access.',
  },
  {
    keywords: ['gift cards', 'store credit', 'balance', 'redeem', 'activate'],
    category: 'Gift Cards',
    response: 'For gift card management: 1) Issue physical or digital cards with custom or fixed amounts, 2) Redeem by scanning barcode or entering number, 3) Check balances and apply partial redemptions, 4) Issue store credit for returns, 5) Manage card status and generate reports. Cards integrate with loyalty programs and work across all locations.',
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

// Sample tickets for the dashboard with retail POS context
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
