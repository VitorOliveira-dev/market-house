/**
 * Category Service
 * API calls for category operations
 */

import { supabase } from '@/lib/supabase';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types';

export const categoryService = {
  async getAll(householdId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('household_id', householdId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(input: CreateCategoryInput, householdId: string): Promise<Category> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .insert({ ...input, user_id: user.id, household_id: householdId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(input: UpdateCategoryInput): Promise<Category> {
    const { id, ...updates } = input;
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
