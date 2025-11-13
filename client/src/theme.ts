import { createTheme } from '@mui/material/styles'

// Module augmentation to expose custom design tokens on the theme
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      gradients: {
        brand: string
        hero: string
        accent: string
      }
      glass: {
        bg: string
        border: string
        shadow: string
      }
    }
  }
  interface ThemeOptions {
    custom?: {
      gradients?: Partial<Theme['custom']['gradients']>
      glass?: Partial<Theme['custom']['glass']>
    }
  }
}

export default createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#43A047', // Nature green - represents growth and renewal
      light: '#66BB6A',
      dark: '#2E7D32',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFA726', // Warm orange - represents creativity and energy
      light: '#FFB74D',
      dark: '#F57C00',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F1F8F4', // Soft mint green background
      paper: 'rgba(255, 255, 255, 0.95)',
    },
    text: {
      primary: '#1B5E20', // Deep forest green
      secondary: '#558B2F', // Medium green
    },
    error: {
      main: '#EF5350',
    },
    success: {
      main: '#66BB6A',
    },
    warning: {
      main: '#FFA726',
    },
    divider: 'rgba(67, 160, 71, 0.12)',
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 800,
      background: 'linear-gradient(135deg, #43A047 0%, #66BB6A 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  // Eco custom tokens for gradients, glassmorphism and shadows
  custom: {
    gradients: {
      brand: 'linear-gradient(135deg,#2E7D32 0%,#66BB6A 50%,#00BFA5 100%)',
      hero:
        'radial-gradient(1200px 600px at 10% -10%,rgba(198,255,0,.20),transparent), linear-gradient(135deg,#1B5E20 0%,#009688 100%)',
      accent: 'linear-gradient(135deg,#C6FF00 0%,#66BB6A 100%)',
    },
    glass: {
      bg: 'rgba(255,255,255,.75)',
      border: '1px solid rgba(255,255,255,.35)',
      shadow: '0 10px 30px rgba(46,125,50,.18)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          // Subtle noise overlay using CSS radial gradients (no asset needed)
          backgroundImage:
            'radial-gradient(1px 1px at 20% 30%, rgba(0,0,0,.02) 0, rgba(0,0,0,0) 100%), radial-gradient(1px 1px at 80% 70%, rgba(0,0,0,.02) 0, rgba(0,0,0,0) 100%)',
        },
        // Respect reduced motion preferences for users
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animation: 'none !important',
            transition: 'none !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingTop: 10,
          paddingBottom: 10,
          fontWeight: 700,
          transition: 'transform .15s ease, box-shadow .2s ease, background .3s',
          '&:hover': { transform: 'translateY(-2px)' },
        },
        contained: {
          boxShadow: '0 4px 12px rgba(67, 160, 71, 0.2)',
          background: 'linear-gradient(135deg, #43A047 0%, #66BB6A 100%)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(67, 160, 71, 0.35)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(67, 160, 71, 0.08)',
          borderRadius: 16,
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.95)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(67, 160, 71, 0.15)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(67, 160, 71, 0.08)',
            transform: 'scale(1.1)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateX(4px)',
          },
        },
      },
    },
  },
})
