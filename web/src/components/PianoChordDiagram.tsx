import { degreeForPitchClass, pianoKeys } from '@shared/diagrams/piano';
import { pitchClassOf } from '@shared/engine/music_theory';
import type { ChordPosition } from '@shared/types';

interface PianoChordDiagramProps {
  position: ChordPosition;
  label: string;
}

export function PianoChordDiagram({ position, label }: PianoChordDiagramProps) {
  const noteNames = position.frets as string[];
  const layout = pianoKeys(2);
  const active = new Map<number, string>();
  for (const name of noteNames) {
    active.set(pitchClassOf(name), degreeForPitchClass(position, pitchClassOf(name)) ?? '');
  }
  const ariaLabel = `${label} chord on piano: press ${noteNames.join(', ')}`;

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height + 4}`}
      role="img"
      aria-label={ariaLabel}
      className="mx-auto block h-auto max-w-full"
    >
      {layout.keys
        .filter((k) => k.type === 'white')
        .map((k) => {
          const isActive = active.has(k.pitchClass);
          return (
            <rect
              key={`w${k.index}`}
              x={k.x}
              y={0}
              width={k.width - 1}
              height={k.height}
              rx={2}
              className={
                isActive
                  ? 'fill-indigo-500 stroke-slate-400 dark:stroke-slate-600'
                  : 'fill-white stroke-slate-300 dark:stroke-slate-600'
              }
              strokeWidth={1}
            />
          );
        })}

      {layout.keys
        .filter((k) => k.type === 'white' && active.has(k.pitchClass))
        .map((k) => (
          <text
            key={`wl${k.index}`}
            x={k.x + (k.width - 1) / 2}
            y={k.height - 8}
            fontSize={12}
            textAnchor="middle"
            className="fill-white font-semibold"
          >
            {active.get(k.pitchClass)}
          </text>
        ))}

      {layout.keys
        .filter((k) => k.type === 'black')
        .map((k) => {
          const isActive = active.has(k.pitchClass);
          return (
            <rect
              key={`b${k.index}`}
              x={k.x}
              y={0}
              width={k.width}
              height={k.height}
              rx={2}
              className={
                isActive
                  ? 'fill-indigo-400 stroke-slate-950'
                  : 'fill-slate-900 stroke-slate-950 dark:fill-slate-700'
              }
              strokeWidth={1}
            />
          );
        })}

      {layout.keys
        .filter((k) => k.type === 'black' && active.has(k.pitchClass))
        .map((k) => (
          <text
            key={`bl${k.index}`}
            x={k.x + k.width / 2}
            y={k.height - 8}
            fontSize={10}
            textAnchor="middle"
            className="fill-slate-950 font-semibold"
          >
            {active.get(k.pitchClass)}
          </text>
        ))}
    </svg>
  );
}