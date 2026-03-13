/**
 * Shopping List types
 * Represents items that need to be purchased
 */

import { BaseEntity } from './database';
import { Item } from './item';

export interface ShoppingListItem extends BaseEntity {
  item_id: string;
  item?: Item;
  quantity: number;
  unit?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  is_in_cart: boolean;
}

export interface CreateShoppingListItemInput {
  item_id: string;
  quantity: number;
  unit?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateShoppingListItemInput extends Partial<CreateShoppingListItemInput> {
  id: string;
}

export interface MoveToCartInput {
  shopping_list_item_id: string;
  quantity?: number;
}
