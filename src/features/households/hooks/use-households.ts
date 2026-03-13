/**
 * Household Hooks
 * React Query hooks for household operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as householdService from '@/services/household.service';
import type {
  CreateHouseholdDto,
  UpdateHouseholdDto,
  AddUserToHouseholdDto,
} from '@/types';

/**
 * Get all households for the current user
 */
export function useHouseholds() {
  return useQuery({
    queryKey: ['households'],
    queryFn: householdService.getUserHouseholds,
  });
}

/**
 * Get a specific household by ID
 */
export function useHousehold(id: string) {
  return useQuery({
    queryKey: ['households', id],
    queryFn: () => householdService.getHouseholdById(id),
    enabled: !!id,
  });
}

/**
 * Create a new household
 */
export function useCreateHousehold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHouseholdDto) =>
      householdService.createHousehold(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households'] });
    },
  });
}

/**
 * Update a household
 */
export function useUpdateHousehold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHouseholdDto }) =>
      householdService.updateHousehold(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['households'] });
      queryClient.invalidateQueries({ queryKey: ['households', variables.id] });
    },
  });
}

/**
 * Delete a household
 */
export function useDeleteHousehold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => householdService.deleteHousehold(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households'] });
    },
  });
}

/**
 * Add a user to a household
 */
export function useAddUserToHousehold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddUserToHouseholdDto) =>
      householdService.addUserToHousehold(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['households'] });
      queryClient.invalidateQueries({
        queryKey: ['household-members', variables.household_id],
      });
    },
  });
}

/**
 * Remove a user from a household
 */
export function useRemoveUserFromHousehold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      householdId,
    }: {
      userId: string;
      householdId: string;
    }) => householdService.removeUserFromHousehold(userId, householdId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['households'] });
      queryClient.invalidateQueries({
        queryKey: ['household-members', variables.householdId],
      });
    },
  });
}

/**
 * Get all members of a household
 */
export function useHouseholdMembers(householdId: string) {
  return useQuery({
    queryKey: ['household-members', householdId],
    queryFn: () => householdService.getHouseholdMembers(householdId),
    enabled: !!householdId,
  });
}
