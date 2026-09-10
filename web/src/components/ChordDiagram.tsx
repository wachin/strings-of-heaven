import { useMemo } from 'react';
import { getChord } from '@shared/engine/chord_engine';
import { chordDisplayName } from '@shared/engine/chord_engine';
import { selectInstrument } from '@shared/store';
import type { ProcessedChord } from '@shared/types';
import { useAppSelector } from '../hooks';
import { GuitarChordDiagram } from './GuitarChordDiagram';
import { PianoChordDiagram } from './PianoChordDiagram';
import { UkuleleChordDiagram } from './UkuleleChordDiagram';

interface ChordDiagramProps {
  chordKey: string;
  suffix: string;
  positionIndex?: number;
}

/**
 * Smart wrapper (ROADMAP T2.3): reads ui.instrument from the Redux store,
 * loads the chord from that instrument's database, and renders the matching
 * diagram. Screens never render instrument-specific diagrams directly.
 */
export function ChordDiagram({ chordKey, suffix, positionIndex = 0 }: ChordDiagramProps) {
  const instrument = useAppSelector(selectInstrument);
  const chord: ProcessedChord | undefined = useMemo(
    () => getChord(chordKey, suffix, instrument),
    [chordKey, suffix, instrument],
  );

  if (!chord || chord.positions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        {chordDisplayName(chordKey, suffix)} is not available for {instrument}.
      </p>
    );
  }

  const safeIndex = Math.min(positionIndex, chord.positions.length - 1);
  const position = chord.positions[safeIndex];
  const label = chordDisplayName(chordKey, chord.suffix);

  if (instrument === 'piano') {
    return <PianoChordDiagram position={position} label={label} />;
  }
  if (instrument === 'ukulele') {
    return <UkuleleChordDiagram position={position} label={label} />;
  }
  return <GuitarChordDiagram position={position} label={label} />;
}