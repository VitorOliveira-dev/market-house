/**
 * Household types
 */

export type HouseholdRole = 'owner' | 'admin' | 'member';

export interface Household {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface UserHousehold {
  id: string;
  user_id: string;
  household_id: string;
  role: HouseholdRole;
  created_at: string;
}

export interface HouseholdWithRole extends Household {
  role: HouseholdRole;
}

export interface CreateHouseholdDto {
  name: string;
  description?: string;
}

export interface UpdateHouseholdDto {
  name?: string;
  description?: string;
}

export interface AddUserToHouseholdDto {
  user_id: string;
  household_id: string;
  role?: HouseholdRole;
}
