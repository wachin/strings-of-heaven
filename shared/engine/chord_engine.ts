/**
 * Chord engine — lookup and diagram positions from the processed JSON data.
 *
 * Implements ROADMAP task T1.3. All data comes from shared/data/
 * (generated from third-party/chords-db by scripts/process_chords.js).
 * No external API is used (ROADMAP section 8, note 4).
 */

import type { Instrument, ChordDatabase, ProcessedChord, ChordPosition } from '../types';
import { ALL_KEYS } from '../constants/theory';
import {
  SUFFIX_TO_CANONICAL,
  CHORD_TYPE_INFO,
  CANONICAL_TO_SUFFIX,
} from '../constants/theory';

export { ALL_KEYS };

import guitarChords from '../data/guitar_chords.json';
import pianoChords from '../data/piano_chords.json';
import ukuleleChords from '../data/ukulele_chords.json';

const DATABASES: Record<Instrument, ChordDatabase> = {
  guitar: guitarChords as unknown as ChordDatabase,
  piano: pianoChords as unknown as ChordDatabase,
  ukulele: ukuleleChords as unknown as ChordDatabase,
};

function databaseFor(instrument: Instrument): ChordDatabase {
  return DATABASES[instrument];
}

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

/** All chords available for a root note on the given instrument. */
export function getChordsForKey(note: string, instrument: Instrument = 'guitar'): ProcessedChord[] {
  return databaseFor(instrument)[note] ?? [];
}

/** Diagram positions for a specific chord; empty array if not found. */
export function getChordPositions(
  note: string,
  suffix: string,
  instrument: Instrument = 'guitar',
): ChordPosition[] {
  const chord = databaseFor(instrument)[note]?.find((c) => c.suffix === suffix);
  return chord ? chord.positions : [];
}

/** Full chord record (key, suffix, displayName, positions) or undefined. */
export function getChord(
  note: string,
  suffix: string,
  instrument: Instrument = 'guitar',
): ProcessedChord | undefined {
  return databaseFor(instrument)[note]?.find((c) => c.suffix === suffix);
}

/** All distinct suffixes available for a root note on the given instrument. */
export function getSuffixes(note: string, instrument: Instrument = 'guitar'): string[] {
  return getChordsForKey(note, instrument).map((c) => c.suffix);
}

/** True if the chord exists in the instrument's database. */
export function chordExists(note: string, suffix: string, instrument: Instrument = 'guitar'): boolean {
  return getChordPositions(note, suffix, instrument).length > 0;
}

// ---------------------------------------------------------------------------
// Fallback: hex fret strings from guitar-chords-db-json (T1.3)
// ---------------------------------------------------------------------------

const HEX_DIGITS = '0123456789abc';

/**
 * Convert a hex fret string (e.g. "x02220" or "577655") to a fret array
 * where -1 = muted. Used only for rare guitar chords missing from chords-db.
 */
export function parseFretString(hexStr: string): number[] {
  return [...hexStr].map((c) => {
    if (c === 'x' || c === 'X') return -1;
    const value = HEX_DIGITS.indexOf(c.toLowerCase());
    if (value === -1) throw new Error(`Invalid fret character '${c}'`);
    return value;
  });
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/** Canonical type for a chords-db suffix, if known. */
export function canonicalTypeForSuffix(suffix: string): string | undefined {
  return SUFFIX_TO_CANONICAL[suffix];
}

/** Build a display name like "C Major" from root + suffix. */
export function chordDisplayName(note: string, suffix: string): string {
  const info = CHORD_TYPE_INFO[SUFFIX_TO_CANONICAL[suffix] ?? ''];
  const label = info ? info.name : suffix;
  return `${note} ${label}`;
}

/** Suffix used by chords-db for a canonical engine type. */
export function suffixForCanonicalType(canonicalType: string): string | undefined {
  return CANONICAL_TO_SUFFIX[canonicalType];
}
