/**
 * Items Hooks
 * React Query hooks for item operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemService } from '@/services';
import { useCurrentHousehold } from '@/features/households/context/household-context';
import type { CreateItemInput, UpdateItemInput } from '@/types';

export const ITEM_KEYS = {
  all: ['items'] as const,
  lists: () => [...ITEM_KEYS.all, 'list'] as const,
  list: (householdId?: string, filters?: string) => [...ITEM_KEYS.lists(), householdId, filters] as const,
  details: () => [...ITEM_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ITEM_KEYS.details(), id] as const,
  byCategory: (categoryId: string, householdId?: string) => [...ITEM_KEYS.all, 'category', categoryId, householdId] as const,
  search: (query: string, householdId?: string) => [...ITEM_KEYS.all, 'search', query, householdId] as const,
};

export function useItems() {
  const { currentHousehold } = useCurrentHousehold();
  
  return useQuery({
    queryKey: ITEM_KEYS.list(currentHousehold?.id),
    queryFn: () => itemService.getAll(currentHousehold!.id),
    enabled: !!currentHousehold,
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ITEM_KEYS.detail(id),
    queryFn: () => itemService.getById(id),
    enabled: !!id,
  });
}

export function useItemsByCategory(categoryId: string) {
  const { currentHousehold } = useCurrentHousehold();
  
  return useQuery({
    queryKey: ITEM_KEYS.byCategory(categoryId, currentHousehold?.id),
    queryFn: () => itemService.getByCategory(categoryId, currentHousehold!.id),
    enabled: !!categoryId && !!currentHousehold,
  });
}

export function useSearchItems(query: string) {
  const { currentHousehold } = useCurrentHousehold();
  
  return useQuery({
    queryKey: ITEM_KEYS.search(query, currentHousehold?.id),
    queryFn: () => itemService.search(query, currentHousehold!.id),
    enabled: query.length > 2 && !!currentHousehold,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  const { currentHousehold } = useCurrentHousehold();
  
  return useMutation({
    mutationFn: (input: CreateItemInput) => {
      if (!currentHousehold) throw new Error('No household selected');
      return itemService.create(input, currentHousehold.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.lists() });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: UpdateItemInput) => itemService.update(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => itemService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.lists() });
    },
  });
}
