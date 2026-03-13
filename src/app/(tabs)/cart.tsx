/**
 * Cart Screen
 * Display and manage cart items before purchase
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useCart, useDeleteCartItem, useClearCart, useUpdateCartItem } from '@/features/cart/hooks/use-cart';
import { useCreatePurchase } from '@/features/purchases/hooks/use-purchases';
import { Card, LoadingSpinner, EmptyState, Button } from '@/components/ui';
import { EditCartItemModal } from '@/components/edit-cart-item-modal';
import { formatCurrency, formatQuantity } from '@/utils';
import type { CartItem } from '@/types';

export default function CartScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  
  const { data: items, isLoading } = useCart();
  const deleteItem = useDeleteCartItem();
  const clearCart = useClearCart();
  const createPurchase = useCreatePurchase();
  const updateItem = useUpdateCartItem();

  const totalValue = items?.reduce((sum, item) => sum + Number(item.subtotal), 0) || 0;

  const handleDelete = async (id: string) => {
    try {
      await deleteItem.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleUpdateItem = async (
    id: string,
    quantity: number,
    unit: string,
    price: number,
    notes?: string
  ) => {
    await updateItem.mutateAsync({
      id,
      quantity,
      unit,
      price,
      notes,
    });
  };

  const handleEditItem = (item: CartItem) => {
    setEditingItem(item);
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setTimeout(() => {
      setEditingItem(null);
    }, 300);
  };

  const handleFinalizePurchase = () => {
    if (!items || items.length === 0) return;

    Alert.alert(
      'Finalizar Compra',
      `Total: ${formatCurrency(totalValue)}\n\nDeseja finalizar a compra?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: async () => {
            try {
              await createPurchase.mutateAsync({
                cart_items: items.map(item => item.id),
                store_name: 'Supermercado',
                payment_method: 'Dinheiro',
              });
              Alert.alert('Sucesso', 'Compra registrada com sucesso!');
            } catch (error) {
              console.error('Error creating purchase:', error);
              Alert.alert('Erro', 'Não foi possível finalizar a compra');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <Card style={styles.card}>
      <TouchableOpacity 
        style={styles.itemContent}
        onPress={() => handleEditItem(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: colors.text }]}>
            {item.item?.name}
          </Text>
          <Text style={[styles.itemDetails, { color: colors.textSecondary }]}>
            {formatQuantity(item.quantity, item.unit)} × {formatCurrency(item.price)}
          </Text>
        </View>
        <View style={styles.itemRight}>
          <Text style={[styles.itemSubtotal, { color: colors.text }]}>
            {formatCurrency(Number(item.subtotal))}
          </Text>
        </View>
      </TouchableOpacity>
      <Button
        title="Remover"
        variant="secondary"
        onPress={() => handleDelete(item.id)}
        style={styles.deleteButton}
      />
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Carregando carrinho..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="cart-outline"
            title="Carrinho vazio"
            message="Adicione itens da lista de compras ao carrinho"
          />
        }
      />
      {items && items.length > 0 && (
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total:</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              {formatCurrency(totalValue)}
            </Text>
          </View>
          <Button
            title="Finalizar Compra"
            onPress={handleFinalizePurchase}
            fullWidth
            loading={createPurchase.isPending}
          />
        </View>
      )}
      <EditCartItemModal
        visible={isEditModalVisible}
        item={editingItem}
        onClose={handleCloseEditModal}
        onUpdate={handleUpdateItem}
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
  card: {
    marginBottom: 12,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemSubtotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 32,
    alignSelf: 'flex-start',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
  },
});
