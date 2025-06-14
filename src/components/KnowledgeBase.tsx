
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
      title: 'API Authentication Issues',
      content: 'To resolve API authentication issues, ensure you are using a valid API key in the Authorization header. The format should be: Authorization: Bearer YOUR_API_KEY. Common issues include expired tokens, incorrect key format, or missing permissions.',
      category: 'API Issue',
      keywords: ['api', 'authentication', 'token', 'bearer', 'authorization'],
      lastUpdated: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Transaction Processing Delays',
      content: 'Payment processing typically takes 3-5 minutes. Delays can occur due to bank verification, network issues, or high traffic. If a transaction is stuck for more than 10 minutes, check the transaction status in your dashboard or contact support with the transaction ID.',
      category: 'Transaction Delay',
      keywords: ['payment', 'transaction', 'delay', 'processing', 'stuck'],
      lastUpdated: new Date('2024-01-12'),
    },
    {
      id: '3',
      title: 'Account Setup Guide',
      content: 'To set up your account: 1) Visit the registration page, 2) Verify your email address, 3) Complete your profile information, 4) Set up two-factor authentication, 5) Generate your API keys. For business accounts, additional verification may be required.',
      category: 'Onboarding',
      keywords: ['account', 'setup', 'registration', 'verification', 'onboarding'],
      lastUpdated: new Date('2024-01-10'),
    },
    {
      id: '4',
      title: 'Product Navigation Help',
      content: 'Our interface is designed for ease of use. The main navigation is in the sidebar, with quick actions in the top bar. Use the search function to find specific features. The checkout process is accessible from your cart icon in the top right corner.',
      category: 'Product Flow',
      keywords: ['navigation', 'interface', 'checkout', 'cart', 'sidebar'],
      lastUpdated: new Date('2024-01-08'),
    },
  ];

  const categories = ['all', 'API Issue', 'Transaction Delay', 'Onboarding', 'Product Flow', 'General'];

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
              Knowledge Base Management
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
                placeholder="Search knowledge base..."
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
