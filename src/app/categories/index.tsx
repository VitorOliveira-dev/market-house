/**
 * Categories Management Screen
 * List and manage product categories
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { 
  useCategories, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory 
} from '@/features/categories/hooks/use-categories';
import { Card, Button, Input, LoadingSpinner, EmptyState, ColorPicker, CATEGORY_COLORS, UnitSelector } from '@/components/ui';
import type { Category } from '@/types';

export default function CategoriesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0].value);
  const [selectedUnits, setSelectedUnits] = useState<string[]>(['un']); // Default to 'unidade'

  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const handleAdd = () => {
    setIsAdding(true);
    setName('');
    setDescription('');
    setSelectedColor(CATEGORY_COLORS[0].value);
    setSelectedUnits(['un']);
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || '');
    setSelectedColor(category.color || CATEGORY_COLORS[0].value);
    setSelectedUnits(category.units || ['un']);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setSelectedColor(CATEGORY_COLORS[0].value);
    setSelectedUnits(['un']);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome da categoria é obrigatório');
      return;
    }

    if (selectedUnits.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos uma unidade para esta categoria');
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: name.trim(),
          description: description.trim() || undefined,
          color: selectedColor,
          units: selectedUnits,
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined,
          color: selectedColor,
          units: selectedUnits,
        });
      }
      handleCancel();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao salvar categoria');
    }
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir a categoria "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(category.id);
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao excluir categoria');
            }
          },
        },
      ]
    );
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const isEditing = editingId === item.id;

    if (isEditing) {
      return (
        <Card style={styles.card}>
          <Input
            label="Nome"
            value={name}
            onChangeText={setName}
            placeholder="Ex: Laticínios"
          />
          <Input
            label="Descrição (opcional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Ex: Leite, queijo, iogurte..."
            style={styles.input}
          />
          <ColorPicker
            label="Cor da Categoria"
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
          />
          <UnitSelector
            label="Unidades permitidas para itens desta categoria"
            selectedUnits={selectedUnits}
            onUnitsChange={setSelectedUnits}
          />
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
      <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: item.color || CATEGORY_COLORS[0].value }]}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryColorBadge}>
            <View style={[styles.colorIndicator, { backgroundColor: item.color || CATEGORY_COLORS[0].value }]} />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={[styles.categoryName, { color: colors.text }]}>
              {item.name}
            </Text>
            {item.description && (
              <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
                {item.description}
              </Text>
            )}
          </View>
          <View style={styles.categoryActions}>
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
        <Text style={[styles.title, { color: colors.text }]}>Categorias</Text>
        <Button
          title="Nova Categoria"
          onPress={handleAdd}
          leftIcon={<Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />}
        />
      </View>

      {isAdding && (
        <Card style={[styles.card, styles.addCard]}>
          <Text style={[styles.addTitle, { color: colors.text }]}>Nova Categoria</Text>
          <Input
            label="Nome"
            value={name}
            onChangeText={setName}
            placeholder="Ex: Laticínios"
          />
          <Input
            label="Descrição (opcional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Ex: Leite, queijo, iogurte..."
            style={styles.input}
          />
          <ColorPicker
            label="Cor da Categoria"
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
          />
          <UnitSelector
            label="Unidades permitidas para itens desta categoria"
            selectedUnits={selectedUnits}
            onUnitsChange={setSelectedUnits}
          />
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
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="folder-open-outline"
            title="Nenhuma categoria cadastrada"
            message="Crie sua primeira categoria para organizar seus produtos"
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
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryColorBadge: {
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
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
  },
  categoryActions: {
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
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
});
