
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, BookOpen, Tag } from 'lucide-react';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
  lastUpdated: Date;
}

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    content: '',
    category: '',
    keywords: '',
  });

  const knowledgeItems: KnowledgeItem[] = [
    {
      id: '1',
      title: 'POS System API Authentication & Integration Issues',
      content: 'To resolve POS API authentication issues: 1) Ensure your API key is active and not expired (check your merchant dashboard), 2) Verify the API endpoint URL matches your environment (sandbox vs production), 3) Check that your IP address is whitelisted, 4) Confirm the Authorization header format: "Authorization: Bearer YOUR_API_KEY", 5) For payment processing APIs, ensure your merchant account is active and in good standing. Common error codes: 401 (invalid credentials), 403 (insufficient permissions), 429 (rate limit exceeded). If issues persist, regenerate your API key and update all integrations.',
      category: 'API Issue',
      keywords: ['api', 'authentication', 'token', 'bearer', 'authorization', 'integration', 'merchant', 'endpoint'],
      lastUpdated: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Payment Processing Delays and Transaction Issues',
      content: 'Payment processing in retail POS systems typically takes 2-5 seconds for card transactions and up to 10 seconds for mobile payments. Delays can occur due to: 1) Network connectivity issues (check internet connection), 2) Card reader hardware problems (clean card reader, check cables), 3) Bank authorization delays (especially for large amounts), 4) Insufficient funds or declined cards, 5) System overload during peak hours. For stuck transactions: check transaction status in your POS dashboard, void the transaction if necessary, and retry. Always provide receipt copies to customers for pending transactions. Contact support if delays exceed 2 minutes.',
      category: 'Transaction Delay',
      keywords: ['payment', 'transaction', 'delay', 'processing', 'stuck', 'card', 'mobile', 'receipt', 'void'],
      lastUpdated: new Date('2024-01-12'),
    },
    {
      id: '3',
      title: 'POS System Setup and Staff Onboarding Guide',
      content: 'Complete POS setup process: 1) Hardware installation: Connect card readers, receipt printers, cash drawers, and barcode scanners, 2) Software configuration: Install POS app, configure tax rates, set up product catalog with SKUs and pricing, 3) Payment setup: Configure payment processors (credit/debit cards, mobile payments, gift cards), 4) Staff training: Create user accounts with appropriate permissions, train on basic operations (sales, returns, inventory lookup), 5) Testing: Process test transactions, verify receipt printing, test all payment methods. For new employees: provide access to training materials, shadow experienced staff for first week, practice common scenarios (returns, discounts, split payments).',
      category: 'Onboarding',
      keywords: ['setup', 'installation', 'training', 'staff', 'onboarding', 'hardware', 'configuration', 'permissions'],
      lastUpdated: new Date('2024-01-10'),
    },
    {
      id: '4',
      title: 'POS Interface Navigation and Checkout Process',
      content: 'POS interface navigation: 1) Main screen shows product search, quick-add buttons for popular items, and current transaction total, 2) Use barcode scanner or manual SKU entry to add products, 3) Apply discounts via the "Discount" button (employee authorization may be required), 4) Process payments by selecting payment method (cash, card, mobile, gift card), 5) Complete sale and print receipt. For returns: use "Return" mode, scan items or enter manually, select reason, process refund to original payment method. Split payments: add partial payment amounts until total is covered. Customer display shows itemized list and running total.',
      category: 'Product Flow',
      keywords: ['navigation', 'interface', 'checkout', 'barcode', 'scanner', 'payment', 'receipt', 'returns', 'discounts'],
      lastUpdated: new Date('2024-01-08'),
    },
    {
      id: '5',
      title: 'Inventory Management and Stock Control',
      content: 'Inventory management features: 1) Real-time stock tracking: View current quantities, set low-stock alerts, track product movement, 2) Receiving inventory: Use "Receive Stock" function, scan items or enter manually, update quantities and costs, 3) Stock adjustments: Document shrinkage, damage, or corrections with reason codes, 4) Product catalog management: Add new products with SKUs, descriptions, categories, pricing tiers, 5) Reporting: Generate inventory reports, best-sellers analysis, slow-moving stock reports. Set up automatic reorder points for popular items. Use cycle counting for accuracy. Integration with suppliers for automated ordering available in premium plans.',
      category: 'Inventory',
      keywords: ['inventory', 'stock', 'tracking', 'receiving', 'adjustments', 'catalog', 'reorder', 'reports'],
      lastUpdated: new Date('2024-01-14'),
    },
    {
      id: '6',
      title: 'Customer Management and Loyalty Programs',
      content: 'Customer management system: 1) Customer profiles: Store contact information, purchase history, preferences, and notes, 2) Loyalty program setup: Configure points earning ($ spent = points), redemption rates, tier levels, 3) Customer lookup: Search by phone, email, or loyalty card number during checkout, 4) Marketing tools: Send promotional emails, birthday discounts, targeted offers based on purchase history, 5) Customer analytics: View customer lifetime value, frequency analysis, segmentation reports. During checkout: ask for phone number to add/lookup customer, apply loyalty discounts automatically, update points balance. Customer data is encrypted and GDPR compliant.',
      category: 'Customer Management',
      keywords: ['customer', 'loyalty', 'points', 'profiles', 'marketing', 'discounts', 'analytics', 'rewards'],
      lastUpdated: new Date('2024-01-13'),
    },
    {
      id: '7',
      title: 'End-of-Day Procedures and Cash Management',
      content: 'Daily closing procedures: 1) Cash count: Count all denominations in register, compare to system expected amount, 2) Credit card batch settlement: Process all pending card transactions (usually automatic), 3) Sales reporting: Generate daily sales summary, payment method breakdown, top-selling items, 4) Cash drop: Remove excess cash, leave starting amount for next day, document bank deposit, 5) System backup: Ensure all data is synced to cloud, 6) Security checklist: Lock cash drawer, secure terminals, set alarm system. For discrepancies: investigate transaction logs, check for voids/refunds, document any shortages. Weekly tasks: deep clean equipment, update product prices, review staff performance metrics.',
      category: 'Daily Operations',
      keywords: ['closing', 'cash', 'count', 'settlement', 'reporting', 'backup', 'security', 'procedures'],
      lastUpdated: new Date('2024-01-11'),
    },
    {
      id: '8',
      title: 'Troubleshooting Hardware Issues',
      content: 'Common POS hardware problems and solutions: 1) Receipt printer not working: Check paper roll, clean print head, verify USB/network connection, restart printer, 2) Card reader errors: Clean card slot, check cable connections, update drivers, test with known good card, 3) Barcode scanner issues: Clean scanner lens, check scan settings, verify USB connection, test scan distance, 4) Cash drawer not opening: Check power connection, verify drawer cable, manually open with key if needed, 5) Touchscreen problems: Clean screen, calibrate touch settings, check for physical damage. General troubleshooting: restart POS system, check all cable connections, update software/drivers. Keep spare cables and cleaning supplies on hand.',
      category: 'Hardware Support',
      keywords: ['hardware', 'printer', 'scanner', 'card reader', 'touchscreen', 'troubleshooting', 'cables', 'cleaning'],
      lastUpdated: new Date('2024-01-09'),
    },
    {
      id: '9',
      title: 'Multi-Location and Franchise Management',
      content: 'Multi-store management features: 1) Centralized dashboard: View sales across all locations, compare performance metrics, manage inventory transfers, 2) Location-specific settings: Configure local tax rates, pricing variations, staff permissions by store, 3) Inventory synchronization: Transfer stock between locations, view multi-location inventory levels, automatic reorder suggestions, 4) Reporting: Consolidated reports across all stores, location comparison analytics, regional performance tracking, 5) Staff management: Assign employees to specific locations, track hours and sales performance by store. Real-time synchronization ensures data consistency. Franchise owners can access only their location data while corporate sees everything.',
      category: 'Multi-Location',
      keywords: ['multi-location', 'franchise', 'centralized', 'transfers', 'synchronization', 'dashboard', 'regional'],
      lastUpdated: new Date('2024-01-07'),
    },
    {
      id: '10',
      title: 'Gift Cards and Store Credit Management',
      content: 'Gift card system management: 1) Issuing gift cards: Sell physical or digital cards, set custom amounts or fixed denominations, activate cards immediately, 2) Redemption process: Scan card barcode or enter card number, check balance, apply partial or full redemption, 3) Store credit: Issue for returns without receipt, set expiration dates, track usage history, 4) Card management: View all active cards, check balances, deactivate lost/stolen cards, generate usage reports, 5) Integration: Works with loyalty program, can be purchased online and used in-store. Cards never expire unless specified. Refund policies: store credit for returns over 30 days, cash refunds for returns within 30 days with receipt.',
      category: 'Gift Cards',
      keywords: ['gift cards', 'store credit', 'redemption', 'balance', 'activate', 'returns', 'refunds'],
      lastUpdated: new Date('2024-01-06'),
    }
  ];

  const categories = ['all', 'API Issue', 'Transaction Delay', 'Onboarding', 'Product Flow', 'Inventory', 'Customer Management', 'Daily Operations', 'Hardware Support', 'Multi-Location', 'Gift Cards', 'General'];

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = () => {
    // In a real application, this would save to a database
    console.log('Adding new knowledge base item:', newItem);
    setNewItem({ title: '', content: '', category: '', keywords: '' });
    setShowAddForm(false);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'API Issue': 'bg-red-100 text-red-800',
      'Transaction Delay': 'bg-orange-100 text-orange-800',
      'Product Flow': 'bg-blue-100 text-blue-800',
      'Onboarding': 'bg-green-100 text-green-800',
      'Inventory': 'bg-purple-100 text-purple-800',
      'Customer Management': 'bg-pink-100 text-pink-800',
      'Daily Operations': 'bg-yellow-100 text-yellow-800',
      'Hardware Support': 'bg-indigo-100 text-indigo-800',
      'Multi-Location': 'bg-teal-100 text-teal-800',
      'Gift Cards': 'bg-rose-100 text-rose-800',
      'General': 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.General;
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Retail POS Knowledge Base
            </CardTitle>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Article
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search POS knowledge base..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Add New Article Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add New Knowledge Article</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Article title"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
                <Textarea
                  placeholder="Article content"
                  value={newItem.content}
                  onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                  rows={4}
                />
                <Input
                  placeholder="Category"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                />
                <Input
                  placeholder="Keywords (comma-separated)"
                  value={newItem.keywords}
                  onChange={(e) => setNewItem({ ...newItem, keywords: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddItem}>Save Article</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Knowledge Articles */}
      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Last updated: {item.lastUpdated.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{item.content}</p>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <div className="flex gap-1 flex-wrap">
                  {item.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">Try adjusting your search terms or category filter.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KnowledgeBase;
