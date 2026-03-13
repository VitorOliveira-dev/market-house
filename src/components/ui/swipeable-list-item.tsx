/**
 * SwipeableListItem Component
 * List item with swipe gestures for delete (left) and add to cart (right)
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface SwipeableListItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void; // Delete
  onSwipeRight?: () => void; // Add to cart
  showLeftAction?: boolean;
  showRightAction?: boolean;
  leftActionLabel?: string;
  rightActionLabel?: string;
}

export function SwipeableListItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  showLeftAction = true,
  showRightAction = true,
  leftActionLabel = 'Excluir',
  rightActionLabel = 'Carrinho',
}: SwipeableListItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (!showLeftAction || !onSwipeLeft) return null;

    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <RectButton style={[styles.leftAction, { backgroundColor: colors.error }]} onPress={onSwipeLeft}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>{leftActionLabel}</Text>
        </Animated.View>
      </RectButton>
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (!showRightAction || !onSwipeRight) return null;

    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <RectButton style={[styles.rightAction, { backgroundColor: colors.primary }]} onPress={onSwipeRight}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="cart-outline" size={24} color={colorScheme === 'dark' ? colors.primaryText : '#FFFFFF'} />
          <Text style={[styles.actionText, { color: colorScheme === 'dark' ? colors.primaryText : '#FFFFFF' }]}>
            {rightActionLabel}
          </Text>
        </Animated.View>
      </RectButton>
    );
  };

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
    >
      <View style={[styles.itemContainer, { backgroundColor: colors.card }]}>
        {children}
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    padding: 16,
  },
  leftAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
