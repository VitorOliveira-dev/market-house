/**
 * Items Management Screen
 * List and manage items/products
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { 
  useItems, 
  useCreateItem, 
  useUpdateItem, 
  useDeleteItem 
} from '@/features/items/hooks/use-items';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { Card, Button, Input, LoadingSpinner, EmptyState, CATEGORY_COLORS } from '@/components/ui';
import { getUnitLabel } from '@/constants/units';
import type { Item } from '@/types';

export default function ItemsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: items, isLoading } = useItems();
  const { data: categories } = useCategories();
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();
  const deleteMutation = useDeleteItem();

  // Get available units from selected category (for display only)
  const availableUnits = useMemo(() => {
    if (!categoryId) return [];
    const category = categories?.find(c => c.id === categoryId);
    return category?.units || [];
  }, [categoryId, categories]);

  const handleAdd = () => {
    setIsAdding(true);
    setName('');
    setBarcode('');
    setCategoryId('');
    setSelectedCategory('');
  };

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setName(item.name);
    setBarcode(item.barcode || '');
    setCategoryId(item.category_id);
    setSelectedCategory(item.category?.name || '');
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setBarcode('');
    setCategoryId('');
    setSelectedCategory('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome do item é obrigatório');
      return;
    }

    if (!categoryId) {
      Alert.alert('Erro', 'Selecione uma categoria');
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: name.trim(), 
          category_id: categoryId,
          barcode: barcode.trim() || undefined,
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          category_id: categoryId,
          barcode: barcode.trim() || undefined,
        });
      }
      handleCancel();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao salvar item');
    }
  };

  const handleDelete = (item: Item) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o item "${item.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(item.id);
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao excluir item');
            }
          },
        },
      ]
    );
  };

  const selectCategory = (catId: string) => {
    setCategoryId(catId);
    const cat = categories?.find(c => c.id === catId);
    setSelectedCategory(cat?.name || '');
  };

  const renderItem = ({ item }: { item: Item }) => {
    const isEditing = editingId === item.id;

    if (isEditing) {
      return (
        <Card style={styles.card}>
          <Input
            label="Nome"
            value={name}
            onChangeText={setName}
            placeholder="Ex: Leite Integral"
          />
          <Input
            label="Código de Barras (opcional)"
            value={barcode}
            onChangeText={setBarcode}
            placeholder="Ex: 7891234567890"
            keyboardType="numeric"
            style={styles.input}
          />
          <Text style={[styles.label, { color: colors.text }]}>Categoria</Text>
          <View style={styles.categoryPicker}>
            {categories?.map((cat) => (
              <Button
                key={cat.id}
                title={cat.name}
                onPress={() => selectCategory(cat.id)}
                variant={categoryId === cat.id ? 'primary' : 'outline'}
                style={[
                  styles.categoryButton,
                  categoryId !== cat.id && { 
                    borderColor: cat.color || CATEGORY_COLORS[0].value,
                    borderWidth: 2,
                  },
                ]}
              />
            ))}
          </View>
          {availableUnits.length > 0 && (
            <>
              <Text style={[styles.label, { color: colors.text }]}>Unidades disponíveis nesta categoria</Text>
              <View style={styles.unitDisplay}>
                {availableUnits.map((unit) => (
                  <View
                    key={unit}
                    style={[
                      styles.unitBadge,
                      { backgroundColor: colors.card, borderColor: colors.cardBorder },
                    ]}
                  >
                    <Text style={[styles.unitBadgeText, { color: colors.textSecondary }]}>
                      {getUnitLabel(unit)}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                A unidade será definida ao adicionar o item à lista de compras
              </Text>
            </>
          )}
          <View style={styles.actions}>
            <Button
              title="Cancelar"
              onPress={handleCancel}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="Salvar"
              onPress={handleSave}
              loading={updateMutation.isPending}
              style={styles.button}
            />
          </View>
        </Card>
      );
    }

    return (
      <Card style={styles.card}>
        <View style={styles.itemHeader}>
          <View style={styles.itemColorBadge}>
            <View 
              style={[
                styles.colorIndicator, 
                { backgroundColor: item.category?.color || CATEGORY_COLORS[0].value }
              ]} 
            />
          </View>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>
              {item.category?.name}
            </Text>
            {item.barcode && (
              <Text style={[styles.itemBarcode, { color: colors.textSecondary }]}>
                Cód: {item.barcode}
              </Text>
            )}
          </View>
          <View style={styles.itemActions}>
            <Button
              title=""
              onPress={() => handleEdit(item)}
              variant="ghost"
              style={styles.iconButton}
            >
              <Ionicons name="pencil" size={20} color={colors.primary} />
            </Button>
            <Button
              title=""
              onPress={() => handleDelete(item)}
              variant="ghost"
              style={styles.iconButton}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </Button>
          </View>
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Itens</Text>
        <Button
          title="Novo Item"
          onPress={handleAdd}
          leftIcon={<Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />}
        />
      </View>

      {isAdding && (
        <Card style={[styles.card, styles.addCard]}>
          <Text style={[styles.addTitle, { color: colors.text }]}>Novo Item</Text>
          <Input
            label="Nome"
            value={name}
            onChangeText={setName}
            placeholder="Ex: Leite Integral"
          />
          <Input
            label="Código de Barras (opcional)"
            value={barcode}
            onChangeText={setBarcode}
            placeholder="Ex: 7891234567890"
            keyboardType="numeric"
            style={styles.input}
          />
          <Text style={[styles.label, { color: colors.text }]}>Categoria</Text>
          <View style={styles.categoryPicker}>
            {categories?.map((cat) => (
              <Button
                key={cat.id}
                title={cat.name}
                onPress={() => selectCategory(cat.id)}
                variant={categoryId === cat.id ? 'primary' : 'outline'}
                style={[
                  styles.categoryButton,
                  categoryId !== cat.id && { 
                    borderColor: cat.color || CATEGORY_COLORS[0].value,
                    borderWidth: 2,
                  },
                ]}
              />
            ))}
          </View>
          {availableUnits.length > 0 && (
            <>
              <Text style={[styles.label, { color: colors.text }]}>Unidades disponíveis nesta categoria</Text>
              <View style={styles.unitDisplay}>
                {availableUnits.map((unit) => (
                  <View
                    key={unit}
                    style={[
                      styles.unitBadge,
                      { backgroundColor: colors.card, borderColor: colors.cardBorder },
                    ]}
                  >
                    <Text style={[styles.unitBadgeText, { color: colors.textSecondary }]}>
                      {getUnitLabel(unit)}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                A unidade será definida ao adicionar o item à lista de compras
              </Text>
            </>
          )}
          <View style={styles.actions}>
            <Button
              title="Cancelar"
              onPress={handleCancel}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="Criar"
              onPress={handleSave}
              loading={createMutation.isPending}
              style={styles.button}
            />
          </View>
        </Card>
      )}

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="Nenhum item cadastrado"
            message="Crie seu primeiro item para poder adicionar à lista de compras"
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 12,
  },
  addCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  addTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemColorBadge: {
    marginRight: 12,
  },
  colorIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  itemBarcode: {
    fontSize: 12,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 32,
  },
  input: {
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  unitDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  unitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  unitBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  hint: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
});
