import type { ChordDatabase } from '../types';
import {
  chordShorthand,
  getChordsForKey,
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
} from '../engine/chord_search';
import guitarChords from '../data/guitar_chords.json';

setChordDatabases({ guitar: guitarChords as unknown as ChordDatabase });

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
