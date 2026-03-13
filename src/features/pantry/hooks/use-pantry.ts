/**
 * Pantry Hooks
 * React Query hooks for pantry operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pantryService } from '@/services';
import { useCurrentHousehold } from '@/features/households/context/household-context';
import type { CreatePantryItemInput, UpdatePantryItemInput } from '@/types';

export const PANTRY_KEYS = {
  all: ['pantry'] as const,
  lists: () => [...PANTRY_KEYS.all, 'list'] as const,
  list: (householdId?: string, filters?: string) => [...PANTRY_KEYS.lists(), householdId, filters] as const,
  details: () => [...PANTRY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PANTRY_KEYS.details(), id] as const,
  alerts: (householdId?: string) => [...PANTRY_KEYS.all, 'alerts', householdId] as const,
  summary: (householdId?: string) => [...PANTRY_KEYS.all, 'summary', householdId] as const,
  lowStock: (householdId?: string) => [...PANTRY_KEYS.all, 'low-stock', householdId] as const,
};

export function usePantry() {
  const { currentHousehold } = useCurrentHousehold();
  
  return useQuery({
    queryKey: PANTRY_KEYS.list(currentHousehold?.id),
    queryFn: () => pantryService.getAll(currentHousehold!.id),
    enabled: !!currentHousehold,
  });
}

export function usePantryItem(id: string) {
  return useQuery({
    queryKey: PANTRY_KEYS.detail(id),
    queryFn: () => pantryService.getById(id),
    enabled: !!id,
  });
}

export function usePantryAlerts() {
  const { currentHousehold } = useCurrentHousehold();
  
  return useQuery({
    queryKey: PANTRY_KEYS.alerts(currentHousehold?.id),
    queryFn: () => pantryService.getAlerts(currentHousehold!.id),
    enabled: !!currentHousehold,
  });
}

export function usePantrySummary() {
  const { currentHousehold } = useCurrentHousehold();
  
  return useQuery({
    queryKey: PANTRY_KEYS.summary(currentHousehold?.id),
    queryFn: () => pantryService.getSummary(currentHousehold!.id),
    enabled: !!currentHousehold,
  });
}

export function useLowStockItems() {
  const { currentHousehold } = useCurrentHousehold();
  
  return useQuery({
    queryKey: PANTRY_KEYS.lowStock(currentHousehold?.id),
    queryFn: () => pantryService.getLowStockItems(currentHousehold!.id),
    enabled: !!currentHousehold,
  });
}

export function useCreatePantryItem() {
  const queryClient = useQueryClient();
  const { currentHousehold } = useCurrentHousehold();
  
  return useMutation({
    mutationFn: (input: CreatePantryItemInput) => {
      if (!currentHousehold) throw new Error('No household selected');
      return pantryService.create(input, currentHousehold.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PANTRY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PANTRY_KEYS.all });
    },
  });
}

export function useUpdatePantryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: UpdatePantryItemInput) => pantryService.update(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PANTRY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PANTRY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: PANTRY_KEYS.all });
    },
  });
}

export function useDeletePantryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => pantryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PANTRY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PANTRY_KEYS.all });
    },
  });
}
