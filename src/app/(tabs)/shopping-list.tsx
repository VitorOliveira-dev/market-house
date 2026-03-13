/**
 * Shopping List Screen
 * Display and manage shopping list items
 */

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useShoppingList, useDeleteShoppingListItem, useMoveToCart, useCreateShoppingListItem, useUpdateShoppingListItem } from '@/features/shopping-list/hooks/use-shopping-list';
import { SwipeableListItem, LoadingSpinner, EmptyState, CATEGORY_COLORS } from '@/components/ui';
import { AddToShoppingListModal } from '@/components/add-to-shopping-list-modal';
import { EditShoppingListItemModal } from '@/components/edit-shopping-list-item-modal';
import { formatQuantity } from '@/utils';
import type { ShoppingListItem } from '@/types';

const HINT_STORAGE_KEY = '@shopping_list_hint_dismissed';

interface ShoppingListSection {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  data: (ShoppingListItem & { 
    _isFirst?: boolean;
    _isLast?: boolean;
    _categoryColor?: string;
  })[];
}

export default function ShoppingListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [showHint, setShowHint] = useState(true);
  
  const { data: items, isLoading } = useShoppingList();
  const deleteItem = useDeleteShoppingListItem();
  const moveToCart = useMoveToCart();
  const createItem = useCreateShoppingListItem();
  const updateItem = useUpdateShoppingListItem();

  // Load hint visibility from storage
  useEffect(() => {
    const loadHintPreference = async () => {
      try {
        const dismissed = await AsyncStorage.getItem(HINT_STORAGE_KEY);
        if (dismissed === 'true') {
          setShowHint(false);
        }
      } catch (error) {
        console.error('Error loading hint preference:', error);
      }
    };
    loadHintPreference();
  }, []);

  const handleDismissHint = async () => {
    try {
      await AsyncStorage.setItem(HINT_STORAGE_KEY, 'true');
      setShowHint(false);
    } catch (error) {
      console.error('Error saving hint preference:', error);
      setShowHint(false);
    }
  };

  // Group items by category and sort by priority
  const sections = useMemo(() => {
    if (!items || items.length === 0) return [];

    // Priority order: high > medium > low
    const priorityOrder = { high: 0, medium: 1, low: 2 };

    // Group by category
    const categoryMap = new Map<string, ShoppingListItem[]>();
    
    items.forEach(item => {
      const categoryId = item.item?.category?.id || 'uncategorized';
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, []);
      }
      categoryMap.get(categoryId)!.push(item);
    });

    // Convert to sections array and sort items within each section
    const sectionsArray: ShoppingListSection[] = Array.from(categoryMap.entries()).map(([categoryId, items]) => {
      const firstItem = items[0];
      const category = firstItem.item?.category;
      const categoryColor = category?.color || CATEGORY_COLORS[0].value;
      
      // Sort items by priority within category
      const sortedItems = [...items].sort((a, b) => {
        const aPriority = a.priority || 'medium';
        const bPriority = b.priority || 'medium';
        return priorityOrder[aPriority] - priorityOrder[bPriority];
      });

      // Add position and category color info to each item
      const itemsWithMetadata = sortedItems.map((item, index) => ({
        ...item,
        _isFirst: index === 0,
        _isLast: index === sortedItems.length - 1,
        _categoryColor: categoryColor,
      }));

      return {
        categoryId,
        categoryName: category?.name || 'Sem Categoria',
        categoryColor,
        data: itemsWithMetadata,
      };
    });

    // Sort sections by category name
    return sectionsArray.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }, [items]);

  const handleDelete = async (id: string) => {
    try {
      await deleteItem.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleMoveToCart = async (item: ShoppingListItem) => {
    // In a real app, you would show a modal to input the price
    const mockPrice = item.item?.usual_price || 10;
    
    try {
      await moveToCart.mutateAsync({
        shoppingListItemId: item.id,
        price: mockPrice,
      });
    } catch (error) {
      console.error('Error moving to cart:', error);
    }
  };

  const handleAddItem = async (
    itemId: string,
    quantity: number,
    unit: string,
    priority: 'low' | 'medium' | 'high',
    notes?: string
  ) => {
    await createItem.mutateAsync({
      item_id: itemId,
      quantity,
      unit,
      priority,
      notes,
    });
  };

  const handleUpdateItem = async (
    id: string,
    quantity: number,
    unit: string,
    priority: 'low' | 'medium' | 'high',
    notes?: string
  ) => {
    await updateItem.mutateAsync({
      id,
      quantity,
      unit,
      priority,
      notes,
    });
  };

  const handleEditItem = (item: ShoppingListItem) => {
    setEditingItem(item);
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setTimeout(() => {
      setEditingItem(null);
    }, 300);
  };

  const renderSectionHeader = ({ section }: { section: ShoppingListSection }) => (
    <View style={styles.sectionSpacer} />
  );

  const renderItem = ({ item }: { item: ShoppingListItem & { _isFirst?: boolean; _isLast?: boolean; _categoryColor?: string } }) => {
    const itemStyle = [
      styles.itemCard,
      { backgroundColor: colors.card },
      item._isFirst && styles.itemCardFirst,
      item._isLast && styles.itemCardLast,
      !item._isFirst && !item._isLast && styles.itemCardMiddle,
    ];

    const categoryIndicatorStyle = [
      styles.itemCategoryIndicator,
      { backgroundColor: item._categoryColor || CATEGORY_COLORS[0].value },
      item._isFirst && styles.categoryIndicatorFirst,
      item._isLast && styles.categoryIndicatorLast,
    ];

    return (
      <View style={itemStyle}>
        <View style={categoryIndicatorStyle} />
        <View style={styles.swipeableWrapper}>
          <SwipeableListItem
            onSwipeLeft={() => handleDelete(item.id)}
            onSwipeRight={() => handleMoveToCart(item)}
          >
            <TouchableOpacity 
              style={styles.itemContent}
              onPress={() => handleEditItem(item)}
              activeOpacity={0.7}
            >
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {item.item?.name}
                </Text>
                {item.notes && (
                  <Text style={[styles.itemNotes, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.notes}
                  </Text>
                )}
              </View>
              <View style={styles.itemRight}>
                <Text style={[styles.itemQuantity, { color: colors.text }]}>
                  {formatQuantity(item.quantity, item.unit)}
                </Text>
                {item.priority === 'high' && (
                  <Ionicons name="alert-circle" size={20} color={colors.error} />
                )}
              </View>
            </TouchableOpacity>
          </SwipeableListItem>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Carregando lista..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Hint Banner */}
      {showHint && sections.length > 0 && (
        <TouchableOpacity 
          style={[styles.hintBanner, { backgroundColor: colors.primary }]}
          onPress={handleDismissHint}
          activeOpacity={0.9}
        >
          <View style={styles.hintContent}>
            <Ionicons name="information-circle" size={20} color="#FFFFFF" style={styles.hintIcon} />
            <View style={styles.hintTextContainer}>
              <Text style={styles.hintText}>
                Deslize para a esquerda para excluir ou para a direita para adicionar ao carrinho
              </Text>
            </View>
            <Ionicons name="close-circle" size={20} color="#FFFFFF" style={styles.hintClose} />
          </View>
        </TouchableOpacity>
      )}
      
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <EmptyState
            icon="cart-outline"
            title="Lista vazia"
            message="Adicione itens à sua lista de compras"
            actionLabel="Adicionar Item"
            onAction={() => setIsModalVisible(true)}
          />
        }
      />
      
      {/* Floating Action Button */}
      {sections.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <AddToShoppingListModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAdd={handleAddItem}
      />

      <EditShoppingListItemModal
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
  hintBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hintContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintIcon: {
    marginRight: 8,
  },
  hintTextContainer: {
    flex: 1,
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  hintClose: {
    marginLeft: 8,
    opacity: 0.8,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  sectionSpacer: {
    height: 12,
  },
  itemCard: {
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  itemCardFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  itemCardLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 4,
  },
  itemCardMiddle: {
    borderRadius: 0,
  },
  itemCategoryIndicator: {
    width: 4,
  },
  categoryIndicatorFirst: {
    borderTopLeftRadius: 12,
  },
  categoryIndicatorLast: {
    borderBottomLeftRadius: 12,
  },
  swipeableWrapper: {
    flex: 1,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemNotes: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
