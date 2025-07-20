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
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '4px',
          },
        },
      },
    },
  },
} as const;

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6366f1' },
    secondary: { main: '#d97706' },
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
    primary: { main: '#8b5cf6' },
    secondary: { main: '#fbbf24' },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  ...common,
});