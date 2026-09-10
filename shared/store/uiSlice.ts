import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Instrument, Theme } from '../types';

export interface UiState {
  theme: Theme;
  instrument: Instrument;
  /** Bumped whenever a chord dataset finishes loading, so memoized selectors
   *  that depend on lazily-loaded data recompute. */
  dataEpoch: number;
}

const initialState: UiState = {
  theme: 'dark',
  instrument: 'guitar',
  dataEpoch: 0,
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
    bumpDataEpoch(state) {
      state.dataEpoch += 1;
    },
  },
});

export const { setInstrument, setTheme, toggleTheme, bumpDataEpoch } = uiSlice.actions;
export default uiSlice.reducer;