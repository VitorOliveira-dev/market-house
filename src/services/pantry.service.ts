/**
 * Pantry Service
 * API calls for pantry operations
 */

import { supabase } from '@/lib/supabase';
import type { PantryItem, CreatePantryItemInput, UpdatePantryItemInput, PantryAlert, PantrySummary } from '@/types';

export const pantryService = {
  async getAll(householdId: string): Promise<PantryItem[]> {
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*, item:items(*, category:categories(*))')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<PantryItem> {
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*, item:items(*, category:categories(*))')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(input: CreatePantryItemInput, householdId: string): Promise<PantryItem> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('pantry_items')
      .insert({ ...input, user_id: user.id, household_id: householdId })
      .select('*, item:items(*, category:categories(*))')
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(input: UpdatePantryItemInput): Promise<PantryItem> {
    const { id, ...updates } = input;
    const { data, error } = await supabase
      .from('pantry_items')
      .update(updates)
      .eq('id', id)
      .select('*, item:items(*, category:categories(*))')
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getAlerts(householdId: string): Promise<PantryAlert[]> {
    const items = await this.getAll(householdId);
    const alerts: PantryAlert[] = [];
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    for (const item of items) {
      // Check for low stock
      if (item.minimum_stock && item.quantity <= item.minimum_stock) {
        alerts.push({
          item,
          alert_type: 'low_stock',
          message: `${item.item?.name} está com estoque baixo (${item.quantity} ${item.unit || 'un'})`,
        });
      }

      // Check for expiring items
      if (item.expiration_date) {
        const expirationDate = new Date(item.expiration_date);
        
        if (expirationDate < today) {
          alerts.push({
            item,
            alert_type: 'expired',
            message: `${item.item?.name} venceu em ${expirationDate.toLocaleDateString('pt-BR')}`,
          });
        } else if (expirationDate <= sevenDaysFromNow) {
          alerts.push({
            item,
            alert_type: 'expiring_soon',
            message: `${item.item?.name} vence em ${expirationDate.toLocaleDateString('pt-BR')}`,
          });
        }
      }
    }

    return alerts;
  },

  async getSummary(householdId: string): Promise<PantrySummary> {
    const items = await this.getAll(householdId);
    const alerts = await this.getAlerts(householdId);

    return {
      total_items: items.length,
      low_stock_items: alerts.filter(a => a.alert_type === 'low_stock').length,
      expiring_soon_items: alerts.filter(a => a.alert_type === 'expiring_soon').length,
      expired_items: alerts.filter(a => a.alert_type === 'expired').length,
    };
  },

  async getLowStockItems(householdId: string): Promise<PantryItem[]> {
    const items = await this.getAll(householdId);
    return items.filter(item => 
      item.minimum_stock && item.quantity <= item.minimum_stock
    );
  },
};
