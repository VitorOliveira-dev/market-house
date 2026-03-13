/**
 * Household Selector Component
 * Allows users to switch between their households
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentHousehold } from '@/features/households/context/household-context';
import { useHouseholds } from '@/features/households/hooks/use-households';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { HouseholdWithRole } from '@/types';

export function HouseholdSelector() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { currentHousehold, setCurrentHousehold, isLoading: isContextLoading } =
    useCurrentHousehold();
  const { data: households, isLoading: isLoadingHouseholds } = useHouseholds();

  const handleSelectHousehold = async (household: HouseholdWithRole) => {
    await setCurrentHousehold(household);
    setIsModalVisible(false);
  };

  if (isContextLoading || isLoadingHouseholds) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!households || households.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.noHouseholdContainer}>
          <Ionicons name="home-outline" size={24} color={colors.textSecondary} />
          <Text style={[styles.noHouseholdText, { color: colors.textSecondary }]}>
            Nenhuma casa configurada
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          styles.selectorButton,
          { backgroundColor: colors.cardBorder },
        ]}
        onPress={() => setIsModalVisible(true)}
      >
        <View style={styles.householdInfo}>
          <Ionicons name="home" size={20} color={colors.primary} />
          <Text
            style={[styles.householdName, { color: colors.text }]}
            numberOfLines={1}
          >
            {currentHousehold?.name || 'Selecione uma casa'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: colors.card }]}
            onStartShouldSetResponder={() => true}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: colors.cardBorder },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Selecionar Casa
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.householdList}>
              {households.map((household) => (
                <TouchableOpacity
                  key={household.id}
                  style={[
                    styles.householdItem,
                    {
                      backgroundColor:
                        currentHousehold?.id === household.id
                          ? colors.primaryLight
                          : 'transparent',
                      borderBottomColor: colors.cardBorder,
                    },
                  ]}
                  onPress={() => handleSelectHousehold(household)}
                >
                  <View style={styles.householdItemContent}>
                    <Ionicons
                      name={
                        currentHousehold?.id === household.id
                          ? 'home'
                          : 'home-outline'
                      }
                      size={24}
                      color={
                        currentHousehold?.id === household.id
                          ? colors.primary
                          : colors.textSecondary
                      }
                    />
                    <View style={styles.householdItemText}>
                      <Text
                        style={[
                          styles.householdItemName,
                          {
                            color:
                              currentHousehold?.id === household.id
                                ? colors.primary
                                : colors.text,
                          },
                        ]}
                      >
                        {household.name}
                      </Text>
                      {household.description && (
                        <Text
                          style={[
                            styles.householdItemDescription,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {household.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  {currentHousehold?.id === household.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  householdInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  householdName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  noHouseholdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  noHouseholdText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  householdList: {
    maxHeight: 400,
  },
  householdItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  householdItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  householdItemText: {
    flex: 1,
  },
  householdItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  householdItemDescription: {
    fontSize: 14,
  },
});
