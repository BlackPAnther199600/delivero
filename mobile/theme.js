// Mobile Theme Configuration
// Mirrors the unified theme system for React Native

export const mobileTheme = {
  // Color Palette
  colors: {
    primary: '#FF6B00', // Orange
    secondary: '#0066FF', // Blue
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#D32F2F',
    info: '#2196F3',
    white: '#FFFFFF',
    background: '#F5F5F5',
    surface: '#FAFAFA',
    border: '#E0E0E0',
    divider: '#BDBDBD',
    text: {
      primary: '#212121',
      secondary: '#666666',
      disabled: '#BDBDBD'
    },
    pending: '#FF9800',
    confirmed: '#4CAF50',
    completed: '#4CAF50',
    cancelled: '#D32F2F',
    open: '#FF9800',
    inProgress: '#2196F3',
    resolved: '#4CAF50',
    closed: '#757575',
    customer: '#2196F3',
    rider: '#FF9800',
    manager: '#9C27B0',
    admin: '#D32F2F'
  },

  // Typography
  typography: {
    fontSize: {
      xs: 10,
      sm: 12,
      base: 14,
      lg: 16,
      xl: 18,
      '2xl': 20,
      '3xl': 24,
      '4xl': 28,
      '5xl': 32
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },

  // Spacing
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96
  },

  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    base: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999
  },

  // Font Family
  fontFamily: {
    default: 'System',
    mono: 'Courier New'
  }
};

export default mobileTheme;
