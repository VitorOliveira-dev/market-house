/**
 * Shopping List Hooks
 * React Query hooks for shopping list operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shoppingListService, cartService } from '@/services';
import { useCurrentHousehold } from '@/features/households/context/household-context';
import type { CreateShoppingListItemInput, UpdateShoppingListItemInput, CreateCartItemInput } from '@/types';

export const SHOPPING_LIST_KEYS = {
  all: ['shopping-list'] as const,
  lists: () => [...SHOPPING_LIST_KEYS.all, 'list'] as const,
  list: (householdId?: string, filters?: string) => [...SHOPPING_LIST_KEYS.lists(), householdId, filters] as const,
  details: () => [...SHOPPING_LIST_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SHOPPING_LIST_KEYS.details(), id] as const,
};

export function useShoppingList() {
  const { currentHousehold } = useCurrentHousehold();
  
  return useQuery({
    queryKey: SHOPPING_LIST_KEYS.list(currentHousehold?.id),
    queryFn: () => shoppingListService.getAll(currentHousehold!.id),
    enabled: !!currentHousehold,
  });
}

export function useShoppingListItem(id: string) {
  return useQuery({
    queryKey: SHOPPING_LIST_KEYS.detail(id),
    queryFn: () => shoppingListService.getById(id),
    enabled: !!id,
  });
}

export function useCreateShoppingListItem() {
  const queryClient = useQueryClient();
  const { currentHousehold } = useCurrentHousehold();
  
  return useMutation({
    mutationFn: (input: CreateShoppingListItemInput) => {
      if (!currentHousehold) throw new Error('No household selected');
      return shoppingListService.create(input, currentHousehold.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_KEYS.lists() });
    },
  });
}

export function useUpdateShoppingListItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: UpdateShoppingListItemInput) => shoppingListService.update(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteShoppingListItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => shoppingListService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_KEYS.lists() });
    },
  });
}

export function useMoveToCart() {
  const queryClient = useQueryClient();
  const { currentHousehold } = useCurrentHousehold();
  
  return useMutation({
    mutationFn: async (params: { shoppingListItemId: string; price: number }) => {
      if (!currentHousehold) throw new Error('No household selected');
      
      const item = await shoppingListService.getById(params.shoppingListItemId);
      
      // Create cart item
      const cartInput: CreateCartItemInput = {
        item_id: item.item_id,
        quantity: item.quantity,
        unit: item.unit,
        price: params.price,
        notes: item.notes,
        shopping_list_item_id: item.id,
      };
      
      await cartService.create(cartInput, currentHousehold.id);
      await shoppingListService.delete(params.shoppingListItemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
