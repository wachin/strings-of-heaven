import { useMemo } from 'react';
import { buildScale, pitchClassOf } from '@shared/engine/music_theory';

const STRING_MIDI = [40, 45, 50, 55, 59, 64];
const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'E'];
const FRETS = 12;

interface ScaleViewerProps {
  root: string;
  scaleName: string;
}

export function ScaleViewer({ root, scaleName }: ScaleViewerProps) {
  const scalePcs = useMemo(() => {
    const notes = buildScale(root, scaleName);
    return new Set(notes.map((n) => pitchClassOf(n)));
  }, [root, scaleName]);
  const rootPc = pitchClassOf(root);

  const marginX = 44;
  const stringSpacing = 26;
  const fretSpacing = 56;
  const width = marginX * 2 + FRETS * fretSpacing;
  const height = stringSpacing * 5 + 56;
  const nutX = marginX;
  const rowY = (row: number) => 16 + row * stringSpacing;

  const ariaLabel = `${root} ${scaleName.replace(/_/g, ' ')} scale on guitar fretboard`;

  const dots: { cx: number; cy: number; isRoot: boolean }[] = [];
  for (let s = 0; s < 6; s++) {
    for (let f = 0; f <= FRETS; f++) {
      const midi = STRING_MIDI[s] + f;
      const pc = midi % 12;
      if (!scalePcs.has(pc)) continue;
      const row = 5 - s;
      dots.push({
        cx: f === 0 ? nutX + 10 : nutX + f * fretSpacing + fretSpacing / 2,
        cy: rowY(row),
        isRoot: pc === rootPc,
      });
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className="mx-auto block h-auto w-full max-w-3xl"
    >
      {Array.from({ length: FRETS + 1 }, (_, f) => f).map((f) => (
        <line
          key={`fr${f}`}
          x1={nutX + f * fretSpacing}
          x2={nutX + f * fretSpacing}
          y1={rowY(0) - 8}
          y2={rowY(5) + 8}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={f === 0 ? 5 : 1.5}
        />
      ))}

      {STRING_NAMES.map((_, s) => {
        const row = 5 - s;
        return (
          <line
            key={`st${s}`}
            x1={nutX}
            x2={nutX + FRETS * fretSpacing}
            y1={rowY(row)}
            y2={rowY(row)}
            className="stroke-slate-400 dark:stroke-slate-500"
            strokeWidth={1 + (5 - s) * 0.25}
          />
        );
      })}

      {STRING_NAMES.map((name, s) => {
        const row = 5 - s;
        return (
          <text
            key={`sn${s}`}
            x={nutX - 24}
            y={rowY(row) + 4}
            fontSize={12}
            textAnchor="middle"
            className="fill-slate-500 dark:fill-slate-400"
          >
            {name}
          </text>
        );
      })}

      {Array.from({ length: FRETS }, (_, f) => f + 1).map((f) => (
        <text
          key={`fn${f}`}
          x={nutX + f * fretSpacing + fretSpacing / 2}
          y={height - 10}
          fontSize={11}
          textAnchor="middle"
          className="fill-slate-400 dark:fill-slate-500"
        >
          {f}
        </text>
      ))}

      {dots.map((d, i) =>
        d.isRoot ? (
          <g key={`dot${i}`}>
            <circle cx={d.cx} cy={d.cy} r={11} fill="none" strokeWidth={2} className="stroke-rose-500 dark:stroke-rose-400" />
            <circle cx={d.cx} cy={d.cy} r={7} className="fill-rose-500 dark:fill-rose-400" />
          </g>
        ) : (
          <circle key={`dot${i}`} cx={d.cx} cy={d.cy} r={7} className="fill-indigo-600 dark:fill-indigo-400" />
        ),
      )}
    </svg>
  );
}