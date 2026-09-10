import { Link } from 'react-router-dom';
import { chordDisplayName } from '@shared/engine/chord_engine';
import { ChordDiagram } from './ChordDiagram';

interface ChordCardProps {
  chordKey: string;
  suffix: string;
}

export function ChordCard({ chordKey, suffix }: ChordCardProps) {
  return (
    <Link
      to={`/chord/${encodeURIComponent(chordKey)}/${encodeURIComponent(suffix)}`}
      className="block rounded-xl border border-slate-200 bg-white p-3 transition hover:border-indigo-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-400"
    >
      <ChordDiagram chordKey={chordKey} suffix={suffix} />
      <p className="mt-2 text-center text-sm font-semibold">{chordDisplayName(chordKey, suffix)}</p>
    </Link>
  );
}