import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Chat, Message } from '../types';

interface ChatState {
  chats: Chat[];
  activeChat: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  activeChat: null,
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    createChat: (state, action: PayloadAction<{ model: string }>) => {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [],
        model: action.payload.model,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        totalTokens: 0,
        totalCost: 0,
      };
      state.chats.unshift(newChat);
      state.activeChat = newChat.id;
    },
    
    setActiveChat: (state, action: PayloadAction<string>) => {
      state.activeChat = action.payload;
    },
    
    addMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      const chat = state.chats.find(c => c.id === action.payload.chatId);
      if (chat) {
        chat.messages.push(action.payload.message);
        chat.updatedAt = Date.now();
        
        // Update title from first user message
        if (chat.messages.length === 1 && action.payload.message.role === 'user') {
          chat.title = action.payload.message.content.slice(0, 50) + '...';
        }
      }
    },
    
    updateMessage: (state, action: PayloadAction<{ 
      chatId: string; 
      messageId: string; 
      content: string;
      tokens?: number;
      cost?: number;
    }>) => {
      const chat = state.chats.find(c => c.id === action.payload.chatId);
      if (chat) {
        const message = chat.messages.find(m => m.id === action.payload.messageId);
        if (message) {
          message.content = action.payload.content;
          if (action.payload.tokens) message.tokens = action.payload.tokens;
          if (action.payload.cost) message.cost = action.payload.cost;
        }
      }
    },
    
    deleteChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter(c => c.id !== action.payload);
      if (state.activeChat === action.payload) {
        state.activeChat = state.chats[0]?.id || null;
      }
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    loadChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
  },
});

export const {
  createChat,
  setActiveChat,
  addMessage,
  updateMessage,
  deleteChat,
  setLoading,
  setError,
  loadChats,
} = chatSlice.actions;

export default chatSlice.reducer;