// Unified Delivero Theme System
// Use across all web (React/CSS) and mobile (React Native) components

export const theme = {
  // Color Palette
  colors: {
    primary: '#FF6B00', // Orange - Main brand color
    secondary: '#0066FF', // Blue - Secondary actions
    success: '#4CAF50', // Green - Success states
    warning: '#FF9800', // Amber - Warning/Pending
    error: '#D32F2F', // Red - Error/Danger
    info: '#2196F3', // Light Blue - Information

    // Neutrals
    white: '#FFFFFF',
    background: '#F5F5F5',
    surface: '#FAFAFA',
    border: '#E0E0E0',
    divider: '#BDBDBD',
    text: {
      primary: '#212121', // Main text
      secondary: '#666666', // Secondary text
      disabled: '#BDBDBD' // Disabled text
    },
    
    // Status Colors
    pending: '#FF9800',
    confirmed: '#4CAF50',
    completed: '#4CAF50',
    cancelled: '#D32F2F',
    open: '#FF9800',
    inProgress: '#2196F3',
    resolved: '#4CAF50',
    closed: '#757575',

    // User Role Colors
    customer: '#2196F3',
    rider: '#FF9800',
    manager: '#9C27B0',
    admin: '#D32F2F',

    // Shadows
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.2)'
  },

  // Typography
  typography: {
    // Font sizes (in pixels/pt)
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
    // Font weights
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2
    }
  },

  // Spacing System (8px base)
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

  // Shadows (Web CSS)
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },

  // Buttons
  buttons: {
    base: {
      web: {
        padding: '10px 16px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      },
      mobile: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        minHeight: 44
      }
    },
    primary: {
      web: {
        backgroundColor: '#FF6B00',
        color: '#fff'
      },
      mobile: {
        backgroundColor: '#FF6B00'
      }
    },
    secondary: {
      web: {
        backgroundColor: '#0066FF',
        color: '#fff'
      },
      mobile: {
        backgroundColor: '#0066FF'
      }
    },
    outline: {
      web: {
        backgroundColor: 'transparent',
        color: '#FF6B00',
        border: '2px solid #FF6B00'
      },
      mobile: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#FF6B00'
      }
    },
    danger: {
      web: {
        backgroundColor: '#D32F2F',
        color: '#fff'
      },
      mobile: {
        backgroundColor: '#D32F2F'
      }
    }
  },

  // Form Elements
  forms: {
    input: {
      web: {
        padding: '10px 12px',
        borderRadius: '6px',
        border: '1px solid #E0E0E0',
        fontSize: '14px',
        fontFamily: 'inherit'
      },
      mobile: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        fontSize: 14
      }
    },
    label: {
      web: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#212121',
        marginBottom: '6px',
        display: 'block'
      },
      mobile: {
        fontSize: 12,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 6
      }
    },
    error: {
      web: {
        color: '#D32F2F',
        fontSize: '12px',
        marginTop: '4px'
      },
      mobile: {
        color: '#D32F2F',
        fontSize: 12,
        marginTop: 4
      }
    }
  },

  // Tables
  tables: {
    header: {
      web: {
        backgroundColor: '#212121',
        color: '#fff',
        fontWeight: '600'
      },
      mobile: {
        backgroundColor: '#212121'
      }
    },
    cell: {
      web: {
        padding: '12px',
        borderBottom: '1px solid #E0E0E0'
      },
      mobile: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0'
      }
    }
  },

  // Cards
  cards: {
    base: {
      web: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      },
      mobile: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
      }
    }
  },

  // Breakpoints (Web)
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};

// Helper function to get responsive styles
export const getResponsiveStyle = (mobile, tablet, desktop) => {
  return {
    '@media (max-width: 640px)': mobile || {},
    '@media (min-width: 641px) and (max-width: 1024px)': tablet || mobile || {},
    '@media (min-width: 1025px)': desktop || {}
  };
};

// Helper function to merge theme styles
export const mergeThemeStyles = (...styles) => {
  return Object.assign({}, ...styles);
};

