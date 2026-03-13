/**
 * Item Service
 * API calls for item operations
 */

import { supabase } from '@/lib/supabase';
import type { Item, CreateItemInput, UpdateItemInput } from '@/types';

export const itemService = {
  async getAll(householdId: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*, category:categories(*)')
      .eq('household_id', householdId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .select('*, category:categories(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByCategory(categoryId: string, householdId: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*, category:categories(*)')
      .eq('category_id', categoryId)
      .eq('household_id', householdId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async create(input: CreateItemInput, householdId: string): Promise<Item> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('items')
      .insert({ ...input, user_id: user.id, household_id: householdId })
      .select('*, category:categories(*)')
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(input: UpdateItemInput): Promise<Item> {
    const { id, ...updates } = input;
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async search(query: string, householdId: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*, category:categories(*)')
      .eq('household_id', householdId)
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(20);
    
    if (error) throw error;
    return data || [];
  },
};
