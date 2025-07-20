import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Analytics } from '../types';

const initialState: Analytics = {
  totalRequests: 0,
  totalCost: 0,
  averageLatency: 0,
  cacheHitRate: 0,
  requestsToday: 0,
  costToday: 0,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    updateAnalytics: (state, action: PayloadAction<Partial<Analytics>>) => {
      Object.assign(state, action.payload);
    },
    incrementRequests: (state) => {
      state.totalRequests += 1;
      state.requestsToday += 1;
    },
    addCost: (state, action: PayloadAction<number>) => {
      state.totalCost += action.payload;
      state.costToday += action.payload;
    },
  },
});

export const { updateAnalytics, incrementRequests, addCost } = analyticsSlice.actions;
export default analyticsSlice.reducer;