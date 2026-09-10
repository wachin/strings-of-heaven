import '@testing-library/jest-dom/vitest';
import type { ChordDatabase } from '@shared/types';
import { setChordDatabases } from '@shared/engine/chord_engine';
import guitarChords from '@shared/data/guitar_chords.json';
import pianoChords from '@shared/data/piano_chords.json';
import ukuleleChords from '@shared/data/ukulele_chords.json';

setChordDatabases({
  guitar: guitarChords as unknown as ChordDatabase,
  piano: pianoChords as unknown as ChordDatabase,
  ukulele: ukuleleChords as unknown as ChordDatabase,
});
