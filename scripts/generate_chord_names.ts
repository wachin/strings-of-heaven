/**
 * Generates docs/CHORD_NAMES.md from the chord databases.
 *
 * The document is a reference for developers: the exact chord names the app can
 * display, per root note and per instrument. It is built from the *same* engine
 * the UI uses (`chordShorthand`), so a name listed here is exactly what the
 * Explore search accepts and what the cards show.
 *
 * Run with `npm run docs:chords` (see scripts/generate_chord_names.mjs).
 * CI fails if the committed file differs from a fresh generation.
 */

import guitar from '../shared/data/guitar_chords.json';
import ukulele from '../shared/data/ukulele_chords.json';
import piano from '../shared/data/piano_chords.json';
import {
  ALL_KEYS,
  chordShorthand,
  getChordsForKey,
  rootSpellings,
  setChordDatabases,
} from '../shared/engine/chord_engine';
import { chordDisplayName } from '../shared/engine/chord_engine';
import type { ChordDatabase, Instrument } from '../shared/types';

setChordDatabases({
  guitar: guitar as unknown as ChordDatabase,
  ukulele: ukulele as unknown as ChordDatabase,
  piano: piano as unknown as ChordDatabase,
});

const INSTRUMENTS: Instrument[] = ['guitar', 'ukulele', 'piano'];
const INSTRUMENT_LABEL: Record<Instrument, string> = {
  guitar: 'Guitar',
  ukulele: 'Ukulele',
  piano: 'Piano',
};

/** Suffixes available on each root note, in database order. */
function suffixesByKey(instrument: Instrument): Map<string, string[]> {
  const result = new Map<string, string[]>();
  for (const key of ALL_KEYS) {
    result.set(
      key,
      getChordsForKey(key, instrument).map((chord) => chord.suffix),
    );
  }
  return result;
}

/** Names available on each root note, in database order. */
function namesByKey(instrument: Instrument): Map<string, string[]> {
  const result = new Map<string, string[]>();
  for (const key of ALL_KEYS) {
    result.set(
      key,
      getChordsForKey(key, instrument).map((chord) => chordShorthand(key, chord.suffix)),
    );
  }
  return result;
}

function buildSummary(): string {
  const rows = INSTRUMENTS.map((instrument) => {
    const byKey = suffixesByKey(instrument);
    const counts = ALL_KEYS.map((key) => byKey.get(key)?.length ?? 0);
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    const per = min === max ? String(min) : `${min}–${max}`;
    const total = counts.reduce((sum, n) => sum + n, 0);
    return `| ${INSTRUMENT_LABEL[instrument]} | 12 | ${per} | ${total} |`;
  });

  return [
    '| Instrument | Root notes | Chords per note | Total |',
    '|---|---|---|---|',
    ...rows,
  ].join('\n');
}

function buildRootSection(): string {
  const enharmonics = ALL_KEYS.map((key) => {
    const others = rootSpellings(key).filter((spelling) => spelling !== key);
    return others.length > 0 ? `\`${key}\` (also \`${others.join('`, `')}\`)` : `\`${key}\``;
  });

  return [
    'The app uses the 12 notes in `ALL_KEYS`, spelled the way chords-db ships them:',
    '',
    enharmonics.join(' · '),
    '',
    'The search box additionally accepts the other spelling of each pitch class,',
    'so `D#m` finds `Eb minor` and `G#dim7` finds `Ab Diminished 7th`.',
    '',
    '> Note the flat spellings `Eb`, `Ab` and `Bb` — there is **no** `D#`, `G#` or',
    '> `A#` root note on the page.',
  ].join('\n');
}

function buildInstrumentSection(instrument: Instrument): string {
  const names = namesByKey(instrument);
  const suffixes = suffixesByKey(instrument);

  const base = (suffixes.get(ALL_KEYS[0]) ?? []).join('|');
  const uniform = ALL_KEYS.every((key) => (suffixes.get(key) ?? []).join('|') === base);

  const lines: string[] = [];
  lines.push(`### ${INSTRUMENT_LABEL[instrument]}`);
  lines.push('');

  if (uniform) {
    lines.push(
      `Every root note has the **same ${suffixes.get(ALL_KEYS[0])?.length ?? 0} chords**.`,
    );
  } else {
    lines.push(
      'The set of chords is **not identical on every root note**: chords-db only ships',
      'some inversions (slash chords), and the bass note follows the root spelling.',
      'See [Chords missing on some notes](#chords-missing-on-some-notes).',
    );
  }
  lines.push('');

  for (const key of ALL_KEYS) {
    const list = names.get(key) ?? [];
    lines.push(`<details>`);
    lines.push(`<summary><b>${key}</b> — ${list.length} chords</summary>`);
    lines.push('');
    lines.push(list.map((name) => `\`${name}\``).join(' · '));
    lines.push('');
    lines.push(`</details>`);
    lines.push('');
  }

  return lines.join('\n');
}

