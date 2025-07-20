import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ChatSettings } from '../types';

interface SettingsState extends ChatSettings {
  apiKey: string;
  darkMode: boolean;
  rightSidebarOpen: boolean;
}

const initialState: SettingsState = {
  model: 'llama-3.1-70b-instruct',
  imageModel: 'flux.1-schnell',
  audioModel: 'whisper-large-v3',
  embeddingModel: 'nomic-embed-text-v1.5',
  temperature: 0.7,
  maxTokens: 1000,
  enableCache: false,
  apiKey: '',
  darkMode: true,
  rightSidebarOpen: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      Object.assign(state, action.payload);
    },
    setApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    toggleRightSidebar: (state) => {
      state.rightSidebarOpen = !state.rightSidebarOpen;
    },
  },
});

export const { updateSettings, setApiKey, toggleDarkMode, toggleRightSidebar } = settingsSlice.actions;
export default settingsSlice.reducer;