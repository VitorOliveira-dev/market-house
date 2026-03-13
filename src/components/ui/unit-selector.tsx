/**
 * Unit Selector Component
 * Allows selecting multiple units for a category
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { AVAILABLE_UNITS, type Unit } from '@/constants/units';

interface UnitSelectorProps {
  selectedUnits: string[];
  onUnitsChange: (units: string[]) => void;
  label?: string;
}

export function UnitSelector({ selectedUnits, onUnitsChange, label }: UnitSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const toggleUnit = (unitValue: string) => {
    if (selectedUnits.includes(unitValue)) {
      onUnitsChange(selectedUnits.filter(u => u !== unitValue));
    } else {
      onUnitsChange([...selectedUnits, unitValue]);
    }
  };

  const isSelected = (unitValue: string) => selectedUnits.includes(unitValue);

  // Group units by category
  const groupedUnits = AVAILABLE_UNITS.reduce((acc, unit) => {
    if (!acc[unit.category]) {
      acc[unit.category] = [];
    }
    acc[unit.category].push(unit);
    return acc;
  }, {} as Record<string, Unit[]>);

  const categoryLabels = {
    weight: 'Peso',
    volume: 'Volume',
    quantity: 'Quantidade',
    other: 'Outros',
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      
      <ScrollView 
        style={styles.scrollView}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedUnits).map(([category, units]) => (
          <View key={category} style={styles.categoryGroup}>
            <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
              {categoryLabels[category as keyof typeof categoryLabels]}
            </Text>
            <View style={styles.unitsGrid}>
              {units.map((unit) => {
                const selected = isSelected(unit.value);
                return (
                  <TouchableOpacity
                    key={unit.value}
                    style={[
                      styles.unitChip,
                      {
                        backgroundColor: selected ? colors.primary : colors.card,
                        borderColor: selected ? colors.primary : colors.cardBorder,
                      },
                    ]}
                    onPress={() => toggleUnit(unit.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        { color: selected ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {unit.value}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
      
      {selectedUnits.length > 0 && (
        <View style={[styles.selectedContainer, { backgroundColor: colors.cardBorder }]}>
          <Text style={[styles.selectedLabel, { color: colors.textSecondary }]}>
            Unidades selecionadas ({selectedUnits.length}):
          </Text>
          <Text style={[styles.selectedText, { color: colors.text }]}>
            {selectedUnits.join(', ')}
          </Text>
        </View>
      )}
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
  scrollView: {
    maxHeight: 300,
  },
  categoryGroup: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  unitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 4,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 2,
  },
  selectedContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  selectedLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedText: {
    fontSize: 13,
  },
});
