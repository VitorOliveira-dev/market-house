/**
 * Cart Service
 * API calls for cart operations
 */

import { supabase } from '@/lib/supabase';
import type { CartItem, CreateCartItemInput, UpdateCartItemInput, CartSummary } from '@/types';

export const cartService = {
  async getAll(householdId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, item:items(*, category:categories(*))')
      .eq('household_id', householdId)
      .order('created_at');
    
    if (error) throw error;
    return data || [];
  },

  async getSummary(householdId: string): Promise<CartSummary> {
    const items = await this.getAll(householdId);
    const totalValue = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    
    return {
      items,
      total_items: items.length,
      total_value: totalValue,
      last_updated: new Date().toISOString(),
    };
  },

  async getById(id: string): Promise<CartItem> {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, item:items(*, category:categories(*))')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(input: CreateCartItemInput, householdId: string): Promise<CartItem> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('cart_items')
      .insert({ ...input, user_id: user.id, household_id: householdId })
      .select('*, item:items(*, category:categories(*))')
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(input: UpdateCartItemInput): Promise<CartItem> {
    const { id, ...updates } = input;
    const { data, error } = await supabase
      .from('cart_items')
      .update(updates)
      .eq('id', id)
      .select('*, item:items(*, category:categories(*))')
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async clear(householdId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('household_id', householdId);
    
    if (error) throw error;
  },
};
