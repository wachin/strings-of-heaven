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
  SUFFIX_EQUIVALENTS,
} from '../constants/theory';

export { ALL_KEYS };

// Datasets are loaded lazily (see loadChordDatabases) so bundlers can code-split
// each instrument's JSON. Unit tests and native apps seed them via
// setChordDatabases. This keeps the web initial bundle free of chord data.
const databases: Record<Instrument, ChordDatabase> = {
  guitar: {},
  piano: {},
  ukulele: {},
};

function databaseFor(instrument: Instrument): ChordDatabase {
  return databases[instrument];
}

/** Register one or more loaded datasets (used by tests, native, and loaders). */
export function setChordDatabases(partial: Partial<Record<Instrument, ChordDatabase>>): void {
  (Object.keys(partial) as Instrument[]).forEach((instrument) => {
    const db = partial[instrument];
    if (db) databases[instrument] = db;
  });
}

const loaders: Record<Instrument, () => Promise<ChordDatabase>> = {
  guitar: () => import('../data/guitar_chords.json').then((m) => m.default as ChordDatabase),
  piano: () => import('../data/piano_chords.json').then((m) => m.default as ChordDatabase),
  ukulele: () => import('../data/ukulele_chords.json').then((m) => m.default as ChordDatabase),
};

const loadedInstruments = new Set<Instrument>();

/**
 * Lazily load (and cache) an instrument's chord dataset. In the web build this
 * produces a separate chunk per instrument, fetched only when first needed.
 */
export async function loadChordDatabases(instrument: Instrument): Promise<ChordDatabase> {
  if (!loadedInstruments.has(instrument)) {
    const db = await loaders[instrument]();
    setChordDatabases({ [instrument]: db });
    loadedInstruments.add(instrument);
  }
  return databases[instrument];
}

// Defensive normalization of alternate key spellings (e.g. "Csharp" -> "C#").
export function normalizeKey(note: string): string {
  const trimmed = note.trim();
  const map: Record<string, string> = {
    Csharp: 'C#', 'C#': 'C#',
    Fsharp: 'F#', 'F#': 'F#',
  };
  return map[trimmed] ?? trimmed;
}

// Enharmonic pairs. Some datasets spell a key with flats (e.g. ukulele uses
// "Db"/"Gb" instead of "C#"/"F#"); resolving to the available spelling lets a
// selected "C#" still return chords for "Db".
const ENHARMONIC: Record<string, string> = {
  'C#': 'Db', Db: 'C#',
  'D#': 'Eb', Eb: 'D#',
  'F#': 'Gb', Gb: 'F#',
  'G#': 'Ab', Ab: 'G#',
  'A#': 'Bb', Bb: 'A#',
};

/**
 * Resolve a root note to a key that actually exists in the instrument's
 * database, falling back to its enharmonic spelling when needed.
 */
export function resolveKey(note: string, instrument: Instrument): string {
  const key = normalizeKey(note);
  const db = databaseFor(instrument);
  if (db[key]) return key;
  const alt = ENHARMONIC[key];
  if (alt && db[alt]) return alt;
  return key;
}

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

/** All chords available for a root note on the given instrument. */
export function getChordsForKey(note: string, instrument: Instrument = 'guitar'): ProcessedChord[] {
  return databaseFor(instrument)[resolveKey(note, instrument)] ?? [];
}

/** Diagram positions for a specific chord; empty array if not found. */
export function getChordPositions(
  note: string,
  suffix: string,
  instrument: Instrument = 'guitar',
): ChordPosition[] {
  const chord = databaseFor(instrument)[resolveKey(note, instrument)]?.find((c) => c.suffix === suffix);
  return chord ? chord.positions : [];
}

/** Full chord record (key, suffix, displayName, positions) or undefined. */
export function getChord(
  note: string,
  suffix: string,
  instrument: Instrument = 'guitar',
): ProcessedChord | undefined {
  return databaseFor(instrument)[resolveKey(note, instrument)]?.find((c) => c.suffix === suffix);
}

/** All distinct suffixes available for a root note on the given instrument. */
export function getSuffixes(note: string, instrument: Instrument = 'guitar'): string[] {
  return getChordsForKey(note, instrument).map((c) => c.suffix);
}

/** True if the chord exists in the instrument's database. */
export function chordExists(note: string, suffix: string, instrument: Instrument = 'guitar'): boolean {
  return getChordPositions(note, suffix, instrument).length > 0;
}

/**
 * Find a suffix that exists for the given key/instrument, equivalent to the
 * requested one when possible (e.g. "minor" ↔ "m"), falling back to "major".
 */
export function findEquivalentSuffix(
  suffix: string,
  note: string,
  instrument: Instrument = 'guitar',
): string {
  const suffixes = new Set(getSuffixes(note, instrument));
  if (suffixes.has(suffix)) return suffix;
  const alternative = SUFFIX_EQUIVALENTS[suffix];
  if (alternative && suffixes.has(alternative)) return alternative;
  if (suffixes.has('major')) return 'major';
  return [...suffixes][0] ?? 'major';
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
