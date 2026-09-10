import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { Instrument } from '../types';
import { setInstrument } from './uiSlice';
import { setKey, setSuffix, setPositionIndex } from './chordsSlice';
import { selectInstrument, selectSelectedKey, selectSelectedSuffix, selectSelectedPositions } from './selectors';
import { findEquivalentSuffix, normalizeKey } from '../engine/chord_engine';

type AppThunk = ThunkAction<void, RootState, undefined, UnknownAction>;

/** Select a root key, keeping the current suffix (or an equivalent). */
export const selectChordKey = (key: string): AppThunk => (dispatch, getState) => {
  const state = getState();
  const instrument = selectInstrument(state);
  const suffix = state.chords.selectedSuffix;
  dispatch(setKey(normalizeKey(key)));
  const equivalent = findEquivalentSuffix(suffix, key, instrument);
  if (equivalent !== suffix) dispatch(setSuffix(equivalent));
};

/** Select a chord suffix for the current key/instrument. */
export const selectSuffix = (suffix: string): AppThunk => (dispatch) => {
  dispatch(setSuffix(suffix));
};

/** Switch instrument, remapping the selected suffix to the new instrument. */
export const switchInstrument = (instrument: Instrument): AppThunk => (dispatch, getState) => {
  const state = getState();
  const key = selectSelectedKey(state);
  const suffix = selectSelectedSuffix(state);
  dispatch(setInstrument(instrument));
  const equivalent = findEquivalentSuffix(suffix, key, instrument);
  if (equivalent !== suffix) dispatch(setSuffix(equivalent));
  dispatch(setPositionIndex(0));
};

/** Open a specific chord directly (e.g. from a URL), mapping suffix as needed. */
export const openChord = (key: string, suffix: string): AppThunk => (dispatch, getState) => {
  const state = getState();
  const instrument = selectInstrument(state);
  dispatch(setKey(normalizeKey(key)));
  dispatch(setSuffix(findEquivalentSuffix(suffix, key, instrument)));
};

/** Advance to the next voicing, wrapping around. */
export const nextPosition = (): AppThunk => (dispatch, getState) => {
  const positions = selectSelectedPositions(getState());
  if (positions.length === 0) return;
  const current = getState().chords.currentPositionIndex;
  dispatch(setPositionIndex((current + 1) % positions.length));
};

/** Go to the previous voicing, wrapping around. */
export const prevPosition = (): AppThunk => (dispatch, getState) => {
  const positions = selectSelectedPositions(getState());
  if (positions.length === 0) return;
  const current = getState().chords.currentPositionIndex;
  dispatch(setPositionIndex((current - 1 + positions.length) % positions.length));
};