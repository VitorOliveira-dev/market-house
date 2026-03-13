/**
 * Edit Cart Item Modal
 * Allows editing quantity, unit, price, and notes of an existing cart item
 */

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Input } from '@/components/ui';
import { getUnitLabel } from '@/constants/units';
import type { CartItem } from '@/types';

interface EditCartItemModalProps {
  visible: boolean;
  item: CartItem | null;
  onClose: () => void;
  onUpdate: (
    id: string,
    quantity: number,
    unit: string,
    price: number,
    notes?: string
  ) => Promise<void>;
}

export function EditCartItemModal({
  visible,
  item,
  onClose,
  onUpdate,
}: EditCartItemModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [quantity, setQuantity] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState('un');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Get available units from the item's category
  const availableUnits = useMemo(() => {
    if (!item?.item?.category?.units) return ['un'];
    const units = item.item.category.units as string[];
    return units.length > 0 ? units : ['un'];
  }, [item]);

  // Reset form when item changes or modal opens
  useEffect(() => {
    if (item && visible) {
      setQuantity(item.quantity.toString());
      setSelectedUnit(item.unit || availableUnits[0] || 'un');
      setPrice(item.price.toString());
      setNotes(item.notes || '');
    }
  }, [item, visible, availableUnits]);

  const handleClose = () => {
    onClose();
    // Reset to initial values after modal closes
    setTimeout(() => {
      setQuantity('1');
      setSelectedUnit('un');
      setPrice('');
      setNotes('');
    }, 300);
  };

  const handleUpdate = async () => {
    if (!item) return;

    const quantityNum = parseFloat(quantity);
    const priceNum = parseFloat(price);
    
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return;
    }
    
    if (isNaN(priceNum) || priceNum <= 0) {
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(
        item.id,
        quantityNum,
        selectedUnit,
        priceNum,
        notes || undefined
      );
      handleClose();
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.text }]}>Editar Item</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Item Info */}
            {item && (
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {item.item?.name}
                </Text>
                {item.item?.category && (
                  <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>
                    {item.item.category.name}
                  </Text>
                )}
              </View>
            )}

            {/* Quantity Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Quantidade</Text>
              <Input
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Ex: 2"
                keyboardType="numeric"
                autoCorrect={false}
              />
            </View>

            {/* Unit Picker */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Unidade</Text>
              <View style={styles.unitPicker}>
                {availableUnits.map((unit) => {
                  const isSelected = selectedUnit === unit;
                  return (
                    <TouchableOpacity
                      key={unit}
                      onPress={() => setSelectedUnit(unit)}
                      style={[
                        styles.unitChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.card,
                          borderColor: isSelected ? colors.primary : colors.cardBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.unitChipText,
                          { color: isSelected ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {getUnitLabel(unit)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Price Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Preço Unitário</Text>
              <Input
                value={price}
                onChangeText={setPrice}
                placeholder="Ex: 10.50"
                keyboardType="decimal-pad"
                autoCorrect={false}
              />
            </View>

            {/* Subtotal Display */}
            {price && quantity && !isNaN(parseFloat(price)) && !isNaN(parseFloat(quantity)) && (
              <View style={[styles.subtotalContainer, { backgroundColor: colors.card }]}>
                <Text style={[styles.subtotalLabel, { color: colors.textSecondary }]}>
                  Subtotal:
                </Text>
                <Text style={[styles.subtotalValue, { color: colors.text }]}>
                  R$ {(parseFloat(price) * parseFloat(quantity)).toFixed(2)}
                </Text>
              </View>
            )}

            {/* Notes Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Observações</Text>
              <Input
                value={notes}
                onChangeText={setNotes}
                placeholder="Ex: Embalagem especial, promoção..."
                multiline
                numberOfLines={3}
                style={styles.notesInput}
              />
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.updateButton,
                {
                  backgroundColor: colors.primary,
                  opacity: isUpdating ? 0.6 : 1,
                },
              ]}
              onPress={handleUpdate}
              disabled={isUpdating}
            >
              <Text style={styles.updateButtonText}>
                {isUpdating ? 'Atualizando...' : 'Atualizar'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    marginBottom: 24,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 36,
  },
  itemInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(100, 100, 100, 0.05)',
    borderRadius: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
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
  subtotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  subtotalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtotalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  updateButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
