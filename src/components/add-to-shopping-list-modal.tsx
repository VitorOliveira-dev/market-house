/**
 * Add to Shopping List Modal
 * Modal to select item and quantity to add to shopping list
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useItems } from '@/features/items/hooks/use-items';
import { Card, Button, Input, LoadingSpinner, EmptyState, CATEGORY_COLORS } from '@/components/ui';
import { getUnitLabel } from '@/constants/units';
import type { Item } from '@/types';

interface AddToShoppingListModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (itemId: string, quantity: number, unit: string, priority: 'low' | 'medium' | 'high', notes?: string) => Promise<void>;
}

export function AddToShoppingListModal({ visible, onClose, onAdd }: AddToShoppingListModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState('un');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const { data: items, isLoading } = useItems();

  // Get available units from selected item's category
  const availableUnits = useMemo(() => {
    if (!selectedItem?.category?.units) return ['un'];
    return selectedItem.category.units;
  }, [selectedItem]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.category?.name.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    // Set default unit to first available from category
    const units = item.category?.units || ['un'];
    setSelectedUnit(units[0]);
  };

  const handleBack = () => {
    setSelectedItem(null);
  };

  const handleAdd = async () => {
    if (!selectedItem) return;

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Erro', 'Quantidade inválida');
      return;
    }

    setIsAdding(true);
    try {
      await onAdd(
        selectedItem.id,
        qty,
        selectedUnit,
        priority,
        notes.trim() || undefined
      );
      
      // Reset form
      setSelectedItem(null);
      setQuantity('1');
      setSelectedUnit('un');
      setPriority('medium');
      setNotes('');
      setSearchQuery('');
      onClose();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao adicionar item');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSelectedItem(null);
    setQuantity('1');
    setSelectedUnit('un');
    setPriority('medium');
    setNotes('');
    setSearchQuery('');
    onClose();
  };

  const renderItemCard = ({ item }: { item: Item }) => (
    <TouchableOpacity
      onPress={() => handleSelectItem(item)}
      activeOpacity={0.7}
    >
      <Card style={styles.itemCard}>
        <View style={styles.itemCardContent}>
          <View style={styles.itemColorBadge}>
            <View 
              style={[
                styles.colorIndicator,
                { backgroundColor: item.category?.color || CATEGORY_COLORS[0].value }
              ]} 
            />
          </View>
          <View style={styles.itemCardInfo}>
            <Text style={[styles.itemCardName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.itemCardCategory, { color: colors.textSecondary }]}>
              {item.category?.name}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderItemList = () => (
    <>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text, backgroundColor: colors.card }]}
          placeholder="Buscar item..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <LoadingSpinner message="Carregando itens..." />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItemCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.itemsList}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          ListEmptyComponent={
            <EmptyState
              icon="cube-outline"
              title="Nenhum item encontrado"
              message={searchQuery ? 'Tente outro termo de busca' : 'Cadastre itens primeiro'}
            />
          }
        />
      )}
    </>
  );

  const renderItemDetails = () => {
    if (!selectedItem) return null;

    return (
      <KeyboardAvoidingView 
        style={styles.detailsContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
              <Text style={[styles.backText, { color: colors.primary }]}>Voltar</Text>
            </TouchableOpacity>

            <Card style={styles.selectedItemCard}>
              <View style={styles.selectedItemHeader}>
                <View style={styles.itemColorBadge}>
                  <View 
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: selectedItem.category?.color || CATEGORY_COLORS[0].value }
                    ]} 
                  />
                </View>
                <View style={styles.selectedItemInfo}>
                  <Text style={[styles.selectedItemName, { color: colors.text }]}>
                    {selectedItem.name}
                  </Text>
                  <Text style={[styles.selectedItemCategory, { color: colors.textSecondary }]}>
                    {selectedItem.category?.name}
                  </Text>
                </View>
              </View>
            </Card>

            <Input
              label="Quantidade"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="1"
              keyboardType="decimal-pad"
            />

            <View style={styles.unitContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Unidade</Text>
              <View style={styles.unitPicker}>
                {availableUnits.map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitChip,
                      {
                        backgroundColor: selectedUnit === unit ? colors.primary : colors.card,
                        borderColor: selectedUnit === unit ? colors.primary : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setSelectedUnit(unit)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.unitChipText,
                        { color: selectedUnit === unit ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {getUnitLabel(unit)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.priorityContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Prioridade</Text>
              <View style={styles.priorityButtons}>
                {(['low', 'medium', 'high'] as const).map((p) => {
                  const isSelected = priority === p;
                  const priorityColors = {
                    low: colors.success,
                    medium: '#FFA500',
                    high: colors.error,
                  };
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityButton,
                        {
                          backgroundColor: isSelected ? priorityColors[p] : colors.card,
                          borderColor: isSelected ? priorityColors[p] : colors.cardBorder,
                        },
                      ]}
                      onPress={() => setPriority(p)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          { color: isSelected ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Input
              label="Observações (opcional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Ex: Marca específica, tamanho..."
              multiline
              numberOfLines={3}
              style={styles.notesInput}
            />

            <View style={styles.actions}>
              <Button
                title="Cancelar"
                onPress={handleBack}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title="Adicionar"
                onPress={handleAdd}
                loading={isAdding}
                style={styles.actionButton}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {selectedItem ? 'Definir Quantidade' : 'Adicionar à Lista'}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        {selectedItem ? renderItemDetails() : renderItemList()}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingLeft: 44,
    paddingRight: 44,
    borderRadius: 12,
    fontSize: 16,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  itemsList: {
    padding: 16,
    paddingTop: 0,
  },
  itemCard: {
    marginBottom: 12,
  },
  itemCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemColorBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  itemCardInfo: {
    flex: 1,
  },
  itemCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemCardCategory: {
    fontSize: 14,
    marginBottom: 2,
  },
  itemCardUnit: {
    fontSize: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedItemCard: {
    marginBottom: 16,
  },
  selectedItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedItemInfo: {
    flex: 1,
  },
  selectedItemName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  selectedItemCategory: {
    fontSize: 14,
  },
  unitContainer: {
    marginTop: 16,
  },
  unitPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    minWidth: 60,
    alignItems: 'center',
  },
  unitChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  priorityContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesInput: {
    marginTop: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
  },
});
