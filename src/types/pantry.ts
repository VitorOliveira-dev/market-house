/**
 * Pantry types
 * Represents items currently in stock at home
 */

import { BaseEntity } from './database';
import { Item } from './item';

export interface PantryItem extends BaseEntity {
  item_id: string;
  item?: Item;
  quantity: number;
  unit?: string;
  expiration_date?: string;
  purchase_id?: string;
  location?: string; // geladeira, armário, etc
  minimum_stock?: number; // quantidade mínima para sugerir recompra
  notes?: string;
}

export interface CreatePantryItemInput {
  item_id: string;
  quantity: number;
  unit?: string;
  expiration_date?: string;
  purchase_id?: string;
  location?: string;
  minimum_stock?: number;
  notes?: string;
}

export interface UpdatePantryItemInput extends Partial<CreatePantryItemInput> {
  id: string;
}

export interface PantryAlert {
  item: PantryItem;
  alert_type: 'low_stock' | 'expiring_soon' | 'expired';
  message: string;
}

export interface PantrySummary {
  total_items: number;
  low_stock_items: number;
  expiring_soon_items: number;
  expired_items: number;
}
