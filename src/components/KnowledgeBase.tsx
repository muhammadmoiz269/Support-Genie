
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, BookOpen, Tag, RefreshCw } from 'lucide-react';
import { knowledgeBaseService, type KnowledgeBaseItem } from '@/services/knowledgeBaseService';
import { useToast } from "@/hooks/use-toast";

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeBaseItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    title: '',
    content: '',
    category: '',
    keywords: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchKnowledgeBase();
    fetchCategories();
  }, []);

  const fetchKnowledgeBase = async () => {
    try {
      setLoading(true);
      const items = await knowledgeBaseService.getAll();
      setKnowledgeItems(items);
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
      toast({
        title: "Error loading knowledge base",
        description: "Could not load knowledge base articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await knowledgeBaseService.getCategories();
      setCategories(['all', ...cats]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Filter items based on search and category
  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.content || !newItem.category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const keywordsArray = newItem.keywords.split(',').map(k => k.trim()).filter(k => k);
      
      await knowledgeBaseService.create({
        title: newItem.title,
        content: newItem.content,
        category: newItem.category,
        keywords: keywordsArray
      });

      toast({
        title: "Article created",
        description: "Knowledge base article has been created successfully",
      });

      setNewItem({ title: '', content: '', category: '', keywords: '' });
      setShowAddForm(false);
      fetchKnowledgeBase();
      fetchCategories();
    } catch (error) {
      console.error('Error creating article:', error);
      toast({
        title: "Error creating article",
        description: "Could not create the knowledge base article",
        variant: "destructive",
      });
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Retail POS Knowledge Base ({knowledgeItems.length} articles)
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={fetchKnowledgeBase} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Article
              </Button>
            </div>
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
                  placeholder="Article title *"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
                <Textarea
                  placeholder="Article content *"
                  value={newItem.content}
                  onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                  rows={4}
                />
                <Input
                  placeholder="Category *"
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
                      Last updated: {new Date(item.updated_at).toLocaleDateString()}
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

      {filteredItems.length === 0 && !loading && (
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
