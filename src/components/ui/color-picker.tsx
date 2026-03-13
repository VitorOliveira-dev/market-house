/**
 * Color Picker Component
 * Allows selecting a color from predefined palette
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export const CATEGORY_COLORS = [
  { value: '#FF6B6B', name: 'Vermelho' },
  { value: '#4ECDC4', name: 'Turquesa' },
  { value: '#45B7D1', name: 'Azul' },
  { value: '#96CEB4', name: 'Verde Menta' },
  { value: '#FFEAA7', name: 'Amarelo' },
  { value: '#DFE6E9', name: 'Cinza Claro' },
  { value: '#A29BFE', name: 'Roxo' },
  { value: '#FD79A8', name: 'Rosa' },
  { value: '#FDCB6E', name: 'Laranja' },
  { value: '#6C5CE7', name: 'Violeta' },
  { value: '#00B894', name: 'Verde' },
  { value: '#E17055', name: 'Terracota' },
];

interface ColorPickerProps {
  selectedColor?: string;
  onColorSelect: (color: string) => void;
  label?: string;
}

export function ColorPicker({ selectedColor, onColorSelect, label }: ColorPickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <View style={styles.colorGrid}>
        {CATEGORY_COLORS.map((color) => (
          <TouchableOpacity
            key={color.value}
            style={[
              styles.colorOption,
              { backgroundColor: color.value },
              selectedColor === color.value && styles.selectedColor,
            ]}
            onPress={() => onColorSelect(color.value)}
            activeOpacity={0.7}
          >
            {selectedColor === color.value && (
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
