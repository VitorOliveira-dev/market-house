import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { Platform, Image, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { queryClient } from '@/lib/react-query';
import { Colors } from '@/constants/theme';
import { useAuth, useSignOut } from '@/features/auth/hooks/use-auth';
import { HouseholdProvider } from '@/features/households/context/household-context';
import { HouseholdSelector } from '@/components/household-selector';

// Import test utility (exposes testSupabase() to browser console)
import '@/utils/test-supabase';

export const unstable_settings = {
  initialRouteName: 'auth/login',
};

function DrawerLogo() {
  return (
    <Image
      source={require('@/../assets/images/app-logo.png')}
      style={styles.logo}
      resizeMode="contain"
    />
  );
}

function LogoutButton() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const signOut = useSignOut();

  return (
    <View style={[styles.logoutContainer, { borderTopColor: colors.cardBorder }]}>
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.error }]}
        onPress={() => signOut.mutate()}
        disabled={signOut.isPending}
      >
        {signOut.isPending ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <Text style={styles.logoutText}>Sair</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Carregando...</Text>
      </View>
    );
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/forgot-password" />
      </Stack>
    );
  }

  // Show main app with drawer if authenticated
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerTitle: () => <DrawerLogo />,
        headerTintColor: colors.primary,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerStyle: {
          backgroundColor: colors.card,
        },
        drawerLabelStyle: {
          marginLeft: -16,
        },
      }}
      drawerContent={(props) => {
        const { navigation, state } = props;
        
        // Define menu items explicitly
        const menuItems = [
          { name: '(tabs)', title: 'Início', icon: 'home-outline' },
          { name: 'categories/index', title: 'Categorias', icon: 'folder-outline' },
          { name: 'items/index', title: 'Itens', icon: 'cube-outline' },
          { name: 'about', title: 'Sobre', icon: 'information-circle-outline' },
        ];

        return (
          <View style={{ flex: 1, backgroundColor: colors.card }}>
            {/* User Info Header */}
            <View style={[styles.drawerHeader, { backgroundColor: colors.primary }]}>
              <Ionicons name="person-circle" size={48} color="#FFFFFF" />
              <Text style={styles.drawerHeaderText} numberOfLines={1}>
                {user?.email || 'Usuário'}
              </Text>
            </View>

            {/* Household Selector */}
            <HouseholdSelector />

            {/* Menu Items */}
            <View style={{ flex: 1, paddingTop: 8 }}>
              {menuItems.map((item) => {
                const isFocused = state.routeNames[state.index] === item.name;

                return (
                  <TouchableOpacity
                    key={item.name}
                    onPress={() => navigation.navigate(item.name)}
                    style={[
                      styles.drawerItem,
                      {
                        backgroundColor: isFocused
                          ? colors.cardBorder
                          : 'transparent',
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={isFocused ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.drawerLabel,
                        {
                          color: isFocused ? colors.primary : colors.textSecondary,
                        },
                      ]}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Logout Button */}
            <LogoutButton />
          </View>
        );
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Início',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="categories/index"
        options={{
          title: 'Categorias',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="items/index"
        options={{
          title: 'Itens',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="about"
        options={{
          title: 'Sobre',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="information-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="auth/login"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="auth/register"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="auth/forgot-password"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer>
  );
}

export default function RootLayout() {
  // Wrapper component for GestureHandlerRootView (not needed on web)
  const RootContainer = Platform.OS === 'web' 
    ? ({ children }: { children: React.ReactNode }) => <>{children}</>
    : GestureHandlerRootView;

  return (
    <RootContainer style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <HouseholdProvider>
          <ThemeProvider value={DarkTheme}>
            <RootLayoutNav />
            <StatusBar style="auto" />
          </ThemeProvider>
        </HouseholdProvider>
      </QueryClientProvider>
    </RootContainer>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 12,
  },
  drawerHeaderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '80%',
    textAlign: 'center',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
