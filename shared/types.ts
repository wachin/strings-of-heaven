/**
 * Shared data model types — used by app, web, and api layers.
 */

export type Instrument = 'guitar' | 'piano' | 'ukulele';

export type Theme = 'dark' | 'light';

export interface ChordPosition {
  /**
   * Fret per string for guitar/ukulele (-1 muted, 0 open); note names
   * (e.g. ["C", "E", "G"]) for piano — see ROADMAP section 8, note 6.
   */
  frets: number[] | string[];
  /** Finger per string (guitar/ukulele) or scale degree per key (piano). */
  fingers: number[] | string[];
  /** Lowest displayed fret (guitar/ukulele). */
  baseFret?: number;
  /** Frets spanned by a barre. */
  barres?: number[];
  /** Sounding MIDI notes. */
  midi?: number[];
  /** Whether the position requires a capo. */
  capo?: boolean;
}

export interface ProcessedChord {
  key: string;
  suffix: string;
  displayName: string;
  positions: ChordPosition[];
}

/** Processed chord data per instrument, indexed by root note. */
export interface ChordDatabase {
  [key: string]: ProcessedChord[];
}

/**
 * Song model types (SongEntry, SongType, Difficulty, …) — re-exported here so
 * consumers can use a single import path:
 *
 *   import { SongEntry } from '@shared/types';
 *
 * Note: the alias `@shared/types` resolves to this file, not to the `types/`
 * directory, so this re-export is what makes the song types reachable from it.
 */
export * from './types/song';
