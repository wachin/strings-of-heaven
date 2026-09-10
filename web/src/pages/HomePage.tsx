import { Link } from 'react-router-dom';
import { chordDisplayName } from '@shared/engine/chord_engine';
import {
  selectAllSuffixes,
  selectChordKey,
  selectSelectedChord,
  selectSelectedKey,
  selectSelectedSuffix,
  selectSuffix,
} from '@shared/store';
import { useAppDispatch, useAppSelector } from '../hooks';
import { usePageTitle } from '../hooks/usePageTitle';
import { ChordDiagram } from '../components/ChordDiagram';
import { ChordTypeSelector } from '../components/ChordTypeSelector';
import { InstrumentToggle } from '../components/InstrumentToggle';
import { NoteSelector } from '../components/NoteSelector';

export function HomePage() {
  usePageTitle('Strings Of Heaven — Guitar, Piano & Ukulele Chords');
  const dispatch = useAppDispatch();
  const selectedKey = useAppSelector(selectSelectedKey);
  const selectedSuffix = useAppSelector(selectSelectedSuffix);
  const suffixes = useAppSelector(selectAllSuffixes);
  const chord = useAppSelector(selectSelectedChord);

  return (
    <section className="space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Every chord. Three instruments.</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-300">
          Look up chord diagrams for guitar, piano, and ukulele, explore scales, and learn the
          theory behind them — all offline, all open source.
        </p>
      </div>

      <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <InstrumentToggle />
        <NoteSelector selected={selectedKey} onSelect={(key) => dispatch(selectChordKey(key))} />
        <ChordTypeSelector
          suffixes={suffixes}
          selected={selectedSuffix}
          onSelect={(suffix) => dispatch(selectSuffix(suffix))}
        />
        {chord && <ChordDiagram chordKey={chord.key} suffix={chord.suffix} />}
        {chord && (
          <div className="text-center">
            <Link
              to={`/chord/${encodeURIComponent(chord.key)}/${encodeURIComponent(chord.suffix)}`}
              className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              All positions of {chordDisplayName(chord.key, chord.suffix)}
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { to: '/explore', title: 'Explore chords', text: 'Browse the full chord library.' },
          { to: '/scales', title: 'Scales', text: 'See any scale on the fretboard.' },
          { to: '/theory', title: 'Theory', text: 'Intervals, chords, and modes.' },
        ].map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-400"
          >
            <h2 className="font-semibold">{card.title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{card.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}