/** Suffixes that are not available on all 12 notes, for one instrument. */
function buildGapsSection(): string {
  const blocks: string[] = [];

  for (const instrument of INSTRUMENTS) {
    const suffixes = suffixesByKey(instrument);
    const union = new Set<string>();
    for (const key of ALL_KEYS) for (const suffix of suffixes.get(key) ?? []) union.add(suffix);

    const uneven = [...union]
      .map((suffix) => {
        const missing = ALL_KEYS.filter((key) => !(suffixes.get(key) ?? []).includes(suffix));
        return { suffix, missing };
      })
      .filter((entry) => entry.missing.length > 0)
      .sort((a, b) => b.missing.length - a.missing.length || a.suffix.localeCompare(b.suffix));

    blocks.push(`### ${INSTRUMENT_LABEL[instrument]}`);
    blocks.push('');

    if (uneven.length === 0) {
      blocks.push('Every chord is available on all 12 root notes. ✅');
      blocks.push('');
      continue;
    }

    blocks.push('| Chord type | Available on | Missing on |');
    blocks.push('|---|---|---|');

    const notes = (list: string[]) => list.map((n) => `\`${n}\``).join(' ');

    for (const { suffix, missing } of uneven) {
      const available = ALL_KEYS.filter((key) => !missing.includes(key));
      const example = chordShorthand('C', suffix);
      blocks.push(
        `| \`${example}\` (suffix \`${suffix}\`) | ${available.length}/12 — ${notes(available)} | ${notes(missing)} |`,
      );
    }
    blocks.push('');
  }

  return blocks.join('\n');
}

/** Chord types that only one instrument has. */
function buildInstrumentDifferences(): string {
  // Compare the *names* for one root, not the raw suffixes: guitar stores minor
  // as "minor" and piano as "m", but both display "Cm", so comparing suffixes
  // would wrongly report Cm as piano-only.
  const reference = 'C';
  const names = new Map<Instrument, Set<string>>();
  for (const instrument of INSTRUMENTS) {
    names.set(
      instrument,
      new Set(
        getChordsForKey(reference, instrument).map((chord) =>
          chordShorthand(reference, chord.suffix),
        ),
      ),
    );
  }

  const guitarNames = names.get('guitar') ?? new Set<string>();
  const ukuleleNames = names.get('ukulele') ?? new Set<string>();
  const pianoNames = names.get('piano') ?? new Set<string>();

  const render = (list: string[]) => (list.length === 0 ? '—' : list.map((n) => `\`${n}\``).join(' · '));

  const onlyGuitar = [...guitarNames].filter((n) => !ukuleleNames.has(n) && !pianoNames.has(n));
  const onlyUkulele = [...ukuleleNames].filter((n) => !guitarNames.has(n) && !pianoNames.has(n));
  const onlyPiano = [...pianoNames].filter((n) => !guitarNames.has(n) && !ukuleleNames.has(n));

  return [
    `Compared on the ${reference} root note:`,
    '',
    '| Chord names found on only one instrument | Names |',
    '|---|---|',
    `| Guitar only (${onlyGuitar.length}) | ${render(onlyGuitar)} |`,
    `| Ukulele only (${onlyUkulele.length}) | ${render(onlyUkulele)} |`,
    `| Piano only (${onlyPiano.length}) | ${render(onlyPiano)} |`,
  ].join('\n');
}

function buildDoc(): string {
  const guitarCount = getChordsForKey('C', 'guitar').length;

  return `# Chord names available per root note

> **Generated file — do not edit by hand.**
> Regenerate with \`npm run docs:chords\`.

This is the exact list of chord names the app can display, per root note and per
instrument. It is produced from the same engine the interface uses, so every name
here is exactly what the Explore search accepts and what the chord cards show.

**Source of truth:** \`shared/data/{guitar,ukulele,piano}_chords.json\`, generated by
\`scripts/process_chords.js\` from the [\`tombatossals/chords-db\`](https://github.com/tombatossals/chords-db)
submodule in \`third-party/\`. Nothing here is hard-coded.

## Summary

${buildSummary()}

For example, guitar offers ${guitarCount} chords for C — from \`C\` itself to
\`${chordDisplayName('C', 'm9/Eb')}\` and \`${chordDisplayName('C', '7/G')}\`.

## Root notes

${buildRootSection()}

## The full list, instrument by instrument

${INSTRUMENTS.map(buildInstrumentSection).join('\n')}
## Chords missing on some notes

A chord type listed in one note's list is not guaranteed to exist on another.
This matters most for guitar, where chords-db only ships some slash chords:
\`C7/G\` exists, but **D has no \`7/…\` chord at all**.

${buildGapsSection()}
## Chord types unique to one instrument

The three databases are not the same size, and each has chords the others lack.

${buildInstrumentDifferences()}

> ⚠️ **Two ukulele names are ambiguous in the source data.** The suffixes
> \`b13b9\` and \`b13#9\` have no base triad, so the generated names read
> **\`Cb13b9\`** and **\`Cb13#9\`**, which look like "C flat". They are ukulele-only
> and are almost certainly \`7b13b9\` / \`7b13#9\`. They are left exactly as
> chords-db ships them rather than guessing at the intended chord; if the
> upstream data is ever corrected, regenerate this file.

## How this document is verified

- \`shared/__tests__/chord_search.test.ts\` asserts that for all 12 notes and all
  3 instruments, **every chord in the database is findable by typing its own
  name**, and that every enharmonic spelling of a root resolves correctly.
- CI runs \`npm run docs:chords\` and fails if this file is out of date, so it can
  never drift away from the data.
`;
}

process.stdout.write(buildDoc());
