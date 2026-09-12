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
 */

import { chordDisplayName, chordShorthand, suffixSymbol } from './chord_engine';
import { canonicalTypeForSuffix } from './chord_engine';
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
 * Every spelling that should find this chord:
 *
 * | Alias | Example for C minor |
 * |---|---|
 * | long display name | `C Minor` |
 * | chord-site name | `Cm` |
 * | raw database suffix | `minor` |
 * | short symbol | `m` |
 * | canonical type name | `Minor` |
 */
export function chordSearchAliases(chordKey: string, suffix: string): string[] {
  const aliases = new Set<string>();

  aliases.add(chordDisplayName(chordKey, suffix));
  aliases.add(chordShorthand(chordKey, suffix));
  aliases.add(suffix);

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
