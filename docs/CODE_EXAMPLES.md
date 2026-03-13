# 💻 Exemplos de Código - Market House

Este documento contém exemplos de código prontos para implementar funcionalidades adicionais.

## 🔐 1. Autenticação

### Criar Hook de Autenticação

```typescript
// src/features/auth/hooks/use-auth.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return { user, loading, signUp, signIn, signOut };
}
```

### Tela de Login

```typescript
// src/app/auth/login.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input, Button } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/use-auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title="Entrar"
        onPress={handleLogin}
        loading={loading}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
});
```

## 📝 2. CRUD de Categorias

### Tela de Lista

```typescript
// src/app/categories/index.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { Card, LoadingSpinner, EmptyState, Button } from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function CategoriesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(\`/categories/\${item.id}/edit\`)}
          >
            <Card style={styles.card}>
              <View style={styles.categoryRow}>
                <View style={[styles.colorDot, { backgroundColor: item.color || colors.primary }]} />
                <Text style={[styles.categoryName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="folder-outline"
            title="Nenhuma categoria"
            message="Crie categorias para organizar seus itens"
            actionLabel="Criar Categoria"
            onAction={() => router.push('/categories/create')}
          />
        }
      />
      <Button
        title="Nova Categoria"
        onPress={() => router.push('/categories/create')}
        style={styles.fab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  card: { marginBottom: 12 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    left: 20,
  },
});
```

### Tela de Criar/Editar

```typescript
// src/app/categories/create.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input, Button } from '@/components/ui';
import { useCreateCategory } from '@/features/categories/hooks/use-categories';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function CreateCategoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const createCategory = useCreateCategory();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome é obrigatório');
      return;
    }

    try {
      await createCategory.mutateAsync({ name, description });
      Alert.alert('Sucesso', 'Categoria criada!');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a categoria');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Input
        label="Nome *"
        value={name}
        onChangeText={setName}
        placeholder="Ex: Alimentos"
      />
      <Input
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        placeholder="Descrição opcional"
        multiline
        numberOfLines={3}
      />
      <Button
        title="Salvar"
        onPress={handleSave}
        loading={createCategory.isPending}
        fullWidth
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
});
```

## 🔍 3. Busca de Itens

```typescript
// src/components/features/item-search.tsx
import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSearchItems } from '@/features/items/hooks/use-items';
import { Card, LoadingSpinner } from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { Item } from '@/types';

interface ItemSearchProps {
  onSelectItem: (item: Item) => void;
}

export function ItemSearch({ onSelectItem }: ItemSearchProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [query, setQuery] = useState('');
  const { data: items, isLoading } = useSearchItems(query);

  return (
    <View>
      <TextInput
        style={[styles.input, {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          color: colors.text,
        }]}
        placeholder="Buscar item..."
        placeholderTextColor={colors.textSecondary}
        value={query}
        onChangeText={setQuery}
      />
      {isLoading && <LoadingSpinner />}
      {items && items.length > 0 && (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSelectItem(item)}>
              <Card style={styles.resultItem}>
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.categoryName, { color: colors.textSecondary }]}>
                  {item.category?.name}
                </Text>
              </Card>
            </TouchableOpacity>
          )}
          style={styles.results}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  results: {
    maxHeight: 300,
  },
  resultItem: {
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryName: {
    fontSize: 14,
    marginTop: 4,
  },
});
```

## 💰 4. Modal de Preço

```typescript
// src/components/features/price-modal.tsx
import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { Input, Button } from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface PriceModalProps {
  visible: boolean;
  itemName: string;
  onConfirm: (price: number) => void;
  onCancel: () => void;
}

export function PriceModal({ visible, itemName, onConfirm, onCancel }: PriceModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [price, setPrice] = useState('');

  const handleConfirm = () => {
    const numPrice = parseFloat(price.replace(',', '.'));
    if (!isNaN(numPrice) && numPrice > 0) {
      onConfirm(numPrice);
      setPrice('');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Adicionar ao Carrinho
          </Text>
          <Text style={[styles.itemName, { color: colors.text }]}>
            {itemName}
          </Text>
          <Input
            label="Preço"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholder="0,00"
          />
          <View style={styles.buttons}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={onCancel}
              style={styles.button}
            />
            <Button
              title="Adicionar"
              onPress={handleConfirm}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
});
```

## 📊 5. Gráfico de Gastos

```typescript
// Primeiro instale: npm install react-native-chart-kit

// src/components/features/spending-chart.tsx
import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface SpendingChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export function SpendingChart({ data }: SpendingChartProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const screenWidth = Dimensions.get('window').width;

  const chartData = {
    labels: data.labels,
    datasets: [{
      data: data.values,
    }],
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        Gastos Mensais
      </Text>
      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: colors.card,
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          decimalPlaces: 2,
          color: (opacity = 1) => \`rgba(230, 199, 122, \${opacity})\`,
          labelColor: (opacity = 1) => colors.text,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: colors.primary,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
```

## 📷 6. Scanner de Código de Barras

```typescript
// Primeiro instale: npm install expo-barcode-scanner

// src/components/features/barcode-scanner.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Button } from '@/components/ui';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    onScan(data);
  };

  if (hasPermission === null) {
    return <Text>Solicitando permissão da câmera...</Text>;
  }

  if (hasPermission === false) {
    return <Text>Sem acesso à câmera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <View style={styles.actions}>
          <Button
            title="Escanear Novamente"
            onPress={() => setScanned(false)}
          />
          <Button
            title="Fechar"
            variant="secondary"
            onPress={onClose}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actions: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    gap: 12,
  },
});
```

## 🔔 7. Sistema de Notificações

```typescript
// Primeiro instale: npm install expo-notifications

// src/lib/notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E6C77A',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export async function scheduleNotification(title: string, body: string, trigger?: Date) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: trigger ? { date: trigger } : null,
  });
}
```

## 🌐 8. Modo Offline

```typescript
// src/lib/offline-config.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 horas
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
});
```

Esses exemplos cobrem as funcionalidades mais importantes! 🚀
