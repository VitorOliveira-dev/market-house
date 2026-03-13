/**
 * Purchases Hooks
 * React Query hooks for purchase operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseService } from '@/services';
import { useCurrentHousehold } from '@/features/households/context/household-context';
import type { CreatePurchaseInput } from '@/types';
import { CART_KEYS } from '../../cart/hooks/use-cart';
import { PANTRY_KEYS } from '../../pantry/hooks/use-pantry';
import { SHOPPING_LIST_KEYS } from '../../shopping-list/hooks/use-shopping-list';

export const PURCHASE_KEYS = {
  all: ['purchases'] as const,
  lists: () => [...PURCHASE_KEYS.all, 'list'] as const,
  list: (householdId?: string, filters?: string) => [...PURCHASE_KEYS.lists(), householdId, filters] as const,
  details: () => [...PURCHASE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PURCHASE_KEYS.details(), id] as const,
  stats: (householdId?: string, startDate?: string, endDate?: string) => 
    [...PURCHASE_KEYS.all, 'stats', householdId, startDate, endDate] as const,
};

export function usePurchases() {
  const { currentHousehold } = useCurrentHousehold();
  
  return useQuery({
    queryKey: PURCHASE_KEYS.list(currentHousehold?.id),
    queryFn: () => purchaseService.getAll(currentHousehold!.id),
    enabled: !!currentHousehold,
  });
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: PURCHASE_KEYS.detail(id),
    queryFn: () => purchaseService.getById(id),
    enabled: !!id,
  });
}

export function usePurchaseStats(startDate?: string, endDate?: string) {
  const { currentHousehold } = useCurrentHousehold();
  
  return useQuery({
    queryKey: PURCHASE_KEYS.stats(currentHousehold?.id, startDate, endDate),
    queryFn: () => purchaseService.getStats(currentHousehold!.id, startDate, endDate),
    enabled: !!currentHousehold,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  const { currentHousehold } = useCurrentHousehold();
  
  return useMutation({
    mutationFn: (input: CreatePurchaseInput) => {
      if (!currentHousehold) throw new Error('No household selected');
      return purchaseService.create(input, currentHousehold.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CART_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PANTRY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PANTRY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_KEYS.lists() });
    },
  });
}

export function useDeletePurchase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => purchaseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.lists() });
    },
  });
}
