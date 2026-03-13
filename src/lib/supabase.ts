/**
 * Supabase Configuration
 * Add your Supabase URL and Anon Key to your environment variables
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// TODO: Add these to your .env file
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we're in a browser environment
const isBrowser = Platform.OS === 'web' && typeof window !== 'undefined';

// For web SSR, create a minimal client without storage
const createSupabaseClient = () => {
  if (Platform.OS === 'web' && !isBrowser) {
    // SSR mode - no storage
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  // Client-side mode - with storage
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};

export const supabase = createSupabaseClient();

export default supabase;
