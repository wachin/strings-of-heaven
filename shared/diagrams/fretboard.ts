/**
 * Pure geometry for fret-grid chord diagrams (guitar / ukulele). No rendering
 * code, so the same math powers both the web SVG and React Native SVG renderers.
 */

export interface FretGridOptions {
  strings: number;
  fretsShown?: number;
  stringSpacing?: number;
  fretSpacing?: number;
  marginX?: number;
  markerY?: number;
  nutY?: number;
  labelY?: number;
}

export interface FretGridLayout {
  width: number;
  height: number;
  strings: number;
  fretsShown: number;
  stringSpacing: number;
  fretSpacing: number;
  markerY: number;
  nutY: number;
  labelY: number;
  stringX: (s: number) => number;
  /** Vertical position of a fret line, 1-based (relative to the nut). */
  fretLineY: (f: number) => number;
  /** Vertical center of a dot on relative fret f. */
  dotY: (f: number) => number;
}

export function fretGridLayout(options: FretGridOptions): FretGridLayout {
  const strings = options.strings;
  const fretsShown = options.fretsShown ?? 5;
  const stringSpacing = options.stringSpacing ?? 24;
  const fretSpacing = options.fretSpacing ?? 28;
  const marginX = options.marginX ?? 30;
  const markerY = options.markerY ?? 14;
  const nutY = options.nutY ?? 32;
  const labelY = options.labelY ?? nutY + fretsShown * fretSpacing + 14;

  const width = marginX * 2 + (strings - 1) * stringSpacing;
  const height = labelY + 8;
  const stringX = (s: number) => marginX + s * stringSpacing;
  const fretLineY = (f: number) => nutY + f * fretSpacing;
  const dotY = (f: number) => nutY + (f - 0.5) * fretSpacing;

  return {
    width,
    height,
    strings,
    fretsShown,
    stringSpacing,
    fretSpacing,
    markerY,
    nutY,
    labelY,
    stringX,
    fretLineY,
    dotY,
  };
}

/** Absolute fret number from a relative fret and base fret (baseFret + rel - 1). */
export function absoluteFret(relative: number, baseFret: number): number {
  return baseFret + relative - 1;
}

export interface StringMarker {
  stringIndex: number;
  kind: 'open' | 'muted';
}

/** Open (0) and muted (-1) string markers for a fret array. */
export function stringMarkers(frets: number[]): StringMarker[] {
  const markers: StringMarker[] = [];
  for (let s = 0; s < frets.length; s++) {
    if (frets[s] === 0) markers.push({ stringIndex: s, kind: 'open' });
    else if (frets[s] === -1) markers.push({ stringIndex: s, kind: 'muted' });
  }
  return markers;
}

export interface BarreSpan {
  fret: number;
  fromString: number;
  toString: number;
}

/** Barre spans: for each barre fret, the contiguous string range it covers. */
export function barreSpans(frets: number[], barres: number[] = []): BarreSpan[] {
  const spans: BarreSpan[] = [];
  for (const fret of barres) {
    const strings = frets
      .map((f, index) => ({ f, index }))
      .filter((s) => s.f === fret)
      .map((s) => s.index);
    if (strings.length > 0) {
      spans.push({ fret, fromString: strings[0], toString: strings[strings.length - 1] });
    }
  }
  return spans;
}