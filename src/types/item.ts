/**
 * Item types
 * Represents items that can be added to shopping lists
 */

import { BaseEntity } from './database';
import { Category } from './category';

export interface Item extends BaseEntity {
  name: string;
  description?: string;
  category_id: string;
  category?: Category;
  usual_price?: number;
  barcode?: string;
  image_url?: string;
}

export interface CreateItemInput {
  name: string;
  description?: string;
  category_id: string;
  usual_price?: number;
  barcode?: string;
  image_url?: string;
}

export interface UpdateItemInput extends Partial<CreateItemInput> {
  id: string;
}
