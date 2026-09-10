/**
 * Music theory engine — notes, intervals, scales, chords, harmonization.
 *
 * Translated to TypeScript from third-party/musthe/musthe/musthe.py
 * (MIT, Gonzalo Ciruelos & Federico Ferri). Interval arithmetic, letter
 * math, and recipes are preserved; the API follows ROADMAP section 5 (T1.2).
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
