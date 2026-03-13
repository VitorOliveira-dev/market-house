/**
 * Purchases Screen
 * Display purchase history and statistics
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { usePurchases, usePurchaseStats } from '@/features/purchases/hooks/use-purchases';
import { Card, LoadingSpinner, EmptyState } from '@/components/ui';
import { formatCurrency, formatDate, formatDateTime } from '@/utils';
import type { Purchase } from '@/types';

export default function PurchasesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { data: purchases, isLoading } = usePurchases();
  const { data: stats } = usePurchaseStats();

  const renderItem = ({ item }: { item: Purchase }) => (
    <TouchableOpacity>
      <Card style={styles.card}>
        <View style={styles.purchaseHeader}>
          <View style={styles.purchaseInfo}>
            <Text style={[styles.purchaseDate, { color: colors.text }]}>
              {formatDate(item.purchase_date)}
            </Text>
            {item.store_name && (
              <Text style={[styles.storeName, { color: colors.textSecondary }]}>
                {item.store_name}
              </Text>
            )}
          </View>
          <Text style={[styles.purchaseValue, { color: colors.primary }]}>
            {formatCurrency(Number(item.total_value))}
          </Text>
        </View>
        {item.payment_method && (
          <View style={styles.paymentMethod}>
            <Ionicons name="card-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.paymentMethodText, { color: colors.textSecondary }]}>
              {item.payment_method}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Carregando histórico..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {stats && (
        <Card style={styles.statsCard}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Resumo</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {stats.count}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Compras
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {formatCurrency(stats.total)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Gasto
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {formatCurrency(stats.average)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Média
              </Text>
            </View>
          </View>
        </Card>
      )}
      <FlatList
        data={purchases}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="Nenhuma compra registrada"
            message="Finalize uma compra para ver o histórico aqui"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  statsCard: {
    margin: 16,
    marginBottom: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  card: {
    marginBottom: 12,
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  purchaseInfo: {
    flex: 1,
  },
  purchaseDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
  },
  purchaseValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentMethodText: {
    fontSize: 12,
  },
});
