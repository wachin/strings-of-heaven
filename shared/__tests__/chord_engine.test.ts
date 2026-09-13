import type { ChordDatabase } from '../types';
import {
  getChordsForKey,
  getChordPositions,
  getChord,
  getSuffixes,
  chordExists,
  parseFretString,
  chordDisplayName,
  findEquivalentSuffix,
  normalizeKey,
  setChordDatabases,
  ALL_KEYS,
} from '../engine/chord_engine';
import guitarChords from '../data/guitar_chords.json';
import pianoChords from '../data/piano_chords.json';
import ukuleleChords from '../data/ukulele_chords.json';

setChordDatabases({
  guitar: guitarChords as unknown as ChordDatabase,
  piano: pianoChords as unknown as ChordDatabase,
  ukulele: ukuleleChords as unknown as ChordDatabase,
});

describe('getChordsForKey', () => {
  it('returns chords for a guitar key', () => {
    const chords = getChordsForKey('C', 'guitar');
    expect(chords.length).toBeGreaterThan(30);
    expect(chords[0].key).toBe('C');
  });

  it('returns chords for piano and ukulele', () => {
    expect(getChordsForKey('C', 'piano').length).toBeGreaterThan(10);
    expect(getChordsForKey('C', 'ukulele').length).toBeGreaterThan(10);
  });

  it('returns an empty array for unknown keys', () => {
    expect(getChordsForKey('H', 'guitar')).toEqual([]);
  });
});

describe('getChordPositions', () => {
  it('returns C major guitar positions', () => {
    const positions = getChordPositions('C', 'major', 'guitar');
    expect(positions.length).toBeGreaterThan(2);
    expect(positions[0]).toEqual({
      frets: [-1, 3, 2, 0, 1, 0],
      fingers: [0, 3, 2, 0, 1, 0],
      baseFret: 1,
      barres: [],
      midi: [48, 52, 55, 60, 64],
    });
  });

  it('returns piano positions with note names', () => {
    const positions = getChordPositions('C', 'major', 'piano');
    expect(positions.length).toBe(1);
    expect(positions[0].frets).toEqual(['C', 'E', 'G']);
    expect(positions[0].fingers).toEqual(['1', '3', '5']);
  });

  it('returns ukulele positions with 4 strings', () => {
    const positions = getChordPositions('C', 'major', 'ukulele');
    expect(positions.length).toBeGreaterThan(1);
    expect(positions[0].frets).toEqual([0, 0, 0, 3]);
  });

  it('supports multiple voicings for the same guitar chord', () => {
    const positions = getChordPositions('C', 'major', 'guitar');
    const uniqueFrets = new Set(positions.map((p) => (p.frets as number[]).join(',')));
    expect(uniqueFrets.size).toBe(positions.length);
    expect(positions.length).toBeGreaterThanOrEqual(2);
  });

  it('returns an empty array for unknown chords', () => {
    expect(getChordPositions('C', 'nonexistent', 'guitar')).toEqual([]);
  });
});

describe('getChord / getSuffixes / chordExists', () => {
  it('returns the full chord record', () => {
    const chord = getChord('C', 'major', 'guitar');
    expect(chord?.displayName).toBe('C major');
    expect(chord?.key).toBe('C');
  });

  it('lists distinct suffixes', () => {
    const suffixes = getSuffixes('C', 'guitar');
    expect(suffixes).toContain('major');
    expect(suffixes).toContain('minor');
    expect(suffixes).toContain('maj7');
    expect(new Set(suffixes).size).toBe(suffixes.length);
  });

  it('checks chord existence per instrument', () => {
    expect(chordExists('C', 'major', 'guitar')).toBe(true);
    expect(chordExists('C', 'nonexistent', 'piano')).toBe(false);
  });
});

describe('parseFretString', () => {
  it('parses the fallback hex format', () => {
    expect(parseFretString('x02220')).toEqual([-1, 0, 2, 2, 2, 0]);
    expect(parseFretString('577655')).toEqual([5, 7, 7, 6, 5, 5]);
  });

  it('parses frets above 9 with letters', () => {
    expect(parseFretString('xab955')).toEqual([-1, 10, 11, 9, 5, 5]);
  });

  it('rejects invalid characters', () => {
    expect(() => parseFretString('xyz123')).toThrow();
  });
});

describe('normalizeKey', () => {
  it('normalizes sharp key spellings', () => {
    expect(normalizeKey('Csharp')).toBe('C#');
    expect(normalizeKey('C#')).toBe('C#');
    expect(normalizeKey('Bb')).toBe('Bb');
  });
});

describe('findEquivalentSuffix', () => {
  it('returns the suffix when it exists', () => {
    expect(findEquivalentSuffix('major', 'C', 'guitar')).toBe('major');
  });

  it('maps "minor" to "m" on piano', () => {
    expect(findEquivalentSuffix('minor', 'C', 'piano')).toBe('m');
  });

  it('maps "m" to "minor" on guitar', () => {
    expect(findEquivalentSuffix('m', 'C', 'guitar')).toBe('minor');
  });

  it('falls back to "major" for nonexistent suffixes', () => {
    expect(findEquivalentSuffix('alt', 'C', 'piano')).toBe('major');
  });
});

describe('display helpers', () => {
  it('builds display names for known suffixes', () => {
    expect(chordDisplayName('C', 'major')).toBe('C Major');
    expect(chordDisplayName('A', 'm7b5')).toBe('A Half-Diminished');
  });

  it('falls back to the chord-site spelling for unknown types', () => {
    // This used to be "C 13b9": the raw suffix glued on with a space.
    expect(chordDisplayName('C', '13b9')).toBe('C13b9');
    expect(chordDisplayName('C', 'sus2sus4')).toBe('Csus2sus4');
    expect(chordDisplayName('C', 'mmaj11')).toBe('Cmmaj11');
    expect(chordDisplayName('C', 'alt')).toBe('Calt');
    expect(chordDisplayName('C', '69')).toBe('C69');
  });

  it('writes slash chords as the chord over its bass note', () => {
    expect(chordDisplayName('C', '7/G')).toBe('C7/G');
    expect(chordDisplayName('C', 'm/A')).toBe('Cm/A');
    expect(chordDisplayName('C', 'm9/Bb')).toBe('Cm9/Bb');
    expect(chordDisplayName('C', '/G')).toBe('C/G');
  });

  it('exposes all 12 keys', () => {
    expect(ALL_KEYS).toHaveLength(12);
    expect(ALL_KEYS[0]).toBe('C');
    expect(ALL_KEYS[11]).toBe('B');
  });
});

describe('resolveKey / enharmonic fallback', () => {
  it('falls back to the flat spelling when the sharp key is missing (ukulele)', () => {
    // Ukulele data spells these with flats, not sharps.
    expect(getChordsForKey('C#', 'ukulele').length).toBeGreaterThan(0);
    expect(getChordsForKey('F#', 'ukulele').length).toBeGreaterThan(0);
    const chord = getChord('C#', 'major', 'ukulele');
    expect(chord).toBeDefined();
    expect(chord?.positions.length).toBeGreaterThan(0);
  });

  it('keeps the sharp spelling when both are present (guitar)', () => {
    expect(getChordsForKey('C#', 'guitar').length).toBeGreaterThan(0);
  });
});
