/**
 * Shopping List Service
 * API calls for shopping list operations
 */

import { supabase } from '@/lib/supabase';
import type { ShoppingListItem, CreateShoppingListItemInput, UpdateShoppingListItemInput, MoveToCartInput } from '@/types';

export const shoppingListService = {
  async getAll(householdId: string): Promise<ShoppingListItem[]> {
    const { data, error } = await supabase
      .from('shopping_list_items')
      .select('*, item:items(*, category:categories(*))')
      .eq('household_id', householdId)
      .eq('is_in_cart', false)
      .order('priority', { ascending: false })
      .order('created_at');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<ShoppingListItem> {
    const { data, error } = await supabase
      .from('shopping_list_items')
      .select('*, item:items(*, category:categories(*))')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(input: CreateShoppingListItemInput, householdId: string): Promise<ShoppingListItem> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('shopping_list_items')
      .insert({ ...input, user_id: user.id, household_id: householdId, is_in_cart: false })
      .select('*, item:items(*, category:categories(*))')
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(input: UpdateShoppingListItemInput): Promise<ShoppingListItem> {
    const { id, ...updates } = input;
    const { data, error } = await supabase
      .from('shopping_list_items')
      .update(updates)
      .eq('id', id)
      .select('*, item:items(*, category:categories(*))')
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async moveToCart(input: MoveToCartInput): Promise<void> {
    const { shopping_list_item_id } = input;
    const { error } = await supabase
      .from('shopping_list_items')
      .update({ is_in_cart: true })
      .eq('id', shopping_list_item_id);
    
    if (error) throw error;
  },

  async removeFromCart(id: string): Promise<void> {
    const { error } = await supabase
      .from('shopping_list_items')
      .update({ is_in_cart: false })
      .eq('id', id);
    
    if (error) throw error;
  },
};
