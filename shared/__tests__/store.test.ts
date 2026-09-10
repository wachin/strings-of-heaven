import type { ChordDatabase } from '../types';
import { createAppStore } from '../store';
import {
  selectChordKey,
  selectSuffix,
  switchInstrument,
  openChord,
  nextPosition,
  prevPosition,
} from '../store';
import {
  selectSelectedKey,
  selectSelectedSuffix,
  selectAllSuffixes,
  selectSelectedChord,
  selectSelectedPositions,
  selectCurrentPositionIndex,
  selectScaleNotes,
  selectHarmonizedChords,
  selectInstrument,
  selectTheme,
} from '../store';
import { toggleTheme, bumpDataEpoch } from '../store';
import { setRoot, setScale } from '../store';
import { setChordDatabases } from '../engine/chord_engine';
import guitarChords from '../data/guitar_chords.json';
import pianoChords from '../data/piano_chords.json';
import ukuleleChords from '../data/ukulele_chords.json';

setChordDatabases({
  guitar: guitarChords as unknown as ChordDatabase,
  piano: pianoChords as unknown as ChordDatabase,
  ukulele: ukuleleChords as unknown as ChordDatabase,
});

describe('chords slice', () => {
  it('has a sane initial state', () => {
    const store = createAppStore();
    expect(selectSelectedKey(store.getState())).toBe('C');
    expect(selectSelectedSuffix(store.getState())).toBe('major');
    expect(selectInstrument(store.getState())).toBe('guitar');
  });

  it('selects a key and computes suffixes for the instrument', () => {
    const store = createAppStore();
    store.dispatch(selectChordKey('A'));
    expect(selectSelectedKey(store.getState())).toBe('A');
    expect(selectSelectedSuffix(store.getState())).toBe('major');
    expect(selectAllSuffixes(store.getState())).toContain('major');
  });

  it('selects a chord and resolves positions', () => {
    const store = createAppStore();
    store.dispatch(selectChordKey('C'));
    store.dispatch(selectSuffix('major'));
    const chord = selectSelectedChord(store.getState());
    expect(chord?.displayName).toBe('C major');
    expect(selectSelectedPositions(store.getState()).length).toBeGreaterThanOrEqual(2);
  });

  it('cycles positions with wrap-around', () => {
    const store = createAppStore();
    const length = selectSelectedPositions(store.getState()).length;
    store.dispatch(prevPosition());
    expect(selectCurrentPositionIndex(store.getState())).toBe(length - 1);
    store.dispatch(nextPosition());
    expect(selectCurrentPositionIndex(store.getState())).toBe(0);
  });
});

describe('instrument switching', () => {
  it('maps "minor" to "m" when switching guitar -> piano', () => {
    const store = createAppStore();
    store.dispatch(selectSuffix('minor'));
    store.dispatch(switchInstrument('piano'));
    expect(selectInstrument(store.getState())).toBe('piano');
    expect(selectSelectedSuffix(store.getState())).toBe('m');
  });

  it('maps "m" back to "minor" when switching piano -> ukulele', () => {
    const store = createAppStore();
    store.dispatch(switchInstrument('piano'));
    store.dispatch(selectSuffix('m'));
    store.dispatch(switchInstrument('ukulele'));
    expect(selectSelectedSuffix(store.getState())).toBe('minor');
  });

  it('falls back to "major" for suffixes unavailable on the target instrument', () => {
    const store = createAppStore();
    store.dispatch(selectSuffix('alt'));
    store.dispatch(switchInstrument('piano'));
    expect(selectSelectedSuffix(store.getState())).toBe('major');
  });

  it('resets position index when switching instruments', () => {
    const store = createAppStore();
    store.dispatch(nextPosition());
    expect(selectCurrentPositionIndex(store.getState())).toBe(1);
    store.dispatch(switchInstrument('piano'));
    expect(selectCurrentPositionIndex(store.getState())).toBe(0);
  });
});

describe('openChord', () => {
  it('opens a chord directly and maps suffixes', () => {
    const store = createAppStore();
    store.dispatch(openChord('G', 'm7'));
    expect(selectSelectedKey(store.getState())).toBe('G');
    expect(selectSelectedSuffix(store.getState())).toBe('m7');
  });

  it('normalizes sharp key spellings', () => {
    const store = createAppStore();
    store.dispatch(openChord('Csharp', 'major'));
    expect(selectSelectedKey(store.getState())).toBe('C#');
  });
});

describe('scales slice', () => {
  it('builds scale notes from the selected root and scale', () => {
    const store = createAppStore();
    store.dispatch(setRoot('A'));
    store.dispatch(setScale('natural_minor'));
    expect(selectScaleNotes(store.getState())).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  });

  it('harmonizes to classic triads for C major', () => {
    const store = createAppStore();
    const harmonized = selectHarmonizedChords(store.getState());
    const triads = harmonized.map((m) => m[0]?.chordType);
    expect(triads).toEqual(['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim']);
  });
});

describe('ui slice', () => {
  it('toggles theme', () => {
    const store = createAppStore();
    expect(selectTheme(store.getState())).toBe('dark');
    store.dispatch(toggleTheme());
    expect(selectTheme(store.getState())).toBe('light');
  });
});

describe('lazy data + selector memoization (regression)', () => {
  it('recomputes chord selectors after data loads, even with unchanged key/instrument', () => {
    setChordDatabases({ guitar: {} });
    const store = createAppStore();
    store.dispatch(selectChordKey('C'));

    // Before data loads, the memoized selector caches an empty result.
    expect(selectAllSuffixes(store.getState())).toEqual([]);
    const cached = selectAllSuffixes(store.getState());
    expect(cached).toBe(selectAllSuffixes(store.getState()));

    // Data arrives and the epoch bumps (as App does on load).
    setChordDatabases({ guitar: guitarChords as unknown as ChordDatabase });
    store.dispatch(bumpDataEpoch());

    const after = selectAllSuffixes(store.getState());
    expect(after.length).toBeGreaterThan(0);
    expect(after).not.toBe(cached);
    expect(selectSelectedChord(store.getState())?.displayName).toBe('C major');
  });
});