import { createTheme } from '@mui/material/styles';

const common = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: (theme: any) => ({
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.mode === 'light' ? '#f1f1f1' : '#2b2b2b',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'light' ? '#c1c1c1' : '#6b6b6b',
            borderRadius: '4px',
          },
          background:
            theme.palette.mode === 'light'
              ? 'linear-gradient(180deg, #eef2ff 0%, #ffffff 100%)'
              : 'linear-gradient(180deg, #1a1a1a 0%, #121212 100%)',
        },
      }),
    },
  },
} as const;

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
      light: '#a5b4fc',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#d97706',
      light: '#fbbf24',
      dark: '#b45309',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  ...common,
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6',
      light: '#c4b5fd',
      dark: '#6d28d9',
    },
    secondary: {
      main: '#fbbf24',
      light: '#fde68a',
      dark: '#b45309',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  ...common,
});