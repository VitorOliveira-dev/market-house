/**
 * Base types for database entities
 * All entities share these common fields for audit control
 */

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export type EntityStatus = 'active' | 'inactive' | 'deleted';

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
