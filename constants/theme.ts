/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#000000',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#000000',
    primary: '#000000', // Jan Himachal Black
    primaryGradientStart: '#1a1a1a', 
    primaryGradientEnd: '#000000',
    secondaryGradientStart: '#333333',
    secondaryGradientEnd: '#000000',
    accent: '#333333', 
    success: '#4CAF50', 
    error: '#EF4444', 
    headerBg: '#fff',
    borderColor: '#e0e0e0',
    categoryBg: '#000000', 
    categoryText: '#fff',
    subcategoryBg: '#F5F5F5', // Light Grey tint
    subcategoryText: '#000000',
    placeholderText: '#999',
    card: '#fff',
    danger: '#E31E24',
    cardShadow: '#000',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
    primary: '#ffffff', // White in dark mode for contrast
    primaryGradientStart: '#ffffff',
    primaryGradientEnd: '#e0e0e0',
    secondaryGradientStart: '#cccccc',
    secondaryGradientEnd: '#999999',
    accent: '#ffffff',
    success: '#4CAF50',
    error: '#EF4444',
    headerBg: '#151718',
    borderColor: '#333',
    categoryBg: '#000000', // Keep Black nav even in dark mode? Or Dark Grey #333? Let's go #000 for brand consistency.
    categoryText: '#fff',
    subcategoryBg: '#333333', 
    subcategoryText: '#ffffff',
    placeholderText: '#666',
    card: '#1E1E1E',
    danger: '#EF4444',
    cardShadow: '#000',
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
