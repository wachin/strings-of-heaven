/**
 * Core music theory constants — single source of truth for the whole app.
 *
 * Interval semitone values and scale/chord recipes are translated from
 * third-party/musthe/musthe/musthe.py (MIT, Gonzalo Ciruelos & Federico Ferri).
 * Chord naming/aliases are cross-referenced with
 * third-party/music-theory-data/EqualTemperament/12-Tone/Chords.yaml.
 */

export type IntervalQuality = 'd' | 'P' | 'A' | 'm' | 'M';

export interface IntervalDef {
  /** Interval name, e.g. "P1", "M3", "m7". */
  name: string;
  quality: IntervalQuality;
  /** Diatonic number: 1 = unison, 8 = octave, 9..15 = compound. */
  number: number;
  /** Semitones from the root, including compound octaves. */
  semitones: number;
}

/** Semitone map for simple intervals (number 1–8). Mirrors musthe.Interval. */
const SIMPLE_INTERVAL_SEMITONES: Record<string, number> = {
  d1: -1, P1: 0, A1: 1,
  d2: 0, m2: 1, M2: 2, A2: 3,
  d3: 2, m3: 3, M3: 4, A3: 5,
  d4: 4, P4: 5, A4: 6,
  d5: 6, P5: 7, A5: 8,
  d6: 7, m6: 8, M6: 9, A6: 10,
  d7: 9, m7: 10, M7: 11, A7: 12,
  d8: 11, P8: 12, A8: 13,
};

export const QUALITY_INVERSE: Record<IntervalQuality, IntervalQuality> = {
  P: 'P', d: 'A', A: 'd', m: 'M', M: 'm',
};

function buildIntervals(): IntervalDef[] {
  const defs: IntervalDef[] = [];
  for (const [name, semitones] of Object.entries(SIMPLE_INTERVAL_SEMITONES)) {
    defs.push({
      name,
      quality: name[0] as IntervalQuality,
      number: Number(name.slice(1)),
      semitones,
    });
  }
  // Compound intervals (9–15): same quality, one octave added.
  for (const [name, semitones] of Object.entries(SIMPLE_INTERVAL_SEMITONES)) {
    const number = Number(name.slice(1));
    if (number >= 2 && number <= 7) {
      defs.push({
        name: `${name[0]}${number + 7}`,
        quality: name[0] as IntervalQuality,
        number: number + 7,
        semitones: semitones + 12,
      });
    }
  }
  return defs;
}

/** All intervals, simple + compound (d1..A8, d9..A15). */
export const INTERVALS: Record<string, IntervalDef> = Object.fromEntries(
  buildIntervals().map((i) => [i.name, i]),
);

/** Interval names in diatonic order, for iteration/lookup. */
export const INTERVAL_NAMES = Object.keys(INTERVALS);

/**
 * Scale recipes translated from musthe.Scale.scales.
 * Semitone-based so they work with enharmonic note spellings.
 */
