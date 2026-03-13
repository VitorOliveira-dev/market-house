/**
 * Cart Hooks
 * React Query hooks for cart operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services';
import { useCurrentHousehold } from '@/features/households/context/household-context';
import type { CreateCartItemInput, UpdateCartItemInput } from '@/types';

export const CART_KEYS = {
  all: ['cart'] as const,
  lists: () => [...CART_KEYS.all, 'list'] as const,
  list: (householdId?: string, filters?: string) => [...CART_KEYS.lists(), householdId, filters] as const,
  details: () => [...CART_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CART_KEYS.details(), id] as const,
  summary: (householdId?: string) => [...CART_KEYS.all, 'summary', householdId] as const,
};

export function useCart() {
  const { currentHousehold } = useCurrentHousehold();
  
  return useQuery({
    queryKey: CART_KEYS.list(currentHousehold?.id),
    queryFn: () => cartService.getAll(currentHousehold!.id),
    enabled: !!currentHousehold,
  });
}

export function useCartSummary() {
  const { currentHousehold } = useCurrentHousehold();
  
  return useQuery({
    queryKey: CART_KEYS.summary(currentHousehold?.id),
    queryFn: () => cartService.getSummary(currentHousehold!.id),
    enabled: !!currentHousehold,
  });
}

export function useCartItem(id: string) {
  return useQuery({
    queryKey: CART_KEYS.detail(id),
    queryFn: () => cartService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCartItem() {
  const queryClient = useQueryClient();
  const { currentHousehold } = useCurrentHousehold();
  
  return useMutation({
    mutationFn: (input: CreateCartItemInput) => {
      if (!currentHousehold) throw new Error('No household selected');
      return cartService.create(input, currentHousehold.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: UpdateCartItemInput) => cartService.update(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CART_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
}

export function useDeleteCartItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => cartService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const { currentHousehold } = useCurrentHousehold();
  
  return useMutation({
    mutationFn: () => {
      if (!currentHousehold) throw new Error('No household selected');
      return cartService.clear(currentHousehold.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
}
