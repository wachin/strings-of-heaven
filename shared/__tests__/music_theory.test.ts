import {
  Note,
  buildScale,
  buildChordNotes,
  harmonizeScale,
  intervalComplement,
  getInterval,
} from '../engine/music_theory';

describe('Note', () => {
  it('parses letters, accidentals, and octaves', () => {
    const c4 = new Note('C4');
    expect(c4.toString()).toBe('C');
    expect(c4.midi).toBe(60);
    expect(new Note('A4').frequency).toBeCloseTo(440);
  });

  it('defaults to octave 4', () => {
    expect(new Note('Eb').scientificNotation).toBe('Eb4');
    expect(new Note('Bb').midi).toBe(70);
  });

  it('rejects invalid names', () => {
    expect(() => new Note('#')).toThrow();
    expect(() => new Note('A9b')).toThrow();
    expect(() => new Note('Dbbbb')).toThrow();
  });

  it('computes midi and frequency', () => {
    expect(new Note('C4').midi).toBe(60);
    expect(new Note('C5').midi).toBe(72);
    expect(new Note('A3').frequency).toBeCloseTo(220);
  });

  it('transposes by simple intervals', () => {
    expect(new Note('C4').transpose('M3').toString()).toBe('E');
    expect(new Note('C4').transpose('P5').toString()).toBe('G');
    expect(new Note('A4').transpose('m3').toString()).toBe('C');
    expect(new Note('C4').transpose('P8').scientificNotation).toBe('C5');
  });

  it('transposes by compound intervals', () => {
    expect(new Note('C4').transpose('M9').scientificNotation).toBe('D5');
    expect(new Note('C4').transpose('M13').scientificNotation).toBe('A5');
  });

  it('handles double accidentals when transposing', () => {
    expect(new Note('C#4').transpose('M3').toString()).toBe('E#');
    expect(new Note('Ab4').transpose('m3').toString()).toBe('Cb');
  });

  it('transposes down by intervals', () => {
    expect(new Note('C5').transposeDown('M3').toString()).toBe('Ab');
    expect(new Note('C5').transposeDown('P8').scientificNotation).toBe('C4');
  });
});

describe('intervals', () => {
  it('exposes semitone values', () => {
    expect(getInterval('P1').semitones).toBe(0);
    expect(getInterval('m3').semitones).toBe(3);
    expect(getInterval('M7').semitones).toBe(11);
    expect(getInterval('M9').semitones).toBe(14);
  });

  it('rejects invalid names', () => {
    expect(() => getInterval('P3')).toThrow();
    expect(() => getInterval('5')).toThrow();
  });

  it('inverts intervals', () => {
    expect(intervalComplement('M3')).toBe('m6');
    expect(intervalComplement('P4')).toBe('P5');
    expect(intervalComplement('P8')).toBe('P1');
  });
});

describe('buildScale', () => {
  it('builds the C major scale', () => {
    expect(buildScale('C', 'major')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  });

  it('builds the A natural minor scale', () => {
    expect(buildScale('A', 'natural_minor')).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  });

  it('builds the A harmonic minor scale', () => {
    expect(buildScale('A', 'harmonic_minor')).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G#']);
  });

  it('builds pentatonic scales', () => {
    expect(buildScale('C', 'major_pentatonic')).toEqual(['C', 'D', 'E', 'G', 'A']);
    expect(buildScale('A', 'minor_pentatonic')).toEqual(['A', 'C', 'D', 'E', 'G']);
  });

  it('builds all 7 Greek modes', () => {
    expect(buildScale('D', 'dorian')).toEqual(['D', 'E', 'F', 'G', 'A', 'B', 'C']);
    expect(buildScale('E', 'phrygian')).toEqual(['E', 'F', 'G', 'A', 'B', 'C', 'D']);
    expect(buildScale('F', 'lydian')).toEqual(['F', 'G', 'A', 'B', 'C', 'D', 'E']);
    expect(buildScale('G', 'mixolydian')).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F']);
    expect(buildScale('A', 'aeolian')).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    expect(buildScale('B', 'locrian')).toEqual(['B', 'C', 'D', 'E', 'F', 'G', 'A']);
  });

  it('handles sharp and flat roots with correct spelling', () => {
    expect(buildScale('Eb', 'major')).toEqual(['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D']);
    expect(buildScale('F#', 'major')).toEqual(['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#']);
  });

  it('rejects unknown scales', () => {
    expect(() => buildScale('C', 'blues')).toThrow();
  });
});

describe('buildChordNotes', () => {
  it('builds C major chord notes', () => {
    expect(buildChordNotes('C', 'maj')).toEqual(['C', 'E', 'G']);
  });

  it('builds Am7 chord notes', () => {
    expect(buildChordNotes('A', 'min7')).toEqual(['A', 'C', 'E', 'G']);
  });

  it('resolves aliases', () => {
    expect(buildChordNotes('C', 'M')).toEqual(['C', 'E', 'G']);
    expect(buildChordNotes('C', 'm7')).toEqual(['C', 'Eb', 'G', 'Bb']);
    expect(buildChordNotes('C', '7')).toEqual(['C', 'E', 'G', 'Bb']);
  });

  it('builds extended chords', () => {
    expect(buildChordNotes('C', 'maj7')).toEqual(['C', 'E', 'G', 'B']);
    expect(buildChordNotes('C', 'dom9')).toEqual(['C', 'E', 'G', 'Bb', 'D']);
  });

  it('rejects invalid types', () => {
    expect(() => buildChordNotes('C', 'nope')).toThrow();
  });
});

describe('harmonizeScale', () => {
  it('harmonizes C major into the classic triads', () => {
    const result = harmonizeScale('C', 'major', false);
    const types = result.map((m) => m[0]?.chordType);
    expect(types).toEqual(['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim']);
  });

  it('harmonizes C major with sevenths', () => {
    const result = harmonizeScale('C', 'major');
    expect(result[0][0].chordType).toBe('maj');
    expect(result[0].map((c) => c.chordType)).toContain('maj7');
    // Dominant on the 5th degree.
    expect(result[4].map((c) => c.chordType)).toContain('dom7');
    // Half-diminished on the 7th degree.
    expect(result[6].map((c) => c.chordType)).toContain('m7dim5');
  });

  it('harmonizes A natural minor', () => {
    const result = harmonizeScale('A', 'natural_minor', false);
    const types = result.map((m) => m[0]?.chordType);
    expect(types).toEqual(['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj']);
  });

  it('returns empty arrays for pentatonic degrees without diatonic chords', () => {
    const result = harmonizeScale('C', 'major_pentatonic', false);
    expect(result.length).toBe(5);
    // C major pentatonic contains C-E-G, so degree 1 has at least "maj".
    expect(result[0][0].chordType).toBe('maj');
    // D has no full triad from C-D-E-G-A.
    expect(result[1]).toEqual([]);
  });

  it('sets degree numbers and display names', () => {
    const result = harmonizeScale('C', 'major', false);
    expect(result[0][0].degree).toBe(1);
    expect(result[0][0].displayName).toBe('C Major');
    expect(result[6][0].displayName).toBe('B Diminished');
  });
});