export const SCALES: Record<string, string[]> = {
  major: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7'],
  natural_minor: ['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'm7'],
  harmonic_minor: ['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'M7'],
  melodic_minor: ['P1', 'M2', 'm3', 'P4', 'P5', 'M6', 'M7'],
  major_pentatonic: ['P1', 'M2', 'M3', 'P5', 'M6'],
  minor_pentatonic: ['P1', 'm3', 'P4', 'P5', 'm7'],
  // Greek modes
  ionian: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7'],
  dorian: ['P1', 'M2', 'm3', 'P4', 'P5', 'M6', 'm7'],
  phrygian: ['P1', 'm2', 'm3', 'P4', 'P5', 'm6', 'm7'],
  lydian: ['P1', 'M2', 'M3', 'A4', 'P5', 'M6', 'M7'],
  mixolydian: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'm7'],
  aeolian: ['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'm7'],
  locrian: ['P1', 'm2', 'm3', 'P4', 'd5', 'm6', 'm7'],
};

/** Display names for scales (UI labels). */
export const SCALE_NAMES: Record<string, string> = {
  major: 'Major',
  natural_minor: 'Natural Minor',
  harmonic_minor: 'Harmonic Minor',
  melodic_minor: 'Melodic Minor',
  major_pentatonic: 'Major Pentatonic',
  minor_pentatonic: 'Minor Pentatonic',
  ionian: 'Ionian (Major)',
  dorian: 'Dorian',
  phrygian: 'Phrygian',
  lydian: 'Lydian',
  mixolydian: 'Mixolydian',
  aeolian: 'Aeolian (Natural Minor)',
  locrian: 'Locrian',
};

/** The 7 Greek modes indexed by scale degree. */
export const GREEK_MODES: Record<number, string> = {
  1: 'ionian',
  2: 'dorian',
  3: 'phrygian',
  4: 'lydian',
  5: 'mixolydian',
  6: 'aeolian',
  7: 'locrian',
};

/**
 * Chord recipes translated from musthe.Chord.recipes, keyed by the internal
 * canonical type used by the engine.
 */
export const CHORD_FORMULAS: Record<string, string[]> = {
  maj: ['P1', 'M3', 'P5'],
  min: ['P1', 'm3', 'P5'],
  aug: ['P1', 'M3', 'A5'],
  dim: ['P1', 'm3', 'd5'],
  dom7: ['P1', 'M3', 'P5', 'm7'],
  min7: ['P1', 'm3', 'P5', 'm7'],
  maj7: ['P1', 'M3', 'P5', 'M7'],
  aug7: ['P1', 'M3', 'A5', 'm7'],
  dim7: ['P1', 'm3', 'd5', 'd7'],
  m7dim5: ['P1', 'm3', 'd5', 'm7'],
  sus2: ['P1', 'M2', 'P5'],
  sus4: ['P1', 'P4', 'P5'],
  open5: ['P1', 'P5'],
  dom9: ['P1', 'M3', 'P5', 'm7', 'M9'],
  min9: ['P1', 'm3', 'P5', 'm7', 'M9'],
  maj9: ['P1', 'M3', 'P5', 'M7', 'M9'],
  aug9: ['P1', 'M3', 'A5', 'm7', 'M9'],
  dim9: ['P1', 'm3', 'd5', 'd7', 'M9'],
  maj6: ['P1', 'M3', 'P5', 'M6'],
  min6: ['P1', 'm3', 'P5', 'M6'],
  add9: ['P1', 'M3', 'P5', 'M9'],
  minadd9: ['P1', 'm3', 'P5', 'M9'],
  dom11: ['P1', 'M3', 'P5', 'm7', 'M9', 'P11'],
  min11: ['P1', 'm3', 'P5', 'm7', 'M9', 'P11'],
  maj11: ['P1', 'M3', 'P5', 'M7', 'M9', 'P11'],
  dom13: ['P1', 'M3', 'P5', 'm7', 'M9', 'M13'],
  min13: ['P1', 'm3', 'P5', 'm7', 'M9', 'M13'],
  maj13: ['P1', 'M3', 'P5', 'M7', 'M9', 'M13'],
};

/** Chord type aliases → canonical type (mirrors musthe.Chord.aliases). */
export const CHORD_ALIASES: Record<string, string> = {
  M: 'maj',
  m: 'min',
  '+': 'aug',
  '°': 'dim',
  '7': 'dom7',
  m7: 'min7',
  M7: 'maj7',
  '+7': 'aug7',
  '7aug5': 'aug7',
  '7#5': 'aug7',
  '°7': 'dim7',
  'ø7': 'm7dim5',
  m7b5: 'm7dim5',
  '9': 'dom9',
  m9: 'min9',
  M9: 'maj9',
  '+9': 'aug9',
  '°9': 'dim9',
  '6': 'maj6',
  m6: 'min6',
  add9: 'add9',
  madd9: 'minadd9',
  '11': 'dom11',
  m11: 'min11',
  maj11: 'maj11',
  '13': 'dom13',
  m13: 'min13',
  maj13: 'maj13',
};

/** Canonical type → chords-db suffix. */
export const CANONICAL_TO_SUFFIX: Record<string, string> = {
  maj: 'major',
  min: 'minor',
  aug: 'aug',
  dim: 'dim',
  dom7: '7',
  min7: 'm7',
  maj7: 'maj7',
  aug7: 'aug7',
  dim7: 'dim7',
  m7dim5: 'm7b5',
  sus2: 'sus2',
  sus4: 'sus4',
  open5: '5',
  dom9: '9',
  min9: 'm9',
  maj9: 'maj9',
  aug9: 'aug9',
  dim9: 'dim9',
  maj6: '6',
  min6: 'm6',
  add9: 'add9',
  minadd9: 'madd9',
  dom11: '11',
  min11: 'm11',
  maj11: 'maj11',
  dom13: '13',
  min13: 'm13',
  maj13: 'maj13',
};

/** chords-db suffix → canonical type (reverse map, first match wins). */
export const SUFFIX_TO_CANONICAL: Record<string, string> = Object.fromEntries(
  Object.entries(CANONICAL_TO_SUFFIX).map(([type, suffix]) => [suffix, type]),
);

/**
 * Equivalent suffixes across instruments. Guitar/ukulele use different
 * spellings than piano for the same chord (e.g. "minor" vs "m", "7#9" vs
 * "7sharp9"). Used when switching instruments to keep the selected chord.
 */
export const SUFFIX_EQUIVALENTS: Record<string, string> = {
  minor: 'm',
  m: 'minor',
  '7#9': '7sharp9',
  '7sharp9': '7#9',
  'maj7#5': 'maj7sharp5',
  'maj7sharp5': 'maj7#5',
  '9#11': '9sharp11',
  '9sharp11': '9#11',
};

/** UI display info per canonical type. */
export interface ChordTypeInfo {
  /** Short symbol appended to the root, e.g. "Cm7". */
  symbol: string;
  /** Full display name, e.g. "C Minor Seventh". */
  name: string;
}

export const CHORD_TYPE_INFO: Record<string, ChordTypeInfo> = {
  maj: { symbol: '', name: 'Major' },
  min: { symbol: 'm', name: 'Minor' },
  aug: { symbol: 'aug', name: 'Augmented' },
  dim: { symbol: 'dim', name: 'Diminished' },
  dom7: { symbol: '7', name: 'Dominant 7th' },
  min7: { symbol: 'm7', name: 'Minor 7th' },
  maj7: { symbol: 'maj7', name: 'Major 7th' },
  aug7: { symbol: 'aug7', name: 'Augmented 7th' },
  dim7: { symbol: 'dim7', name: 'Diminished 7th' },
  m7dim5: { symbol: 'm7b5', name: 'Half-Diminished' },
  sus2: { symbol: 'sus2', name: 'Suspended 2nd' },
  sus4: { symbol: 'sus4', name: 'Suspended 4th' },
  open5: { symbol: '5', name: 'Power Chord' },
  dom9: { symbol: '9', name: 'Dominant 9th' },
  min9: { symbol: 'm9', name: 'Minor 9th' },
  maj9: { symbol: 'maj9', name: 'Major 9th' },
  aug9: { symbol: 'aug9', name: 'Augmented 9th' },
  dim9: { symbol: 'dim9', name: 'Diminished 9th' },
  maj6: { symbol: '6', name: 'Major 6th' },
  min6: { symbol: 'm6', name: 'Minor 6th' },
  add9: { symbol: 'add9', name: 'Add 9' },
  minadd9: { symbol: 'madd9', name: 'Minor Add 9' },
  dom11: { symbol: '11', name: 'Dominant 11th' },
  min11: { symbol: 'm11', name: 'Minor 11th' },
  maj11: { symbol: 'maj11', name: 'Major 11th' },
  dom13: { symbol: '13', name: 'Dominant 13th' },
  min13: { symbol: 'm13', name: 'Minor 13th' },
  maj13: { symbol: 'maj13', name: 'Major 13th' },
};

/** All 12 root notes in chords-db order. */
export const ALL_KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
export type KeyName = (typeof ALL_KEYS)[number];

/** Diatonic letters with their natural semitone (mirrors musthe.Letter). */
export const LETTER_SEMITONES: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

export const LETTERS = 'CDEFGAB';
