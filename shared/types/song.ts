/**
 * SongEntry — the complete data model for a user-submitted song.
 *
 * All fields that can be entered through the Submit Song form live here.
 * This type is shared between the web app and the future React Native app.
 *
 * Storage modes:
 *   - Static / GitHub Pages build: songs are stored in the browser's
 *     localStorage (no server required).
 *   - Self-hosted fork with a backend: replace the localStorage layer
 *     with REST API calls to your own server. The type stays the same.
 */

// ── Difficulty levels ────────────────────────────────────────────────────────

export type Difficulty =
  | 'absolute_beginner'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  absolute_beginner: 'Absolute Beginner',
  beginner:          'Beginner',
  intermediate:      'Intermediate',
  advanced:          'Advanced',
  expert:            'Expert',
};

// ── Content type ─────────────────────────────────────────────────────────────

export type SongType =
  | 'chords'       // chord names + lyrics
  | 'tab'          // guitar tablature (ASCII)
  | 'bass_tab'     // bass tablature (ASCII)
  | 'ukulele'      // ukulele chords
  | 'guitar_pro';  // Guitar Pro file reference

export const SONG_TYPE_LABELS: Record<SongType, string> = {
  chords:     'Chords',
  tab:        'Guitar Tab',
  bass_tab:   'Bass Tab',
  ukulele:    'Ukulele Chords',
  guitar_pro: 'Guitar Pro',
};

// ── Time signature ────────────────────────────────────────────────────────────

export type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8' | '12/8' | 'other';

export const TIME_SIGNATURE_LABELS: Record<TimeSignature, string> = {
  '2/4':   '2/4 — March / Polka',
  '3/4':   '3/4 — Waltz',
  '4/4':   '4/4 — Common time',
  '6/8':   '6/8 — Compound duple',
  '12/8':  '12/8 — Compound quadruple',
  'other': 'Other',
};

// ── Main type ─────────────────────────────────────────────────────────────────

export interface SongEntry {
  // ── Identity ──────────────────────────────────────────────────────────────
  /** Unique identifier (uuid or timestamp string). Generated on save. */
  id: string;

  // ── Basic info (shown in listings and search) ─────────────────────────────
  /** Song title, e.g. "Como el ciervo". */
  title: string;

  /** Artist / author name, e.g. "Marcos Witt". */
  artist: string;

  /** Content type: chords, tab, bass tab, ukulele, or guitar pro. */
  type: SongType;

  // ── Musical settings ──────────────────────────────────────────────────────
  /**
   * Capo position, 0 = no capo.
   * The chords in the body are written as if the capo were the nut.
   */
  capo: number;

  /**
   * Tuning description, e.g. "Standard", "Drop D", "Open G".
   * Relevant for tabs; optional for chord sheets.
   */
  tuning: string;

  /**
   * Key of the song as it sounds (after applying the capo), e.g. "G", "Bb".
   * Optional — the user may leave it blank.
   */
  key: string;

  /**
   * Tempo in beats per minute, 0 = not specified.
   * Helps the auto-scroll feature set a sensible default speed.
   */
  bpm: number;

  /** Time signature, e.g. "4/4", "3/4". */
  timeSignature: TimeSignature;

  /** Difficulty level. */
  difficulty: Difficulty;

  // ── Content ───────────────────────────────────────────────────────────────
  /**
   * Free-text description or performance notes written by the submitter.
   * Shown above the song body.
   */
  description: string;

  /**
   * The song body: lyrics interleaved with chord names.
   * Chord lines are detected automatically by isChordLine() in music_theory.ts.
   *
   * Example:
   *   [Verse 1]
   *   G               Em
   *   Como el ciervo busca por las aguas,
   *         C      G         C    D
   *   así clama mi alma por ti Señor.
   */
  body: string;

  // ── Meta ──────────────────────────────────────────────────────────────────
  /** ISO 8601 timestamp of creation. */
  createdAt: string;

  /** ISO 8601 timestamp of last edit. */
  updatedAt: string;

  /**
   * Version number within the same title+artist.
   * The first submission is version 1; corrections create version 2, etc.
   */
  version: number;
}

// ── Factory ───────────────────────────────────────────────────────────────────

/** Return a blank SongEntry with sensible defaults, ready to bind to a form. */
export function emptySongEntry(): SongEntry {
  const now = new Date().toISOString();
  return {
    id:            '',
    title:         '',
    artist:        '',
    type:          'chords',
    capo:          0,
    tuning:        'Standard',
    key:           '',
    bpm:           0,
    timeSignature: '4/4',
    difficulty:    'beginner',
    description:   '',
    body:          '',
    createdAt:     now,
    updatedAt:     now,
    version:       1,
  };
}
