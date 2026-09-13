import type { ChordDatabase, Instrument } from '../types';
import {
  ALL_KEYS,
  canonicalRoot,
  chordShorthand,
  getChordsForKey,
  rootSpellings,
  setChordDatabases,
  suffixSymbol,
} from '../engine/chord_engine';
import {
  MATCH_EXACT,
  MATCH_PREFIX,
  chordSearchAliases,
  chordSearchScore,
  filterChordsByQuery,
  normalizeChordQuery,
  rootFromQuery,
  splitRootFromQuery,
} from '../engine/chord_search';
import guitarChords from '../data/guitar_chords.json';
import ukuleleChords from '../data/ukulele_chords.json';
import pianoChords from '../data/piano_chords.json';

setChordDatabases({
  guitar: guitarChords as unknown as ChordDatabase,
  ukulele: ukuleleChords as unknown as ChordDatabase,
  piano: pianoChords as unknown as ChordDatabase,
});

const INSTRUMENTS: Instrument[] = ['guitar', 'ukulele', 'piano'];
const cChords = getChordsForKey('C', 'guitar');
const suffixesFor = (query: string) => filterChordsByQuery(cChords, query).map((c) => c.suffix);

describe('chordShorthand', () => {
  it('uses the symbol musicians write', () => {
    expect(chordShorthand('C', 'major')).toBe('C');
    expect(chordShorthand('C', 'minor')).toBe('Cm');
    expect(chordShorthand('C', 'dim')).toBe('Cdim');
    expect(chordShorthand('C', 'dim7')).toBe('Cdim7');
    expect(chordShorthand('C', 'aug')).toBe('Caug');
    expect(chordShorthand('C', '5')).toBe('C5');
    expect(chordShorthand('C', '6')).toBe('C6');
    expect(chordShorthand('C', '7')).toBe('C7');
    expect(chordShorthand('C', 'maj7')).toBe('Cmaj7');
    expect(chordShorthand('F#', 'minor')).toBe('F#m');
  });

  it('falls back to the suffix for chords that have no symbol', () => {
    // These are already written exactly like this on chord sites.
    expect(chordShorthand('C', 'sus')).toBe('Csus');
    expect(chordShorthand('C', 'sus2sus4')).toBe('Csus2sus4');
    expect(chordShorthand('C', '7sus4')).toBe('C7sus4');
    expect(chordShorthand('C', 'alt')).toBe('Calt');
    expect(chordShorthand('C', '69')).toBe('C69');
    expect(chordShorthand('C', '7b5')).toBe('C7b5');
    expect(chordShorthand('C', '7/G')).toBe('C7/G');
    expect(chordShorthand('C', '/G')).toBe('C/G');
  });

  it('exposes the symbol on its own', () => {
    expect(suffixSymbol('major')).toBe('');
    expect(suffixSymbol('minor')).toBe('m');
    expect(suffixSymbol('sus')).toBeUndefined();
  });
});

describe('normalizeChordQuery', () => {
  it('folds case, spaces and unicode accidentals', () => {
    expect(normalizeChordQuery('C Major')).toBe('cmajor');
    expect(normalizeChordQuery(' C7/G ')).toBe('c7/g');
    expect(normalizeChordQuery('C♯m')).toBe('c#m');
  });
});

describe('chordSearchAliases', () => {
  it('includes the long name, the chord-site name, the suffix, the symbol and the type name', () => {
    const aliases = chordSearchAliases('C', 'minor');
    expect(aliases).toContain('C Minor');
    expect(aliases).toContain('Cm');
    expect(aliases).toContain('minor');
    expect(aliases).toContain('m');
    expect(aliases).toContain('Minor');
  });
});

describe('chordSearchScore', () => {
  it('scores exact matches above partial ones', () => {
    expect(chordSearchScore('C', 'minor', 'cm')).toBe(MATCH_EXACT);
    expect(chordSearchScore('C', 'major', 'cm')).toBe(MATCH_PREFIX); // "C Major" starts with "cm"
    expect(chordSearchScore('C', 'minor', 'zzz')).toBe(0);
  });
});

describe('filterChordsByQuery', () => {
  it('returns every chord for an empty query', () => {
    expect(filterChordsByQuery(cChords, '')).toHaveLength(cChords.length);
    expect(filterChordsByQuery(cChords, '   ')).toHaveLength(cChords.length);
  });

  it('does not narrow when only the root note is typed', () => {
    // The page is already scoped to C, so typing "C" must not hide the rest.
    expect(filterChordsByQuery(cChords, 'C')).toHaveLength(cChords.length);
    expect(filterChordsByQuery(cChords, 'c')).toHaveLength(cChords.length);
  });

  // Exactly the spellings requested, copied from chord websites.
  it.each([
    ['Cm', 'minor'],
    ['Cdim', 'dim'],
    ['Cdim7', 'dim7'],
    ['Csus', 'sus'],
    ['Csus4', 'sus4'],
    ['Csus2sus4', 'sus2sus4'],
    ['C7sus4', '7sus4'],
    ['Calt', 'alt'],
    ['Caug', 'aug'],
    ['C5', '5'],
    ['C6', '6'],
    ['C69', '69'],
    ['C7', '7'],
    ['C7b5', '7b5'],
    ['C7/G', '7/G'],
    ['Caug7', 'aug7'],
  ])('finds %s', (query, expectedSuffix) => {
    // An exact hit must win outright, without dragging in Cmaj7/Cm6 style noise.
    expect(suffixesFor(query)).toEqual([expectedSuffix]);
  });

  it('still accepts the long display names that worked before', () => {
    expect(suffixesFor('C Minor')).toEqual(['minor']);
    expect(suffixesFor('C Diminished 7th')).toEqual(['dim7']);
    expect(suffixesFor('c major')).toEqual(['major']);
  });

  it('treats a bare database suffix as an exact hit', () => {
    expect(suffixesFor('m7')).toEqual(['m7']);
    expect(suffixesFor('dim7')).toEqual(['dim7']);
  });

  it('returns partial matches, best first, when nothing is exact', () => {
    const found = suffixesFor('m7b');
    expect(found).toContain('m7b5');
    expect(found[0]).toBe('m7b5');
    expect(found).not.toContain('major');
  });

  it('returns nothing for a chord this root does not have', () => {
    expect(filterChordsByQuery(cChords, 'zzz')).toHaveLength(0);
  });
});

