export const THEME_STORAGE_KEY = 'recipe-theme';

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export const LIGHT_THEME_COLORS: ThemeColors = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#D4A574',
  background: '#FFF8F0',
  surface: '#FFFFFF',
  text: '#2D2D2D',
  textSecondary: '#6B6B6B',
  border: '#E5E1D8',
};

export const DARK_THEME_COLORS: ThemeColors = {
  primary: '#FF8787',
  secondary: '#5FD9CF',
  accent: '#E5B685',
  background: '#0F0F0F',
  surface: '#1A1A1A',
  text: '#F5F1E8',
  textSecondary: '#A0A0A0',
  border: '#2A2A2A',
};
