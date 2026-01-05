export const colors = {
  // Primary - Soft purple/lavender (calm, feminine, health)
  primary: '#9B87F5',
  primaryLight: '#C4B5FD',
  primaryDark: '#7C65DC',
  
  // Secondary - Cream/off-white (warm, accessible)
  secondary: '#FFF9F0',
  secondaryLight: '#FFFBF5',
  secondaryDark: '#F5E6D3',
  
  // Accent - Deep blue (trust, night/moon)
  accent: '#4A5568',
  accentLight: '#718096',
  accentDark: '#2D3748',
  
  // Moon theme
  moonLight: '#FEF3C7',
  moonGlow: '#FCD34D',
  
  // Neutrals
  background: '#FFFFFF',
  surface: '#F7FAFC',
  text: '#2D3748',
  textSecondary: '#718096',
  textLight: '#A0AEC0',
  border: '#E2E8F0',
  
  // Status colors
  success: '#48BB78',
  warning: '#F6AD55',
  error: '#FC8181',
  info: '#63B3ED',
  
  // Period tracking specific
  flow: {
    light: '#FED7E2',
    medium: '#FC8181',
    heavy: '#E53E3E',
  },
  
  // Cycle phases
  menstruation: '#FC8181',
  follicular: '#F6AD55',
  ovulation: '#48BB78',
  luteal: '#9B87F5',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export type Theme = typeof theme;
