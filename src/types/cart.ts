/**
 * Cart types
 * Represents items ready to be purchased with prices
 */

import { BaseEntity } from './database';
import { Item } from './item';

export interface CartItem extends BaseEntity {
  item_id: string;
  item?: Item;
  quantity: number;
  unit?: string;
  price: number;
  subtotal: number; // quantity * price
  notes?: string;
  shopping_list_item_id?: string;
}

export interface CreateCartItemInput {
  item_id: string;
  quantity: number;
  unit?: string;
  price: number;
  notes?: string;
  shopping_list_item_id?: string;
}

export interface UpdateCartItemInput extends Partial<CreateCartItemInput> {
  id: string;
}

export interface CartSummary {
  items: CartItem[];
  total_items: number;
  total_value: number;
  last_updated: string;
}
