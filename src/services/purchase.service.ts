/**
 * Purchase Service
 * API calls for purchase operations
 */

import { supabase } from '@/lib/supabase';
import type { Purchase, CreatePurchaseInput, PurchaseWithItems, PurchaseItem } from '@/types';
import { cartService } from './cart.service';
import { shoppingListService } from './shopping-list.service';

export const purchaseService = {
  async getAll(householdId: string): Promise<Purchase[]> {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('household_id', householdId)
      .order('purchase_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<PurchaseWithItems> {
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', id)
      .single();
    
    if (purchaseError) throw purchaseError;

    const { data: items, error: itemsError } = await supabase
      .from('purchase_items')
      .select('*')
      .eq('purchase_id', id);
    
    if (itemsError) throw itemsError;

    return {
      ...purchase,
      items: items || [],
    };
  },

  async create(input: CreatePurchaseInput, householdId: string): Promise<Purchase> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get cart items
    const cartItems = await cartService.getAll(householdId);
    const selectedCartItems = cartItems.filter(item => 
      input.cart_items.includes(item.id)
    );

    if (selectedCartItems.length === 0) {
      throw new Error('No cart items selected');
    }

    const totalValue = selectedCartItems.reduce(
      (sum, item) => sum + Number(item.subtotal), 
      0
    );

    // Create purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        purchase_date: input.purchase_date || new Date().toISOString(),
        total_value: totalValue,
        store_name: input.store_name,
        payment_method: input.payment_method,
        notes: input.notes,
        user_id: user.id,
        household_id: householdId,
      })
      .select()
      .single();
    
    if (purchaseError) throw purchaseError;

    // Create purchase items and pantry items
    for (const cartItem of selectedCartItems) {
      // Create purchase item
      await supabase.from('purchase_items').insert({
        purchase_id: purchase.id,
        item_id: cartItem.item_id,
        quantity: cartItem.quantity,
        unit: cartItem.unit,
        price: cartItem.price,
        user_id: user.id,
        household_id: householdId,
      });

      // Add to pantry
      await supabase.from('pantry_items').insert({
        item_id: cartItem.item_id,
        quantity: cartItem.quantity,
        unit: cartItem.unit,
        purchase_id: purchase.id,
        user_id: user.id,
        household_id: householdId,
      });

      // Remove from cart
      await cartService.delete(cartItem.id);

      // Remove from shopping list if linked
      if (cartItem.shopping_list_item_id) {
        await shoppingListService.delete(cartItem.shopping_list_item_id);
      }
    }

    return purchase;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getStats(householdId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('purchases')
      .select('total_value, purchase_date')
      .eq('household_id', householdId);

    if (startDate) {
      query = query.gte('purchase_date', startDate);
    }
    if (endDate) {
      query = query.lte('purchase_date', endDate);
    }

    const { data, error } = await query;
    
    if (error) throw error;

    const total = data?.reduce((sum, p) => sum + Number(p.total_value), 0) || 0;
    const count = data?.length || 0;
    const average = count > 0 ? total / count : 0;

    return {
      total,
      count,
      average,
      purchases: data || [],
    };
  },
};
