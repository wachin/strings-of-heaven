import {
  fretGridLayout,
  absoluteFret,
  stringMarkers,
  barreSpans,
} from '../diagrams/fretboard';
import { pianoKeys, degreeForPitchClass } from '../diagrams/piano';
import { pitchClassOf } from '../engine/music_theory';
import type { ChordPosition } from '../types';

describe('fretGridLayout', () => {
  it('computes geometry for 6 strings', () => {
    const layout = fretGridLayout({ strings: 6 });
    expect(layout.strings).toBe(6);
    expect(layout.width).toBeGreaterThan(layout.stringX(5));
  });

  it('positions dots between fret lines', () => {
    const layout = fretGridLayout({ strings: 6, nutY: 32, fretSpacing: 28 });
    expect(layout.dotY(1)).toBeGreaterThan(layout.nutY);
    expect(layout.dotY(1)).toBeLessThan(layout.fretLineY(1));
  });
});

describe('absoluteFret', () => {
  it('returns the relative fret when baseFret is 1', () => {
    expect(absoluteFret(3, 1)).toBe(3);
  });

  it('offsets by baseFret - 1 for up-neck positions', () => {
    expect(absoluteFret(1, 3)).toBe(3);
    expect(absoluteFret(3, 3)).toBe(5);
  });
});

describe('stringMarkers', () => {
  it('detects open and muted strings', () => {
    const markers = stringMarkers([-1, 3, 2, 0, 1, 0]);
    expect(markers).toEqual([
      { stringIndex: 0, kind: 'muted' },
      { stringIndex: 3, kind: 'open' },
      { stringIndex: 5, kind: 'open' },
    ]);
  });
});

describe('barreSpans', () => {
  it('spans contiguous strings at a barre fret', () => {
    const spans = barreSpans([-1, 1, 3, 3, 3, 1], [1]);
    expect(spans).toEqual([{ fret: 1, fromString: 1, toString: 5 }]);
  });
});

describe('pianoKeys', () => {
  it('lays out 2 octaves (14 white + 10 black keys)', () => {
    const { keys } = pianoKeys(2);
    expect(keys.filter((k) => k.type === 'white')).toHaveLength(14);
    expect(keys.filter((k) => k.type === 'black')).toHaveLength(10);
  });

  it('assigns correct pitch classes', () => {
    const { keys } = pianoKeys(1);
    const whites = keys.filter((k) => k.type === 'white').map((k) => k.pitchClass);
    expect(whites).toEqual([0, 2, 4, 5, 7, 9, 11]);
    const blacks = keys.filter((k) => k.type === 'black').map((k) => k.pitchClass);
    expect(blacks).toEqual([1, 3, 6, 8, 10]);
  });
});

describe('degreeForPitchClass', () => {
  it('maps pitch class to the scale degree label', () => {
    const position: ChordPosition = {
      frets: ['C', 'E', 'G', 'Bb'],
      fingers: ['1', '3', '5', 'b7'],
    };
    expect(degreeForPitchClass(position, pitchClassOf('Bb'))).toBe('b7');
    expect(degreeForPitchClass(position, pitchClassOf('E'))).toBe('3');
  });
});