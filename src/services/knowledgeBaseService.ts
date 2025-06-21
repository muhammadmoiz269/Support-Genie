
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type KnowledgeBaseItem = Tables<'knowledge_base'>;

export const knowledgeBaseService = {
  // Fetch all knowledge base articles
  async getAll(): Promise<KnowledgeBaseItem[]> {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching knowledge base:', error);
      throw error;
    }

    return data || [];
  },

  // Fetch articles by category
  async getByCategory(category: string): Promise<KnowledgeBaseItem[]> {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching knowledge base by category:', error);
      throw error;
    }

    return data || [];
  },

  // Search articles by keywords
  async search(searchTerm: string): Promise<KnowledgeBaseItem[]> {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,keywords.cs.{${searchTerm}}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching knowledge base:', error);
      throw error;
    }

    return data || [];
  },

  // Add new article
  async create(article: Omit<KnowledgeBaseItem, 'id' | 'created_at' | 'updated_at'>): Promise<KnowledgeBaseItem> {
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert(article)
      .select()
      .single();

    if (error) {
      console.error('Error creating knowledge base article:', error);
      throw error;
    }

    return data;
  },

  // Update article
  async update(id: string, updates: Partial<Omit<KnowledgeBaseItem, 'id' | 'created_at'>>): Promise<KnowledgeBaseItem> {
    const { data, error } = await supabase
      .from('knowledge_base')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating knowledge base article:', error);
      throw error;
    }

    return data;
  },

  // Delete article
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting knowledge base article:', error);
      throw error;
    }
  },

  // Get unique categories
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('category')
      .order('category');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    const uniqueCategories = [...new Set(data?.map(item => item.category) || [])];
    return uniqueCategories;
  }
};