describe('root notes', () => {
  it('reads the note a query starts with', () => {
    expect(splitRootFromQuery('Ebm7')).toEqual({ root: 'Eb', route: 'm7' });
    expect(splitRootFromQuery('F#maj9')).toEqual({ root: 'F#', route: 'maj9' });
    expect(splitRootFromQuery('m7')).toEqual({ root: null, route: 'm7' });
  });

  it('maps every enharmonic spelling onto the page spelling', () => {
    // The note buttons use ALL_KEYS: C, C#, D, Eb, E, F, F#, G, Ab, A, Bb, B.
    expect(ALL_KEYS).toHaveLength(12);
    expect(canonicalRoot('Db')).toBe('C#');
    expect(canonicalRoot('D#')).toBe('Eb');
    expect(canonicalRoot('Gb')).toBe('F#');
    expect(canonicalRoot('G#')).toBe('Ab');
    expect(canonicalRoot('A#')).toBe('Bb');
    expect(canonicalRoot('eb')).toBe('Eb'); // lowercase, as typed
    expect(canonicalRoot('H')).toBeUndefined();
  });

  it('resolves the note from a query in either spelling', () => {
    expect(rootFromQuery('D#m')).toBe('Eb');
    expect(rootFromQuery('Ebm')).toBe('Eb');
    expect(rootFromQuery('C7/G')).toBe('C');
    expect(rootFromQuery('m7')).toBeNull();
  });

  it('lists both spellings of a pitch class', () => {
    expect(rootSpellings('Eb')).toEqual(['Eb', 'D#']);
    expect(rootSpellings('C')).toEqual(['C']);
  });
});

describe('enharmonic spellings find the chord', () => {
  it('finds Eb minor when the user types D#m', () => {
    const eb = getChordsForKey('Eb', 'guitar');
    expect(filterChordsByQuery(eb, 'D#m').map((c) => c.suffix)).toEqual(['minor']);
    expect(filterChordsByQuery(eb, 'D#maj7').map((c) => c.suffix)).toEqual(['maj7']);
  });

  it('finds Ab chords when the user types G#', () => {
    const ab = getChordsForKey('Ab', 'guitar');
    expect(filterChordsByQuery(ab, 'G#dim7').map((c) => c.suffix)).toEqual(['dim7']);
  });
});

describe('piano spells alterations out', () => {
  it('accepts the # spelling the user writes', () => {
    const pianoC = getChordsForKey('C', 'piano');
    // The piano database stores "7sharp9", "9sharp11" and "maj7sharp5".
    expect(chordShorthand('C', '7sharp9')).toBe('C7#9');
    expect(chordShorthand('C', '9sharp11')).toBe('C9#11');
    expect(chordShorthand('C', 'maj7sharp5')).toBe('Cmaj7#5');
    expect(filterChordsByQuery(pianoC, 'C7#9').map((c) => c.suffix)).toEqual(['7sharp9']);
    expect(filterChordsByQuery(pianoC, 'Cmaj7#5').map((c) => c.suffix)).toEqual(['maj7sharp5']);
  });
});

describe('every available chord answers to its own name', () => {
  // This is the guarantee the owner asked for: if a chord is on the page, typing
  // its chord-site name must find it — for all 12 notes and all 3 instruments.
  for (const instrument of INSTRUMENTS) {
    it(`${instrument}: every chord of every note is findable`, () => {
      const failures: string[] = [];

      for (const key of ALL_KEYS) {
        const chords = getChordsForKey(key, instrument);
        expect(chords.length).toBeGreaterThan(0);

        for (const chord of chords) {
          const name = chordShorthand(key, chord.suffix);
          const found = filterChordsByQuery(chords, name).map((c) => c.suffix);
          if (!found.includes(chord.suffix)) failures.push(`${name} → ${chord.suffix}`);
        }
      }

      expect(failures).toEqual([]);
    });
  }
});

describe('not every inversion exists for every note', () => {
  // chords-db only ships some slash chords, and the bass spelling changes with
  // the root. Documented so a "missing" name is not mistaken for a search bug.
  it('C7/G exists but D7/G does not', () => {
    expect(suffixesFor('C7/G')).toEqual(['7/G']);
    expect(filterChordsByQuery(getChordsForKey('D', 'guitar'), 'D7/G')).toHaveLength(0);
  });

  it('the m9 bass notes differ per root', () => {
    const slur = (key: string) =>
      getChordsForKey(key, 'guitar')
        .map((c) => chordShorthand(key, c.suffix))
        .filter((n) => n.includes('m9/'));

    expect(slur('C')).toEqual(['Cm9/Bb', 'Cm9/Eb']);
    expect(slur('D')).toEqual(['Dm9/C', 'Dm9/F']);
  });

  it('Ab has no sus2sus4', () => {
    const names = getChordsForKey('Ab', 'guitar').map((c) => chordShorthand('Ab', c.suffix));
    expect(names).not.toContain('Absus2sus4');
    expect(names).toContain('Absus4');
  });
});
