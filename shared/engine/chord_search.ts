/**
 * Chord search — accepts the names musicians actually use.
 *
 * The Explore page used to match only the long display name ("C Diminished 7th")
 * and the raw database suffix ("dim7"), so typing `Cm` or `C7/G` found nothing.
 * Chord sites spell chords as **root + symbol** (`C`, `Cm`, `Cdim7`, `C7/G`,
 * `Csus2sus4`), and that is what this module understands, while keeping the long
 * names working for people who prefer them.
 *
 * Matching is scored, and an exact hit wins outright: typing `Cm` returns only
 * C minor, not also Cmaj7 and Cm6. Partial searches still work — they return
 * everything that matches, best first.
 *
 * Roots are accepted in any spelling: a chord stored as `Eb` is also findable as
 * `D#m`, because every enharmonic spelling of the root is part of its aliases.
 */

import {
  canonicalRoot,
  canonicalTypeForSuffix,
  chordDisplayName,
  chordShorthand,
  rootSpellings,
  suffixSymbol,
} from './chord_engine';
import { CHORD_TYPE_INFO } from '../constants/theory';
import type { ProcessedChord } from '../types';

export const MATCH_NONE = 0;
export const MATCH_SUBSTRING = 1;
export const MATCH_PREFIX = 2;
export const MATCH_EXACT = 3;

/**
 * Fold a query or alias for comparison: case-insensitive, no spaces, and with
 * the Unicode sharp/flat signs normalised to their ASCII forms.
 *
 * "C Major" → "cmajor", "C ♯m" → "c#m", "C7/G" → "c7/g"
 */
export function normalizeChordQuery(value: string): string {
  return value
    .toLowerCase()
    .replace(/♯/g, '#')
    .replace(/♭/g, 'b')
    .replace(/\s+/g, '');
}

/**
 * Split a leading note name off a query: `"Ebm7"` → `{ root: "Eb", route: "m7" }`.
 *
 * This is deliberately naive — it only reports what the query *looks* like. The
 * caller decides whether to act on it, which is what stops `add9` from being read
 * as "the note A".
 */
export function splitRootFromQuery(query: string): { root: string | null; route: string } {
  const match = /^\s*([A-Ga-g][#b]?)(.*)$/.exec(query);
  if (!match) return { root: null, route: query };
  return { root: match[1], route: match[2] };
}

/** The page (ALL_KEYS) spelling of the root a query begins with, if any. */
export function rootFromQuery(query: string): string | null {
  const { root } = splitRootFromQuery(query);
  return root ? canonicalRoot(root) ?? null : null;
}

/**
 * Every spelling that should find this chord:
 *
 * | Alias | Example for C minor |
 * |---|---|
 * | long display name | `C Minor` |
 * | chord-site name | `Cm` |
 * | enharmonic root spellings | `D#m` for Eb minor |
 * | raw database suffix | `minor` |
 * | short symbol | `m` |
 * | canonical type name | `Minor` |
 */
export function chordSearchAliases(chordKey: string, suffix: string): string[] {
  const aliases = new Set<string>();

  aliases.add(chordDisplayName(chordKey, suffix));
  aliases.add(suffix);

  // So "Eb minor" also answers to "D#m", and vice versa.
  for (const spelling of rootSpellings(chordKey)) {
    aliases.add(chordShorthand(spelling, suffix));
  }

  const symbol = suffixSymbol(suffix);
  if (symbol) aliases.add(symbol);

  const canonical = canonicalTypeForSuffix(suffix);
  if (canonical) {
    const info = CHORD_TYPE_INFO[canonical];
    if (info) aliases.add(info.name);
  }

  return [...aliases];
}

/** How well one chord matches an already-normalised query. */
export function chordSearchScore(
  chordKey: string,
  suffix: string,
  normalizedQuery: string,
): number {
  if (!normalizedQuery) return MATCH_SUBSTRING;

  let best = MATCH_NONE;
  for (const alias of chordSearchAliases(chordKey, suffix)) {
    const candidate = normalizeChordQuery(alias);
    if (!candidate) continue;

    if (candidate === normalizedQuery) return MATCH_EXACT;
    if (candidate.startsWith(normalizedQuery)) {
      best = Math.max(best, MATCH_PREFIX);
    } else if (candidate.includes(normalizedQuery)) {
      best = Math.max(best, MATCH_SUBSTRING);
    }
  }
  return best;
}

/**
 * Filter the chords of a single root note by a free-text query.
 *
 * - An empty query keeps everything.
 * - Typing just the root note (`C` while C is selected) is not a narrowing
 *   search, because the page is already scoped to that root.
 * - If any chord matches exactly, only exact matches are returned.
 * - Otherwise every partial match is returned, best match first, keeping the
 *   database order within the same score.
 */
export function filterChordsByQuery(chords: ProcessedChord[], query: string): ProcessedChord[] {
  const normalizedQuery = normalizeChordQuery(query);
  if (!normalizedQuery) return chords;

  const root = chords[0]?.key;
  if (root && normalizedQuery === normalizeChordQuery(root)) return chords;

  const scored = chords.map((chord) => ({
    chord,
    score: chordSearchScore(chord.key, chord.suffix, normalizedQuery),
  }));

  const exact = scored.filter((entry) => entry.score === MATCH_EXACT);
  if (exact.length > 0) return exact.map((entry) => entry.chord);

  return scored
    .filter((entry) => entry.score > MATCH_NONE)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.chord);
}
