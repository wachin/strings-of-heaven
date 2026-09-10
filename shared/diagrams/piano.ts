import { pitchClassOf } from '../engine/music_theory';
import type { ChordPosition } from '../types';

export interface PianoKey {
  index: number;
  type: 'white' | 'black';
  x: number;
  width: number;
  height: number;
  pitchClass: number;
  octave: number;
}

export interface PianoLayout {
  width: number;
  height: number;
  keys: PianoKey[];
}

const WHITE_PITCHES = [0, 2, 4, 5, 7, 9, 11];
const BLACK_AFTER_WHITE: Record<number, number> = { 0: 1, 1: 3, 3: 6, 4: 8, 5: 10 };

export function pianoKeys(
  octaves = 2,
  options: { whiteWidth?: number; whiteHeight?: number } = {},
): PianoLayout {
  const whiteWidth = options.whiteWidth ?? 28;
  const whiteHeight = options.whiteHeight ?? 120;
  const blackWidth = whiteWidth * 0.6;
  const blackHeight = whiteHeight * 0.62;

  const keys: PianoKey[] = [];
  let index = 0;
  for (let octave = 0; octave < octaves; octave++) {
    const xOffset = octave * 7 * whiteWidth;
    for (let w = 0; w < 7; w++) {
      keys.push({
        index: index++,
        type: 'white',
        x: xOffset + w * whiteWidth,
        width: whiteWidth,
        height: whiteHeight,
        pitchClass: WHITE_PITCHES[w],
        octave,
      });
    }
    for (const w of [0, 1, 3, 4, 5]) {
      const x = xOffset + (w + 1) * whiteWidth - blackWidth / 2;
      keys.push({
        index: index++,
        type: 'black',
        x,
        width: blackWidth,
        height: blackHeight,
        pitchClass: BLACK_AFTER_WHITE[w],
        octave,
      });
    }
  }

  return { width: octaves * 7 * whiteWidth, height: whiteHeight, keys };
}

/** Degree label ("1", "3", "b7", ...) for a pressed note's pitch class. */
export function degreeForPitchClass(position: ChordPosition, pitchClass: number): string | undefined {
  const frets = position.frets as string[];
  const fingers = position.fingers as string[];
  for (let i = 0; i < frets.length; i++) {
    if (pitchClassOf(frets[i]) === pitchClass) return fingers[i];
  }
  return undefined;
}