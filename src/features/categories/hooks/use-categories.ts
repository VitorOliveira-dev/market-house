/**
 * Categories Hooks
 * React Query hooks for category operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services';
import { useCurrentHousehold } from '@/features/households/context/household-context';
import type { CreateCategoryInput, UpdateCategoryInput } from '@/types';

export const CATEGORY_KEYS = {
  all: ['categories'] as const,
  lists: () => [...CATEGORY_KEYS.all, 'list'] as const,
  list: (householdId?: string, filters?: string) => [...CATEGORY_KEYS.lists(), householdId, filters] as const,
  details: () => [...CATEGORY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CATEGORY_KEYS.details(), id] as const,
};

export function useCategories() {
  const { currentHousehold } = useCurrentHousehold();
  
  return useQuery({
    queryKey: CATEGORY_KEYS.list(currentHousehold?.id),
    queryFn: () => categoryService.getAll(currentHousehold!.id),
    enabled: !!currentHousehold,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: CATEGORY_KEYS.detail(id),
    queryFn: () => categoryService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { currentHousehold } = useCurrentHousehold();
  
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => {
      if (!currentHousehold) throw new Error('No household selected');
      return categoryService.create(input, currentHousehold.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => categoryService.update(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
    },
  });
}
