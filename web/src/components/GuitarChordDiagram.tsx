import {
  absoluteFret,
  barreSpans,
  fretGridLayout,
  stringMarkers,
} from '@shared/diagrams/fretboard';
import type { ChordPosition } from '@shared/types';

const TUNINGS: Record<number, string[]> = {
  6: ['E', 'A', 'D', 'G', 'B', 'E'],
  4: ['G', 'C', 'E', 'A'],
};

interface GuitarChordDiagramProps {
  position: ChordPosition;
  label: string;
  strings?: number;
  instrumentName?: string;
}

export function GuitarChordDiagram({
  position,
  label,
  strings = 6,
  instrumentName = 'guitar',
}: GuitarChordDiagramProps) {
  const frets = position.frets as number[];
  const fingers = (position.fingers as number[]) ?? [];
  const baseFret = position.baseFret ?? 1;
  const layout = fretGridLayout({ strings });
  const fretText = frets.map((f) => (f < 0 ? 'x' : absoluteFret(f, baseFret))).join('');
  const dots = frets
    .map((f, s) => ({ f, s }))
    .filter((d) => d.f > 0)
    .map((d) => ({ ...d, rel: Math.min(d.f, layout.fretsShown) }));
  const barres = barreSpans(frets, position.barres ?? []);
  const markers = stringMarkers(frets);
  const tuning = TUNINGS[strings] ?? TUNINGS[6];
  const positionLabel =
    baseFret === 1 ? 'open position' : `position at fret ${baseFret}`;

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="img"
      aria-label={`${label} chord on ${instrumentName}, ${positionLabel}: frets ${fretText}`}
      className="mx-auto block h-auto max-w-full"
    >
      {Array.from({ length: layout.fretsShown }, (_, i) => i + 1).map((f) => (
        <line
          key={`f${f}`}
          x1={layout.stringX(0)}
          x2={layout.stringX(strings - 1)}
          y1={layout.fretLineY(f)}
          y2={layout.fretLineY(f)}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1.5}
        />
      ))}

      {Array.from({ length: strings }, (_, s) => s).map((s) => (
        <line
          key={`s${s}`}
          x1={layout.stringX(s)}
          x2={layout.stringX(s)}
          y1={layout.nutY}
          y2={layout.fretLineY(layout.fretsShown)}
          className="stroke-slate-400 dark:stroke-slate-500"
          strokeWidth={1.25}
        />
      ))}

      {baseFret === 1 ? (
        <rect
          x={layout.stringX(0) - 5}
          y={layout.nutY - 6}
          width={(strings - 1) * layout.stringSpacing + 10}
          height={6}
          rx={1.5}
          className="fill-slate-800 dark:fill-slate-200"
        />
      ) : (
        <text
          x={layout.stringX(0) - 18}
          y={(layout.nutY + layout.fretLineY(1)) / 2 + 4}
          fontSize={12}
          textAnchor="middle"
          className="fill-slate-500 dark:fill-slate-400"
        >
          {baseFret}fr
        </text>
      )}

      {markers.map((m) =>
        m.kind === 'open' ? (
          <circle
            key={`m${m.stringIndex}`}
            cx={layout.stringX(m.stringIndex)}
            cy={layout.markerY}
            r={5}
            fill="none"
            strokeWidth={2}
            className="stroke-slate-800 dark:stroke-slate-200"
          />
        ) : (
          <g
            key={`m${m.stringIndex}`}
            className="stroke-slate-800 dark:stroke-slate-200"
            strokeWidth={2}
          >
            <line
              x1={layout.stringX(m.stringIndex) - 5}
              y1={layout.markerY - 5}
              x2={layout.stringX(m.stringIndex) + 5}
              y2={layout.markerY + 5}
            />
            <line
              x1={layout.stringX(m.stringIndex) - 5}
              y1={layout.markerY + 5}
              x2={layout.stringX(m.stringIndex) + 5}
              y2={layout.markerY - 5}
            />
          </g>
        ),
      )}

      {barres.map((b, i) => (
        <rect
          key={`b${i}`}
          x={layout.stringX(b.fromString)}
          y={layout.dotY(b.fret) - 8}
          width={layout.stringX(b.toString) - layout.stringX(b.fromString)}
          height={16}
          rx={8}
          className="fill-slate-800/30 dark:fill-slate-200/30"
        />
      ))}

      {dots.map((d) => (
        <g key={`d${d.s}`}>
          <circle
            cx={layout.stringX(d.s)}
            cy={layout.dotY(d.rel)}
            r={9}
            className="fill-indigo-600 dark:fill-indigo-400"
          />
          {fingers[d.s] > 0 && (
            <text
              x={layout.stringX(d.s)}
              y={layout.dotY(d.rel)}
              fontSize={10}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-white dark:fill-slate-950 font-medium"
            >
              {fingers[d.s]}
            </text>
          )}
        </g>
      ))}

      {tuning.map((name, s) => (
        <text
          key={`t${s}`}
          x={layout.stringX(s)}
          y={layout.labelY}
          fontSize={10}
          textAnchor="middle"
          className="fill-slate-400 dark:fill-slate-500"
        >
          {name}
        </text>
      ))}
    </svg>
  );
}