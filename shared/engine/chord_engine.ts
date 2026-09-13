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
import {
  parseSongBody,
} from './music_theory';

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

/**
 * The page spelling for any accepted note name: "Db" → "C#", "D#" → "Eb",
 * "G#" → "Ab". Returns `undefined` when the text is not a note at all.
 *
 * `ALL_KEYS` is what the note buttons and the chord search use, so mapping any
 * enharmonic spelling onto it lets a user type `D#m` and still find `Eb minor`.
 */
export function canonicalRoot(note: string): string | undefined {
  const trimmed = note.trim();
  // Accept lowercase input from the search box: "ebm" → "Eb".
  const key = normalizeKey(trimmed.charAt(0).toUpperCase() + trimmed.slice(1));
  const keys: readonly string[] = ALL_KEYS;
  if (keys.includes(key)) return key;
  const alt = ENHARMONIC[key];
  return alt && keys.includes(alt) ? alt : undefined;
}

/**
 * Every spelling of a note's pitch class, itself first: "Eb" → ["Eb", "D#"].
 * Used so a chord is findable however the musician spells its root.
 */
export function rootSpellings(note: string): string[] {
  const key = normalizeKey(note);
  const alt = ENHARMONIC[key];
  return alt ? [key, alt] : [key];
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

/**
 * Build a display name from root + suffix.
 *
 * Known types get their full name — "C Major", "C Diminished 7th". Everything
 * else falls back to the chord-site spelling: "C7/G", "Csus2sus4", "Cmmaj11",
 * "Calt", "C69". The fallback used to be `note + " " + suffix`, which produced
 * the unreadable "C 7/G", "C sus2sus4" and "C mmaj11" on the cards.
 */
export function chordDisplayName(note: string, suffix: string): string {
  const info = CHORD_TYPE_INFO[SUFFIX_TO_CANONICAL[suffix] ?? ''];
  return info ? `${note} ${info.name}` : chordShorthand(note, suffix);
}

/**
 * Short symbol for a chords-db suffix, as written on chord sites:
 * "major" → "", "minor" → "m", "dim7" → "dim7".
 *
 * Returns `undefined` for suffixes with no canonical type (e.g. "sus",
 * "sus2sus4", "7sus4", "alt", "69", "7/G"), because for those the suffix itself
 * already is the chord-site spelling.
 */
export function suffixSymbol(suffix: string): string | undefined {
  const info = CHORD_TYPE_INFO[SUFFIX_TO_CANONICAL[suffix] ?? ''];
  return info?.symbol;
}

/**
 * The name musicians actually type: `C`, `Cm`, `Cdim7`, `C7/G`, `Csus2sus4`.
 *
 * This is the spelling chord websites use, and it is what the Explore search
 * accepts in addition to the long display name ("C Diminished 7th").
 *
 * Some databases spell alterations out — the piano set has `7sharp9` and
 * `maj7sharp5` — so `sharp` is folded back to `#`, giving `C7#9` and `Cmaj7#5`.
 */
export function chordShorthand(note: string, suffix: string): string {
  const symbol = suffixSymbol(suffix);
  return `${note}${(symbol ?? suffix).replace(/sharp/g, '#')}`;
}

/** Suffix used by chords-db for a canonical engine type. */
export function suffixForCanonicalType(canonicalType: string): string | undefined {
  return CANONICAL_TO_SUFFIX[canonicalType];
}

// ---------------------------------------------------------------------------
// Song-body chord extraction
// Uses the parser from music_theory.ts (ported from chord_autoscroll.py GPL 3)
// ---------------------------------------------------------------------------

export {
  isChordLine,
  parseSongBody,
  parseSongFile,
  transposeSongBody,
  transposeChordName,
  transposeChordLine,
  CHORD_TOKEN_REGEX,
  type ParsedSongLine,
  type SongLineToken,
  type SongLineType,
  type SongFileSections,
} from './music_theory';

/**
 * Extract every unique chord name that appears in a song body.
 *
 * The returned array preserves first-appearance order and contains the chords
 * exactly as written in the source (e.g. "Em", "G", "D", "A").  Use this list
 * to populate the Chords panel (Guitar / Ukulele / Piano widget) for a song.
 *
 * @param body  Raw text of the ~~~body section (lyrics + chord lines).
 *
 * Example:
 *   getUniqueChordsFromBody("D\n Hey dad\nA\n Think back\n      Em         G\nDid I grow")
 *   // → ["D", "A", "Em", "G"]
 */
export function getUniqueChordsFromBody(body: string): string[] {
  const lines = parseSongBody(body);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    if (line.type === 'chord') {
      for (const token of line.tokens) {
        if (!seen.has(token.chord)) {
          seen.add(token.chord);
          result.push(token.chord);
        }
      }
    }
  }
  return result;
}

/**
 * Same as `getUniqueChordsFromBody` but also resolves each chord name to a
 * `{ note, suffix }` pair that can be fed directly into `getChordPositions`.
 *
 * Slash-chord bass notes are ignored (only the upper chord is resolved).
 *
 * @param body       Raw body text.
 * @param instrument Target instrument — used to validate suffix availability.
 *
 * Example:
 *   resolveChordsFromBody("D\nHey dad\nEm  G", "guitar")
 *   // → [{ raw: "D",  note: "D",  suffix: "major" },
 *   //    { raw: "Em", note: "E",  suffix: "minor" },
 *   //    { raw: "G",  note: "G",  suffix: "major" }]
 */
export interface ResolvedChord {
  /** Chord token as written in the body, e.g. "Em", "G/B", "F#m7". */
  raw: string;
  /** Root note, e.g. "E", "G", "F#". */
  note: string;
  /** chords-db suffix, e.g. "minor", "major", "m7". */
  suffix: string;
}

/**
 * Maps common chord shorthand suffixes (as they appear in song files) to the
 * spelling used by chords-db.  Anything not listed falls back to
 * `findEquivalentSuffix`.
 */
const SHORTHAND_TO_SUFFIX: Record<string, string> = {
  '':      'major',
  'm':     'minor',
  'maj7':  'maj7',
  'm7':    'm7',
  '7':     '7',
  'dim':   'dim',
  'dim7':  'dim7',
  'aug':   'aug',
  'sus2':  'sus2',
  'sus4':  'sus4',
  'add9':  'add9',
  'm9':    'm9',
  'maj9':  'maj9',
  '9':     '9',
  '11':    '11',
  '13':    '13',
  '6':     '6',
  'm6':    'm6',
  '5':     '5',
  'm7b5':  'm7b5',
  'aug7':  'aug7',
};

export function resolveChordsFromBody(
  body: string,
  instrument: Instrument = 'guitar',
): ResolvedChord[] {
  const unique = getUniqueChordsFromBody(body);
  const results: ResolvedChord[] = [];

  for (const raw of unique) {
    // Strip slash bass: "G/B" → work with "G"
    const upper = raw.split('/')[0];

    // Split root (letter + optional accidental) from suffix
    const rootMatch = /^([A-G][#b]?)(.*)$/.exec(upper);
    if (!rootMatch) continue;

    const note = rootMatch[1];
    const rawSuffix = rootMatch[2] ?? '';

    const suffix =
      SHORTHAND_TO_SUFFIX[rawSuffix] ??
      findEquivalentSuffix(rawSuffix || 'major', note, instrument);

    results.push({ raw, note, suffix });
  }

  return results;
}
