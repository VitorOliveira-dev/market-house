/**
 * Purchase types
 * Represents completed shopping transactions
 */

import { BaseEntity } from './database';
import { CartItem } from './cart';

export interface Purchase extends BaseEntity {
  purchase_date: string;
  total_value: number;
  store_name?: string;
  payment_method?: string;
  notes?: string;
}

export interface PurchaseItem extends BaseEntity {
  purchase_id: string;
  item_id: string;
  quantity: number;
  unit?: string;
  price: number;
  subtotal: number;
}

export interface CreatePurchaseInput {
  purchase_date?: string;
  store_name?: string;
  payment_method?: string;
  notes?: string;
  cart_items: string[]; // IDs of cart items to include
}

export interface PurchaseWithItems extends Purchase {
  items: PurchaseItem[];
}
