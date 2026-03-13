/**
 * Pantry Screen (Home)
 * Display pantry items and alerts
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { usePantry, usePantryAlerts, usePantrySummary } from '@/features/pantry/hooks/use-pantry';
import { Card, LoadingSpinner, EmptyState, Button } from '@/components/ui';
import { formatQuantity, formatDate, isExpired, isExpiringSoon } from '@/utils';
import type { PantryItem } from '@/types';

export default function PantryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  const { data: items, isLoading } = usePantry();
  const { data: alerts } = usePantryAlerts();
  const { data: summary } = usePantrySummary();

  const renderAlert = (alert: any, index: number) => {
    let alertColor = colors.warning;
    let iconName: keyof typeof Ionicons.glyphMap = 'alert-circle-outline';
    
    if (alert.alert_type === 'expired') {
      alertColor = colors.error;
      iconName = 'close-circle-outline';
    } else if (alert.alert_type === 'low_stock') {
      alertColor = colors.info;
      iconName = 'information-circle-outline';
    }

    return (
      <Card key={index} style={[styles.alertCard, { borderLeftColor: alertColor, borderLeftWidth: 4 }]}>
        <View style={styles.alertContent}>
          <Ionicons name={iconName} size={24} color={alertColor} />
          <Text style={[styles.alertText, { color: colors.text }]}>
            {alert.message}
          </Text>
        </View>
      </Card>
    );
  };

  const renderItem = ({ item }: { item: PantryItem }) => {
    const expired = item.expiration_date && isExpired(item.expiration_date);
    const expiringSoon = item.expiration_date && isExpiringSoon(item.expiration_date);
    const lowStock = item.minimum_stock && item.quantity <= item.minimum_stock;

    return (
      <Card style={styles.card}>
        <View style={styles.itemContent}>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: colors.text }]}>
              {item.item?.name}
            </Text>
            <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>
              {item.item?.category?.name}
            </Text>
            {item.location && (
              <Text style={[styles.itemLocation, { color: colors.textSecondary }]}>
                📍 {item.location}
              </Text>
            )}
          </View>
          <View style={styles.itemRight}>
            <Text style={[styles.itemQuantity, { color: colors.text }]}>
              {formatQuantity(item.quantity, item.unit)}
            </Text>
            {item.expiration_date && (
              <Text style={[
                styles.expirationDate, 
                { color: expired ? colors.error : expiringSoon ? colors.warning : colors.textSecondary }
              ]}>
                {formatDate(item.expiration_date)}
              </Text>
            )}
            <View style={styles.badges}>
              {lowStock && (
                <View style={[styles.badge, { backgroundColor: colors.info }]}>
                  <Text style={styles.badgeText}>Baixo</Text>
                </View>
              )}
              {expired && (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={styles.badgeText}>Vencido</Text>
                </View>
              )}
              {expiringSoon && (
                <View style={[styles.badge, { backgroundColor: colors.warning }]}>
                  <Text style={styles.badgeText}>Vence em breve</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Carregando despensa..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Summary Card */}
        {summary && (
          <Card style={styles.summaryCard}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Resumo da Despensa</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  {summary.total_items}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Itens
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.warning }]}>
                  {summary.expiring_soon_items}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Vencendo
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.error }]}>
                  {summary.expired_items}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Vencidos
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Alerts */}
        {alerts && alerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Alertas</Text>
            {alerts.slice(0, 3).map(renderAlert)}
          </View>
        )}

        {/* Items List */}
        <View style={styles.itemsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Itens na Despensa</Text>
          {items && items.length > 0 ? (
            items.map((item) => (
              <View key={item.id}>{renderItem({ item })}</View>
            ))
          ) : (
            <EmptyState
              icon="home-outline"
              title="Despensa vazia"
              message="Finalize uma compra para adicionar itens à despensa"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
  alertsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  alertCard: {
    marginBottom: 8,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
  },
  itemsSection: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    marginBottom: 2,
  },
  itemLocation: {
    fontSize: 12,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: '600',
  },
  expirationDate: {
    fontSize: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});

