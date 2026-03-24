import { Platform } from 'react-native';

export const Colors = {
  dark: {
    background: '#0A0A0F',
    surface: '#14141F',
    surfaceLight: '#1E1E2E',
    card: '#1A1A2E',
    text: '#F0F0F5',
    textSecondary: '#8888AA',
    textMuted: '#555577',
    accent: '#6C5CE7',
    accentLight: '#A29BFE',
    accentGlow: 'rgba(108, 92, 231, 0.3)',
    border: '#2A2A3E',
    danger: '#FF6B6B',
    success: '#51CF66',
    white: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
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
