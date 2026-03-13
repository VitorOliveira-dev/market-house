/**
 * Theme configuration for Market House app
 * Includes colors for light and dark modes following the design system
 */

import { Platform } from 'react-native';

const primaryColor = '#E6C77A';

export const Colors = {
  light: {
    // Texto
    text: '#3A3835',
    textSecondary: '#8A857D',
    
    // Fundo
    background: '#FFFFFF',
    
    // Cards
    card: '#FAF7F2',
    cardBorder: '#E8E6E1',
    
    // Input
    input: '#FFFFFF',
    inputFocusBorder: '#E6C77A',
    
    // Botões
    primary: '#E6C77A',
    primaryLight: '#F2E3B3',
    primaryText: '#FFFFFF',
    primaryTextAlt: '#3A3835',
    secondary: '#F2E3B3',
    secondaryText: '#9C7A2B',
    secondaryBorder: '#F2E3B3',
    
    // Navegação
    tint: primaryColor,
    tabIconDefault: '#8A857D',
    tabIconSelected: primaryColor,
    
    // Estados
    success: '#4CAF50',
    warning: '#FFA726',
    error: '#EF5350',
    info: '#29B6F6',
  },
  dark: {
    // Texto
    text: '#FFFFFF',
    textSecondary: '#8A857D',
    
    // Fundo
    background: '#12110F',
    
    // Cards
    card: '#23201C',
    cardBorder: '#3A352F',
    
    // Input
    input: '#1A1815',
    inputFocusBorder: '#E6C77A',
    
    // Botões
    primary: '#E6C77A',
    primaryLight: '#3A352F',
    primaryText: '#12110F',
    secondary: '#23201C',
    secondaryText: '#E6C77A',
    secondaryBorder: '#E6C77A',
    
    // Navegação
    tint: primaryColor,
    tabIconDefault: '#8A857D',
    tabIconSelected: primaryColor,
    
    // Estados
    success: '#4CAF50',
    warning: '#FFA726',
    error: '#EF5350',
    info: '#29B6F6',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
