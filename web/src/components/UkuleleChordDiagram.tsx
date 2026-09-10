import { GuitarChordDiagram } from './GuitarChordDiagram';
import type { ChordPosition } from '@shared/types';

interface UkuleleChordDiagramProps {
  position: ChordPosition;
  label: string;
}

export function UkuleleChordDiagram({ position, label }: UkuleleChordDiagramProps) {
  return (
    <GuitarChordDiagram
      position={position}
      label={label}
      strings={4}
      instrumentName="ukulele"
    />
  );
}