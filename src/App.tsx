import React, { useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { updateSettings } from './store/settingsSlice';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store } from './store';
import type { RootState } from './store';
import { lightTheme, darkTheme } from './styles/theme';
import { Home } from './pages/Home';

const AppContent: React.FC = () => {
  const { darkMode } = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('llm-chat-settings');
    if (savedSettings) {
      try {
        dispatch(updateSettings(JSON.parse(savedSettings)));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Home />
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;