// CSS-in-JS Styles for React Web Components
export const webStyles = {
  // Global
  body: {
    fontFamily: '"-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "sans-serif"',
    backgroundColor: theme.colors.background,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.normal
  },

  // Container
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: `0 ${theme.spacing[4]}px`
  },

  // Buttons
  buttonPrimary: {
    ...theme.buttons.base.web,
    ...theme.buttons.primary.web,
    '&:hover': {
      backgroundColor: '#E85A00',
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows.md
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: theme.shadows.sm
    }
  },

  buttonSecondary: {
    ...theme.buttons.base.web,
    ...theme.buttons.secondary.web,
    '&:hover': {
      backgroundColor: '#0052CC'
    }
  },

  buttonOutline: {
    ...theme.buttons.base.web,
    ...theme.buttons.outline.web,
    '&:hover': {
      backgroundColor: '#FFF0E6'
    }
  },

  buttonDanger: {
    ...theme.buttons.base.web,
    ...theme.buttons.danger.web,
    '&:hover': {
      backgroundColor: '#B71C1C'
    }
  },

  // Forms
  formGroup: {
    marginBottom: theme.spacing[4]
  },

  input: {
    ...theme.forms.input.web,
    '&:focus': {
      outline: 'none',
      borderColor: theme.colors.primary,
      boxShadow: `0 0 0 3px ${theme.colors.primary}20`
    },
    '&:disabled': {
      backgroundColor: theme.colors.background,
      color: theme.colors.text.disabled,
      cursor: 'not-allowed'
    }
  },

  label: theme.forms.label.web,

  // Tables
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: theme.spacing[4]
  },

  tableHeader: {
    ...theme.tables.header.web,
    padding: theme.tables.cell.web.padding
  },

  tableCell: theme.tables.cell.web,

  // Cards
  card: theme.cards.base.web,

  // Typography
  h1: {
    fontSize: `${theme.typography.fontSize['5xl']}px`,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: theme.typography.lineHeight.tight,
    marginBottom: theme.spacing[4]
  },

  h2: {
    fontSize: `${theme.typography.fontSize['4xl']}px`,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: theme.typography.lineHeight.tight,
    marginBottom: theme.spacing[3]
  },

  h3: {
    fontSize: `${theme.typography.fontSize['3xl']}px`,
    fontWeight: theme.typography.fontWeight.semibold,
    lineHeight: theme.typography.lineHeight.tight,
    marginBottom: theme.spacing[2]
  },

  p: {
    fontSize: `${theme.typography.fontSize.base}px`,
    lineHeight: theme.typography.lineHeight.normal,
    marginBottom: theme.spacing[3]
  }
};

// Mobile Native Styles for React Native Components
export const mobileStyles = {
  // Global Container
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },

  // Safe Area
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white
  },

  // Header
  header: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },

  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary
  },

  // Buttons
  buttonPrimary: {
    ...theme.buttons.base.mobile,
    ...theme.buttons.primary.mobile,
    backgroundColor: theme.colors.primary
  },

  buttonSecondary: {
    ...theme.buttons.base.mobile,
    ...theme.buttons.secondary.mobile,
    backgroundColor: theme.colors.secondary
  },

  buttonOutline: {
    ...theme.buttons.base.mobile,
    ...theme.buttons.outline.mobile,
    borderColor: theme.colors.primary
  },

  buttonDanger: {
    ...theme.buttons.base.mobile,
    ...theme.buttons.danger.mobile,
    backgroundColor: theme.colors.error
  },

  buttonText: (type = 'primary') => ({
    color: '#fff',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold
  }),

  // Forms
  formGroup: {
    marginBottom: theme.spacing[4]
  },

  label: {
    ...theme.forms.label.mobile,
    marginBottom: theme.spacing[1]
  },

  input: {
    ...theme.forms.input.mobile,
    height: 44,
    color: theme.colors.text.primary
  },

  // Cards
  card: {
    ...theme.cards.base.mobile,
    marginBottom: theme.spacing[2]
  },

  // Lists
  listItem: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },

  // Typography
  h1: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2]
  },

  h2: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2]
  },

  h3: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1]
  },

  body: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.normal
  },

  caption: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary
  }
};

export default theme;
