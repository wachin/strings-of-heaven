import { combineReducers, configureStore } from '@reduxjs/toolkit';
import chords from './chordsSlice';
import scales from './scalesSlice';
import ui from './uiSlice';

export const rootReducer = combineReducers({ chords, scales, ui });
export type RootState = ReturnType<typeof rootReducer>;

export const createAppStore = () => configureStore({ reducer: rootReducer });

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];

export * from './chordsSlice';
export * from './scalesSlice';
export * from './uiSlice';
export * from './selectors';
export * from './thunks';