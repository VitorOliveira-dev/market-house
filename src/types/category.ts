/**
 * Category types
 * Represents item categories for organization
 */

import { BaseEntity } from './database';

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  units?: string[]; // Available units for items in this category
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  units?: string[];
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}
