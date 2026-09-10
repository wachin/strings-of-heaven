import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Instrument, Theme } from '../types';

export interface UiState {
  theme: Theme;
  instrument: Instrument;
}

const initialState: UiState = {
  theme: 'dark',
  instrument: 'guitar',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setInstrument(state, action: PayloadAction<Instrument>) {
      state.instrument = action.payload;
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
  },
});

export const { setInstrument, setTheme, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;