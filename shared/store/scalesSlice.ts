import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ScalesState {
  selectedRoot: string;
  selectedScale: string;
}

const initialState: ScalesState = {
  selectedRoot: 'C',
  selectedScale: 'major',
};

const scalesSlice = createSlice({
  name: 'scales',
  initialState,
  reducers: {
    setRoot(state, action: PayloadAction<string>) {
      state.selectedRoot = action.payload;
    },
    setScale(state, action: PayloadAction<string>) {
      state.selectedScale = action.payload;
    },
  },
});

export const { setRoot, setScale } = scalesSlice.actions;
export default scalesSlice.reducer;