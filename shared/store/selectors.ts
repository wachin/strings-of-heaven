import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { getChord, getChordPositions, getSuffixes } from '../engine/chord_engine';
import { buildScale, harmonizeScale } from '../engine/music_theory';
import { ALL_KEYS } from '../constants/theory';

export const selectInstrument = (state: RootState) => state.ui.instrument;
export const selectTheme = (state: RootState) => state.ui.theme;

export const selectChordsState = (state: RootState) => state.chords;
export const selectScalesState = (state: RootState) => state.scales;

export const selectSelectedKey = (state: RootState) => state.chords.selectedKey;
export const selectSelectedSuffix = (state: RootState) => state.chords.selectedSuffix;

export const selectAllKeys = () => ALL_KEYS;

export const selectAllSuffixes = createSelector(
  [selectSelectedKey, selectInstrument],
  (key, instrument) => getSuffixes(key, instrument),
);

export const selectSelectedChord = createSelector(
  [selectSelectedKey, selectSelectedSuffix, selectInstrument],
  (key, suffix, instrument) => getChord(key, suffix, instrument),
);

export const selectSelectedPositions = createSelector(
  [selectSelectedKey, selectSelectedSuffix, selectInstrument],
  (key, suffix, instrument) => getChordPositions(key, suffix, instrument),
);

export const selectCurrentPositionIndex = createSelector(
  [selectChordsState, selectSelectedPositions],
  (chords, positions) =>
    positions.length > 0 ? Math.min(chords.currentPositionIndex, positions.length - 1) : 0,
);

export const selectCurrentPosition = createSelector(
  [selectSelectedPositions, selectCurrentPositionIndex],
  (positions, index) => positions[index],
);

export const selectScaleRoot = (state: RootState) => state.scales.selectedRoot;
export const selectScaleName = (state: RootState) => state.scales.selectedScale;

export const selectScaleNotes = createSelector(
  [selectScaleRoot, selectScaleName],
  (root, scale) => buildScale(root, scale),
);

export const selectHarmonizedChords = createSelector(
  [selectScaleRoot, selectScaleName],
  (root, scale) => harmonizeScale(root, scale),
);