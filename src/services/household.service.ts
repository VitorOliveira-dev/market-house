/**
 * Household Service
 * Handles all household-related data operations
 */

import { supabase } from '@/lib/supabase';
import type {
  Household,
  UserHousehold,
  HouseholdWithRole,
  CreateHouseholdDto,
  UpdateHouseholdDto,
  AddUserToHouseholdDto,
} from '@/types';

/**
 * Get all households for the current user
 */
export async function getUserHouseholds(): Promise<HouseholdWithRole[]> {
  const { data, error } = await supabase
    .from('user_households')
    .select('role, households(*)')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching user households:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log('No households found for user');
    return [];
  }

  // Transform the data to flatten the structure
  return (data || []).map((item: any) => ({
    ...item.households,
    role: item.role,
  }));
}

/**
 * Get a specific household by ID
 */
export async function getHouseholdById(id: string): Promise<Household> {
  const { data, error } = await supabase
    .from('households')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new household
 * Note: The user will automatically be added as owner via trigger
 */
export async function createHousehold(
  household: CreateHouseholdDto
): Promise<Household> {
  const { data, error } = await supabase
    .from('households')
    .insert(household)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a household
 */
export async function updateHousehold(
  id: string,
  updates: UpdateHouseholdDto
): Promise<Household> {
  const { data, error } = await supabase
    .from('households')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a household
 */
export async function deleteHousehold(id: string): Promise<void> {
  const { error } = await supabase.from('households').delete().eq('id', id);

  if (error) throw error;
}

/**
 * Add a user to a household
 */
export async function addUserToHousehold(
  membership: AddUserToHouseholdDto
): Promise<UserHousehold> {
  const { data, error } = await supabase
    .from('user_households')
    .insert({
      user_id: membership.user_id,
      household_id: membership.household_id,
      role: membership.role || 'member',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove a user from a household
 */
export async function removeUserFromHousehold(
  userId: string,
  householdId: string
): Promise<void> {
  const { error } = await supabase
    .from('user_households')
    .delete()
    .eq('user_id', userId)
    .eq('household_id', householdId);

  if (error) throw error;
}

/**
 * Update user role in a household
 */
export async function updateUserHouseholdRole(
  userId: string,
  householdId: string,
  role: 'owner' | 'admin' | 'member'
): Promise<UserHousehold> {
  const { data, error } = await supabase
    .from('user_households')
    .update({ role })
    .eq('user_id', userId)
    .eq('household_id', householdId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all members of a household
 */
export async function getHouseholdMembers(
  householdId: string
): Promise<UserHousehold[]> {
  const { data, error } = await supabase
    .from('user_households')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}
