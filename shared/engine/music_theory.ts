/**
 * Music theory engine — notes, intervals, scales, chords, harmonization,
 * song-body transposition.
 *
 * Translated to TypeScript from third-party/musthe/musthe/musthe.py
 * (MIT, Gonzalo Ciruelos & Federico Ferri). Interval arithmetic, letter
 * math, and recipes are preserved; the API follows ROADMAP section 5 (T1.2).
 *
 * Chord-line detection and transposition logic is ported from
 * third-party/chord-autoscroll/chord_autoscroll.py
 * (GPL 3, Washington Indacochea Delgado).
 */

import {
  INTERVALS,
  QUALITY_INVERSE,
  SCALES,
  CHORD_FORMULAS,
  CHORD_ALIASES,
  CHORD_TYPE_INFO,
  LETTER_SEMITONES,
  LETTERS,
  type IntervalDef,
} from '../constants/theory';

// ---------------------------------------------------------------------------
// Note
// ---------------------------------------------------------------------------

const NOTE_PATTERN = /^([A-G])(b{0,3}|#{0,3})(\d)?$/;

export class Note {
  readonly letter: string;
  readonly accidental: string;
  readonly octave: number;
  /** Absolute chromatic position: letter semitone + octave * 12 + accidentals. */
  readonly number: number;

  constructor(note: string) {
    const match = NOTE_PATTERN.exec(note);
    if (!match) {
      throw new Error(`Could not parse the note '${note}'`);
    }
    this.letter = match[1];
    this.accidental = match[2];
    this.octave = match[3] !== undefined ? Number(match[3]) : 4;

    let accidentalValue = 0;
    for (const c of this.accidental) {
      accidentalValue += c === '#' ? 1 : -1;
    }
    this.number = LETTER_SEMITONES[this.letter] + this.octave * 12 + accidentalValue;
  }

  /** MIDI note number (C4 = 60). */
  get midi(): number {
    return this.number + 12;
  }

  /** Frequency in Hz (equal temperament, A4 = 440). */
  get frequency(): number {
    return 440.0 * Math.pow(2, (this.number - new Note('A4').number) / 12);
  }

  private get letterIndex(): number {
    return LETTERS.indexOf(this.letter);
  }

  /** Note name without octave, e.g. "Eb". */
  toString(): string {
    return this.letter + this.accidental;
  }

  /** Note name with octave, e.g. "Eb4". */
  get scientificNotation(): string {
    return this.toString() + String(this.octave);
  }

  equals(other: Note): boolean {
    return this.scientificNotation === other.scientificNotation;
  }

  /** Same pitch class in another octave. */
  withOctave(octave: number): Note {
    return new Note(this.letter + this.accidental + String(octave));
  }

  /** Transpose up by an interval name, e.g. "M3", "P8", "M9". */
  transpose(intervalName: string): Note {
    const interval = getInterval(intervalName);
    // Split compound intervals into octaves + simple interval (musthe.split).
    let semitones = interval.semitones;
    let diatonic = interval.number;
    let octaves = 0;
    while (diatonic > 8) {
      diatonic -= 7;
      semitones -= 12;
      octaves += 1;
    }
    // Letter arithmetic: adding a diatonic n moves (n - 1) letter steps.
    const steps = this.letterIndex + diatonic - 1;
    const newLetter = LETTERS[steps % 7];
    // Octave bump when the letter wraps past B, plus stripped compound octaves.
    const wrapped = steps >= 7 ? 1 : 0;
    const newOctave = this.octave + wrapped + octaves;
    // Accidental: actual semitones traveled vs. natural target letter.
    const target = this.number + semitones + 12 * octaves;
    const targetPc = ((target % 12) + 12) % 12;
    let difference = targetPc - LETTER_SEMITONES[newLetter];
    if (difference < -3) difference += 12;
    if (difference > 3) difference -= 12;
    const accidental = difference === 0 ? '' : difference > 0 ? '#'.repeat(difference) : 'b'.repeat(-difference);
    return new Note(newLetter + accidental + String(newOctave));
  }

  /** Transpose down by an interval (musthe: to_octave(-1) + complement). */
  transposeDown(intervalName: string): Note {
    const interval = getInterval(intervalName);
    let number = interval.number;
    let octaves = 0;
    while (number > 8) {
      number -= 7;
      octaves += 1;
    }
    const complement = `${QUALITY_INVERSE[interval.quality]}${9 - number}`;
    return this.withOctave(this.octave - 1 - octaves).transpose(complement);
  }
}

// ---------------------------------------------------------------------------
// Intervals
// ---------------------------------------------------------------------------

export function getInterval(name: string): IntervalDef {
  const def = INTERVALS[name];
  if (!def) throw new Error(`Invalid interval '${name}'`);
  return def;
}

/** Pitch class (0–11) of any note name, e.g. "C#" → 1, "Eb" → 3. */
export function pitchClassOf(noteName: string): number {
  return ((new Note(noteName).number % 12) + 12) % 12;
}

/** Complement (inversion) of a simple interval, e.g. "M3" -> "m6". */
export function intervalComplement(name: string): string {
  const interval = getInterval(name);
  if (interval.number > 8) throw new Error('Cannot invert a compound interval');
  return `${QUALITY_INVERSE[interval.quality]}${9 - interval.number}`;
}

// ---------------------------------------------------------------------------
// Scales
// ---------------------------------------------------------------------------

/** Names of every supported scale. */
export const SCALE_NAMES_AVAILABLE: string[] = Object.keys(SCALES);

/** Notes of a scale from its root, as octave-agnostic names. */
export function buildScale(root: string, scaleName: string): string[] {
  if (!(scaleName in SCALES)) {
    throw new Error(`No such scale: ${scaleName}`);
  }
  const rootNote = new Note(root);
  return SCALES[scaleName].map((interval) => rootNote.transpose(interval).toString());
}

// ---------------------------------------------------------------------------
// Chords
// ---------------------------------------------------------------------------

/** Resolve a chord type or alias (e.g. "m7", "M") to the canonical type. */
export function canonicalChordType(chordType: string): string {
  return CHORD_ALIASES[chordType] ?? chordType;
}

/** Notes of a chord from its root, e.g. buildChordNotes("C", "maj"). */
export function buildChordNotes(root: string, chordType: string): string[] {
  const canonical = canonicalChordType(chordType);
  const formula = CHORD_FORMULAS[canonical];
  if (!formula) {
    throw new Error(`Invalid chord type: ${chordType}`);
  }
  const rootNote = new Note(root);
  return formula.map((interval) => rootNote.transpose(interval).toString());
}

// ---------------------------------------------------------------------------
// Harmonization (mirrors musthe.Scale.harmonize)
// ---------------------------------------------------------------------------

export interface HarmonizedChord {
  /** Scale degree, 1-based. */
  degree: number;
  /** Chord root note name. */
  root: string;
  /** Canonical chord type, e.g. "maj", "min7". */
  chordType: string;
  /** Chord note names. */
  notes: string[];
  /** Display name, e.g. "C Major". */
  displayName: string;
}

/**
 * Chord types considered during harmonization, in match-priority order:
 * triads first, then seventh chords.
 */
const HARMONIZE_TYPES = ['maj', 'min', 'dim', 'aug', 'min7', 'dom7', 'maj7', 'm7dim5', 'dim7'];

/**
 * Harmonize a scale: for each degree, every chord type whose notes all lie in
 * the scale (plus each degree's minor 7th when includeDom7, as musthe does).
 * Returns one array per degree; an empty array means no diatonic chord exists
 * (common in pentatonic scales).
 */
export function harmonizeScale(
  root: string,
  scaleName: string,
  includeDom7 = true,
): HarmonizedChord[][] {
  const scaleNotes = buildScale(root, scaleName);
  const result: HarmonizedChord[][] = [];

  for (let i = 0; i < scaleNotes.length; i++) {
    const degreeNote = new Note(scaleNotes[i]);
    const searchNotes = new Set(scaleNotes);
    if (includeDom7) {
      searchNotes.add(degreeNote.transpose('m7').toString());
    }
    const matches: HarmonizedChord[] = [];
    for (const chordType of HARMONIZE_TYPES) {
      const notes = CHORD_FORMULAS[chordType].map((interval) => degreeNote.transpose(interval).toString());
      if (notes.every((n) => searchNotes.has(n))) {
        matches.push({
          degree: i + 1,
          root: scaleNotes[i],
          chordType,
          notes,
          displayName: `${scaleNotes[i]} ${CHORD_TYPE_INFO[chordType].name}`,
        });
      }
    }
    result.push(matches);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Chord-name transposition
// Ported from third-party/chord-autoscroll/chord_autoscroll.py (GPL 3)
// Original author: Washington Indacochea Delgado
// ---------------------------------------------------------------------------

/**
 * Chromatic scale as groups of enharmonic equivalents, in semitone order.
 * Mirrors `chord_base` in chord_autoscroll.py.
 * Index 0 = C, 1 = C#/Db, …, 11 = B.
 */
const CHROMATIC: readonly (readonly string[])[] = [
  ['C'],
  ['C#', 'Db'],
  ['D'],
  ['D#', 'Eb'],
  ['E'],
  ['F'],
  ['F#', 'Gb'],
  ['G'],
  ['G#', 'Ab'],
  ['A'],
  ['A#', 'Bb'],
  ['B'],
] as const;

/** Pre-built flat lookup: note name → chromatic index (0-11). */
const CHROMATIC_INDEX: Readonly<Record<string, number>> = (() => {
  const map: Record<string, number> = {};
  CHROMATIC.forEach((group, i) => group.forEach((n) => { map[n] = i; }));
  return map;
})();

/**
 * Transpose a single chord name by `semitones` steps.
 * The root is moved along the chromatic scale; the suffix is preserved.
 *
 * `useSharps` controls which spelling is chosen when the target slot has two
 * enharmonic options (e.g. C#/Db).  Default: sharps.
 *
 * Examples:
 *   transposeChordName('D',   2)         → 'E'
 *   transposeChordName('Em',  1)         → 'Fm'
 *   transposeChordName('F#m7', -1, false) → 'Fm7'  (uses flats → Fm7)
 *   transposeChordName('Bb',  1)         → 'B'
 *   transposeChordName('G/B', 2)         → 'A/C#'  (slash chords)
 *
 * Ported from `transpose_chord()` in chord_autoscroll.py.
 */
export function transposeChordName(
  chord: string,
  semitones: number,
  useSharps = true,
): string {
  if (semitones === 0) return chord;

  // Handle slash chords: "G/B" → transpose both parts independently.
  const slashIdx = chord.indexOf('/');
  if (slashIdx !== -1) {
    const upper = transposeChordName(chord.slice(0, slashIdx), semitones, useSharps);
    const lower = transposeChordName(chord.slice(slashIdx + 1), semitones, useSharps);
    return `${upper}/${lower}`;
  }

  // Split root (letter + optional accidental) from the rest (suffix).
  // Root is: one letter [A-G] optionally followed by '#' or 'b'.
  const rootMatch = /^([A-G][#b]?)(.*)$/.exec(chord);
  if (!rootMatch) return chord; // not a recognizable chord, return as-is

  const root = rootMatch[1];
  const suffix = rootMatch[2];

  const currentIndex = CHROMATIC_INDEX[root];
  if (currentIndex === undefined) return chord; // unknown accidental combination

  const newIndex = ((currentIndex + semitones) % 12 + 12) % 12;
  const group = CHROMATIC[newIndex];

  // Pick sharp or flat spelling.  If the group has only one name, use it.
  const newRoot = group.length === 1
    ? group[0]
    : useSharps ? group[0] : group[1];

  return newRoot + suffix;
}

// ---------------------------------------------------------------------------
// Song body parser and line-level transposition
// Ported from third-party/chord-autoscroll/chord_autoscroll.py (GPL 3)
// Original author: Washington Indacochea Delgado
// ---------------------------------------------------------------------------

/**
 * Regex that matches a single chord token.
 * Mirrors the pattern in `chord_autoscroll.py`:
 *   r'\b[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]?(?!\w)'
 *
 * Extended here to also cover:
 *   - Multi-digit numbers (e.g. m7b5, maj13, sus2, sus4)
 *   - Slash chords (e.g. G/B, Am/E)
 *   - Compound suffixes (e.g. 7b5, 7#9, add9, m7b5)
 *
 * Exported so callers (chord_engine, tests) can reuse it.
 */
export const CHORD_TOKEN_REGEX =
  /\b([A-G][#b]?(?:maj|min|m|dim|aug|sus|add)?[0-9]?(?:b[0-9]|#[0-9])?(?:\/[A-G][#b]?)?)\b/g;

/**
 * Simpler single-match version (no global flag) used internally for
 * per-token validation.
 */
const CHORD_TOKEN_SINGLE = /^[A-G][#b]?(?:maj|min|m|dim|aug|sus|add)?[0-9]?(?:b[0-9]|#[0-9])?(?:\/[A-G][#b]?)?$/;

/**
 * Return true when a line consists *mostly* of chord tokens (> 50 % of
 * whitespace-separated words are valid chords).
 *
 * Mirrors `is_chord_line()` in chord_autoscroll.py.
 *
 * Examples that return true:
 *   "D  A  Em  G"
 *   "      Em          G"
 *   "D                    A"
 *
 * Examples that return false:
 *   "Hey dad look at me"
 *   "[Verse 1]"
 *   "Capo: 2nd fret"
 */
export function isChordLine(line: string): boolean {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  const chordCount = words.filter((w) => CHORD_TOKEN_SINGLE.test(w)).length;
  return chordCount > words.length / 2;
}

/**
 * Transpose all chord tokens in a single chord line, preserving the original
 * whitespace layout so the chords stay aligned with the lyrics below them.
 *
 * Mirrors `process_line()` in chord_autoscroll.py.
 */
export function transposeChordLine(
  line: string,
  semitones: number,
  useSharps = true,
): string {
  if (semitones === 0) return line;

  // Collect all chord match positions.
  const regex = new RegExp(CHORD_TOKEN_REGEX.source, 'g');
  const matches: RegExpExecArray[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line)) !== null) {
    if (CHORD_TOKEN_SINGLE.test(m[1])) matches.push(m);
  }
  if (matches.length === 0) return line;

  // Rebuild the line: keep text between matches, replace each chord token.
  // The spacing AFTER each chord is preserved so the layout stays intact even
  // when the transposed chord name has a different length.
  const parts: string[] = [];
  let lastEnd = 0;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    // Text before this chord (spaces, leading text, etc.)
    parts.push(line.slice(lastEnd, match.index));

    const transposed = transposeChordName(match[1], semitones, useSharps);

    // Calculate the space that followed the original chord up to the next
    // chord (or end of line), to preserve column alignment.
    const nextStart = i + 1 < matches.length ? matches[i + 1].index : line.length;
    const spacesAfter = nextStart - (match.index + match[1].length);

    parts.push(transposed);
    // Adjust trailing spaces: if the new chord is shorter/longer, compensate.
    const lengthDiff = transposed.length - match[1].length;
    const newSpaces = Math.max(1, spacesAfter - lengthDiff);
    // Only add compensating spaces when there IS a next chord on the line.
    if (i + 1 < matches.length) {
      parts.push(' '.repeat(newSpaces));
    }

    lastEnd = nextStart;
  }
  // Remaining text after the last chord.
  parts.push(line.slice(lastEnd));

  return parts.join('');
}

/**
 * Transpose all chord lines in a multi-line song body.
 * Lines that are not chord lines (lyrics, section headers, blank lines) are
 * passed through unchanged.
 *
 * Mirrors `transpose_text()` in chord_autoscroll.py.
 *
 * @param body      The raw song body text (may include [Section] headers, lyrics, chords).
 * @param semitones Semitones to shift (negative = down, positive = up).
 * @param useSharps When true, prefer sharps for accidentals (C#); when false, prefer flats (Db).
 */
export function transposeSongBody(
  body: string,
  semitones: number,
  useSharps = true,
): string {
  if (semitones === 0) return body;
  return body
    .split('\n')
    .map((line) => (isChordLine(line) ? transposeChordLine(line, semitones, useSharps) : line))
    .join('\n');
}

// ---------------------------------------------------------------------------
// Song body sections parser
// ---------------------------------------------------------------------------

/**
 * Represents one section of a song body after parsing:
 *   - `type: 'chord'`  → a line that contains chord tokens
 *   - `type: 'lyric'`  → a lyric or text line
 *   - `type: 'blank'`  → an empty line
 *   - `type: 'header'` → a section header like "[Verse 1]"
 *
 * Each chord line carries the parsed tokens with their column positions so
 * the renderer can place them precisely above the correct syllables.
 */
export interface SongLineToken {
  /** The chord name as it appears in the source (before any transposition). */
  chord: string;
  /** Column (character index) where this chord starts in the original line. */
  column: number;
}

export type SongLineType = 'chord' | 'lyric' | 'blank' | 'header';

export interface ParsedSongLine {
  type: SongLineType;
  /** Original text of the line (untransposed). */
  raw: string;
  /** Chord tokens with positions — only populated when type === 'chord'. */
  tokens: SongLineToken[];
}

/**
 * Parse a song body into a sequence of typed lines.
 *
 * This is the foundation for the `SongBody` renderer component: each
 * chord line becomes a row of positioned chord tokens, each lyric line is
 * plain text, and headers like "[Verse 1]" are tagged separately.
 *
 * @param body The raw text between the `~~~body` markers.
 */
export function parseSongBody(body: string): ParsedSongLine[] {
  return body.split('\n').map((raw): ParsedSongLine => {
    // Blank line
    if (raw.trim() === '') {
      return { type: 'blank', raw, tokens: [] };
    }

    // Section header: starts with '[' and ends with ']'
    if (/^\s*\[.+\]\s*$/.test(raw)) {
      return { type: 'header', raw, tokens: [] };
    }

    // Chord line
    if (isChordLine(raw)) {
      const tokens: SongLineToken[] = [];
      const regex = new RegExp(CHORD_TOKEN_REGEX.source, 'g');
      let m: RegExpExecArray | null;
      while ((m = regex.exec(raw)) !== null) {
        if (CHORD_TOKEN_SINGLE.test(m[1])) {
          tokens.push({ chord: m[1], column: m.index });
        }
      }
      return { type: 'chord', raw, tokens };
    }

    // Default: lyric line
    return { type: 'lyric', raw, tokens: [] };
  });
}

/**
 * Parse the three `~~~` sections of a song file into their constituent parts.
 *
 * Expected format:
 * ```
 * ~~~
 * Title by Artist
 * Author: rocker_kitty
 * Difficulty: Absolute Beginner
 * ~~~
 *
 * ~~~capo
 * Capo: 2nd fret
 * ~~~
 *
 * ~~~body
 * [Verse 1]
 * D
 *  Hey dad look at me
 * ...
 * ~~~
 * ```
 */
export interface SongFileSections {
  /** Raw text of the first ~~~ block (title/author/difficulty). */
  meta: string;
  /** Capo value extracted from the ~~~capo block, e.g. 2.  0 = no capo. */
  capo: number;
  /** Raw text of the ~~~body block (lyrics + chords). */
  body: string;
}

export function parseSongFile(source: string): SongFileSections {
  // Split on ~~~ delimiters (handles optional tags like ~~~capo, ~~~body).
  const blockRegex = /~~~\w*\n([\s\S]*?)~~~/g;
  const blocks: string[] = [];
  let bm: RegExpExecArray | null;
  while ((bm = blockRegex.exec(source)) !== null) {
    blocks.push(bm[1].trim());
  }

  const meta = blocks[0] ?? '';
  const capoBlock = blocks[1] ?? '';
  const body = blocks[2] ?? '';

  // Extract capo number, e.g. "Capo: 2nd fret" → 2
  const capoMatch = /Capo:\s*(\d+)/i.exec(capoBlock);
  const capo = capoMatch ? parseInt(capoMatch[1], 10) : 0;

  return { meta, capo, body };
}
