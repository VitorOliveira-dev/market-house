/**
 * Household Context
 * Manages the currently selected household across the app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HouseholdWithRole } from '@/types';
import { useHouseholds } from '@/features/households/hooks/use-households';

const STORAGE_KEY = '@market_house:selected_household';

interface HouseholdContextType {
  currentHousehold: HouseholdWithRole | null;
  setCurrentHousehold: (household: HouseholdWithRole | null) => Promise<void>;
  isLoading: boolean;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(
  undefined
);

interface HouseholdProviderProps {
  children: React.ReactNode;
}

export function HouseholdProvider({ children }: HouseholdProviderProps) {
  const [currentHousehold, setCurrentHouseholdState] =
    useState<HouseholdWithRole | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { data: households, isLoading: isLoadingHouseholds } = useHouseholds();

  // Load saved household from AsyncStorage on mount
  useEffect(() => {
    loadSavedHousehold();
  }, []);

  // Auto-select first household if none is selected
  useEffect(() => {
    if (
      isInitialized &&
      !currentHousehold &&
      households &&
      households.length > 0
    ) {
      setCurrentHousehold(households[0]);
    }
  }, [isInitialized, currentHousehold, households]);

  const loadSavedHousehold = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCurrentHouseholdState(parsed);
      }
    } catch (error) {
      console.error('Error loading saved household:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  const setCurrentHousehold = async (
    household: HouseholdWithRole | null
  ): Promise<void> => {
    setCurrentHouseholdState(household);

    try {
      if (household) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(household));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving household:', error);
    }
  };

  const isLoading = !isInitialized || isLoadingHouseholds;

  return (
    <HouseholdContext.Provider
      value={{
        currentHousehold,
        setCurrentHousehold,
        isLoading,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

/**
 * Hook to access household context
 */
export function useCurrentHousehold() {
  const context = useContext(HouseholdContext);

  if (context === undefined) {
    throw new Error(
      'useCurrentHousehold must be used within a HouseholdProvider'
    );
  }

  return context;
}
