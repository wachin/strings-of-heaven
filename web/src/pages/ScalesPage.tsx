import { Link } from 'react-router-dom';
import { CANONICAL_TO_SUFFIX, SCALE_NAMES } from '@shared/constants/theory';
import { chordExists } from '@shared/engine/chord_engine';
import { buildScale, harmonizeScale, type HarmonizedChord } from '@shared/engine/music_theory';
import { selectInstrument, selectScaleName, selectScaleRoot } from '@shared/store';
import { setRoot, setScale } from '@shared/store';
import { useAppDispatch, useAppSelector } from '../hooks';
import { usePageTitle } from '../hooks/usePageTitle';
import { NoteSelector } from '../components/NoteSelector';
import { ScaleViewer } from '../components/ScaleViewer';

const TRIAD_TYPES = new Set(['maj', 'min', 'dim', 'aug']);
const SEVENTH_TYPES = new Set(['dom7', 'min7', 'maj7', 'dim7', 'm7dim5']);

export function ScalesPage() {
  usePageTitle('Scales — Strings Of Heaven');
  const dispatch = useAppDispatch();
  const root = useAppSelector(selectScaleRoot);
  const scaleName = useAppSelector(selectScaleName);
  const instrument = useAppSelector(selectInstrument);

  const notes = buildScale(root, scaleName);
  const harmonized = harmonizeScale(root, scaleName);

  const firstMatch = (matches: HarmonizedChord[], types: Set<string>) =>
    matches.find((chord) => types.has(chord.chordType));

  const chordLink = (chord: HarmonizedChord) => {
    const suffix = CANONICAL_TO_SUFFIX[chord.chordType];
    if (!suffix || !chordExists(chord.root, suffix, instrument)) {
      return <span className="text-slate-400 dark:text-slate-500">{chord.displayName}</span>;
    }
    return (
      <Link
        to={`/chord/${encodeURIComponent(chord.root)}/${encodeURIComponent(suffix)}`}
        className="text-indigo-600 hover:underline dark:text-indigo-400"
      >
        {chord.displayName}
      </Link>
    );
  };

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Scales</h1>

      <NoteSelector
        selected={root}
        onSelect={(key) => dispatch(setRoot(key))}
        title="Scale root"
      />

      <div role="group" aria-label="Scale" className="flex flex-wrap justify-center gap-1">
        {Object.entries(SCALE_NAMES).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === scaleName}
            onClick={() => dispatch(setScale(id))}
            className={
              id === scaleName
                ? 'rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white dark:bg-indigo-500'
                : 'rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Notes of {root} {SCALE_NAMES[scaleName]}
        </h2>
        <p className="mt-2 flex flex-wrap gap-2">
          {notes.map((note, i) => (
            <span
              key={`${note}-${i}`}
              className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-sm font-semibold dark:bg-slate-800"
            >
              {note}
            </span>
          ))}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Harmonized triads
          </h2>
          <ol className="mt-2 space-y-1 text-sm">
            {harmonized.map((matches, i) => {
              const chord = firstMatch(matches, TRIAD_TYPES);
              return (
                <li key={i}>
                  <span className="mr-2 font-mono text-slate-400">{i + 1}.</span>
                  {chord ? chordLink(chord) : <span className="text-slate-400">—</span>}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Seventh chords
          </h2>
          <ol className="mt-2 space-y-1 text-sm">
            {harmonized.map((matches, i) => {
              const chord = firstMatch(matches, SEVENTH_TYPES);
              return (
                <li key={i}>
                  <span className="mr-2 font-mono text-slate-400">{i + 1}.</span>
                  {chord ? chordLink(chord) : <span className="text-slate-400">—</span>}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {root} {SCALE_NAMES[scaleName]} on the guitar fretboard
        </h2>
        <ScaleViewer root={root} scaleName={scaleName} />
      </div>
    </section>
  );
}