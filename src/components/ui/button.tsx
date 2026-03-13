/**
 * Button Component
 * Reusable button with theme support
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, type TouchableOpacityProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Button({ 
  title, 
  variant = 'primary', 
  loading = false, 
  fullWidth = false,
  leftIcon,
  children,
  disabled,
  style,
  ...props 
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  let buttonStyle: any = {};
  let textStyle: any = {};

  switch (variant) {
    case 'primary':
      buttonStyle = {
        backgroundColor: colors.primary,
        borderWidth: 0,
      };
      textStyle = { color: colors.primaryText };
      break;
    case 'secondary':
      buttonStyle = {
        backgroundColor: colors.secondary,
        borderWidth: colorScheme === 'dark' ? 1 : 0,
        borderColor: colors.secondaryBorder,
      };
      textStyle = { color: colors.secondaryText };
      break;
    case 'outline':
      buttonStyle = {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
      };
      textStyle = { color: colors.primary };
      break;
    case 'ghost':
      buttonStyle = {
        backgroundColor: 'transparent',
        borderWidth: 0,
      };
      textStyle = { color: colors.textSecondary };
      break;
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyle,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textStyle.color} />
      ) : children ? (
        children
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
