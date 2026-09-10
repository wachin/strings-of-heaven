import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ChordsState {
  selectedKey: string;
  selectedSuffix: string;
  currentPositionIndex: number;
}

const initialState: ChordsState = {
  selectedKey: 'C',
  selectedSuffix: 'major',
  currentPositionIndex: 0,
};

const chordsSlice = createSlice({
  name: 'chords',
  initialState,
  reducers: {
    setKey(state, action: PayloadAction<string>) {
      state.selectedKey = action.payload;
      state.currentPositionIndex = 0;
    },
    setSuffix(state, action: PayloadAction<string>) {
      state.selectedSuffix = action.payload;
      state.currentPositionIndex = 0;
    },
    setPositionIndex(state, action: PayloadAction<number>) {
      state.currentPositionIndex = action.payload;
    },
  },
});

export const { setKey, setSuffix, setPositionIndex } = chordsSlice.actions;
export default chordsSlice.reducer;