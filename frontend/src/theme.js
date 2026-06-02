import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#5b9cf5' : '#1a73e8',
        dark: mode === 'dark' ? '#3d7fd6' : '#1557b0',
        light: mode === 'dark' ? '#7eb3f7' : '#4a90e8',
      },
      background: {
        default: mode === 'dark' ? '#0f1115' : '#eef1f5',
        paper: mode === 'dark' ? '#1a1d24' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f3f4f6' : '#1c1c1e',
        secondary: mode === 'dark' ? '#9ca3af' : '#6b7280',
      },
      divider: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      action: {
        hover: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 24,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow:
              mode === 'dark'
                ? '0 2px 16px rgba(0, 0, 0, 0.35)'
                : '0 2px 16px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

export default getAppTheme('light');
