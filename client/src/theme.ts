import { createTheme } from '@mui/material/styles';

export const lightCommandCenterTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0284c7', // Electric Blue
      light: '#38bdf8',
      dark: '#0369a1',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#10b981', // Cyber Green
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#f59e0b', // Amber Alert
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff'
    },
    error: {
      main: '#ef4444', // Crimson Alert
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff'
    },
    info: {
      main: '#0ea5e9',
      light: '#7dd3fc',
      dark: '#0284c7'
    },
    background: {
      default: '#f8fafc', // Crisp modern white/slate canvas
      paper: '#ffffff'
    },
    text: {
      primary: '#0f172a', // Deep slate primary
      secondary: '#64748b' // Muted slate secondary
    },
    divider: '#e2e8f0'
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.025em', color: '#0f172a' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em', color: '#0f172a' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em', color: '#0f172a' },
    h4: { fontWeight: 700, letterSpacing: '-0.015em', color: '#0f172a' },
    h5: { fontWeight: 700, color: '#0f172a' },
    h6: { fontWeight: 700, color: '#0f172a' },
    subtitle1: { color: '#64748b' },
    subtitle2: { color: '#64748b' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6, color: '#334155' },
    body2: { fontSize: '0.84375rem', lineHeight: 1.5, color: '#64748b' },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  shape: {
    borderRadius: 10
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f8fafc',
          color: '#0f172a',
          scrollbarColor: '#cbd5e1 #f8fafc',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
            height: 8
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            background: '#f8fafc'
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            background: '#cbd5e1',
            borderRadius: 4
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          backgroundImage: 'none',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
          borderRadius: 12
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          fontWeight: 600
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
          }
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6
        }
      }
    }
  }
});
