/**
 * Authentication Hook
 * Manage user authentication state and actions
 */

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export const AUTH_KEYS = {
  all: ['auth'] as const,
  session: () => [...AUTH_KEYS.all, 'session'] as const,
  user: () => [...AUTH_KEYS.all, 'user'] as const,
};

export function useAuth() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);

  const { data: session } = useQuery({
    queryKey: AUTH_KEYS.session(),
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    staleTime: Infinity,
  });

  const user = session?.user || null;
  const isAuthenticated = !!user;

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(AUTH_KEYS.session(), session);
      setIsLoading(false);
    });

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      queryClient.setQueryData(AUTH_KEYS.session(), session);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
  };
}

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.session) {
        queryClient.setQueryData(AUTH_KEYS.session(), data.session);
      }
    },
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.session(), data.session);
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_KEYS.session(), null);
      queryClient.clear();
    },
  });
}

export function useGoogleSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const redirectUrl = Linking.createURL('/auth/callback');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });

      if (error) throw error;

      // On web, the redirect happens automatically
      if (Platform.OS === 'web') {
        return null;
      }

      // On mobile, open the OAuth URL in a browser
      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        if (result.type === 'success') {
          const url = result.url;
          const params = new URL(url).searchParams;
          
          // Extract tokens from the callback URL
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          if (access_token && refresh_token) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (sessionError) throw sessionError;
            return sessionData;
          }
        } else if (result.type === 'cancel') {
          throw new Error('Autenticação cancelada');
        }
      }

      throw new Error('Erro ao autenticar com Google');
    },
    onSuccess: (data) => {
      if (data?.session) {
        queryClient.setQueryData(AUTH_KEYS.session(), data.session);
      }
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: Linking.createURL('/auth/reset-password'),
      });

      if (error) throw error;
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
    },
  });
}
