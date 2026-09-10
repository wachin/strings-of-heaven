import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { chordDisplayName, canonicalTypeForSuffix } from '@shared/engine/chord_engine';
import { buildChordNotes } from '@shared/engine/music_theory';
import { nextPosition, openChord, prevPosition, setPositionIndex } from '@shared/store';
import {
  selectCurrentPositionIndex,
  selectInstrument,
  selectSelectedChord,
  selectSelectedKey,
  selectSelectedSuffix,
} from '@shared/store';
import { useAppDispatch, useAppSelector } from '../hooks';
import { usePageTitle } from '../hooks/usePageTitle';
import { ChordDiagram } from '../components/ChordDiagram';
import { InstrumentToggle } from '../components/InstrumentToggle';

function midiToName(midi: number): string {
  const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return NAMES[((midi % 12) + 12) % 12];
}

export function ChordPage() {
  const params = useParams();
  const urlKey = decodeURIComponent(params.key ?? 'C');
  const urlSuffix = decodeURIComponent(params.suffix ?? 'major');
  const dispatch = useAppDispatch();
  const selectedKey = useAppSelector(selectSelectedKey);
  const selectedSuffix = useAppSelector(selectSelectedSuffix);
  const instrument = useAppSelector(selectInstrument);
  const chord = useAppSelector(selectSelectedChord);
  const positionIndex = useAppSelector(selectCurrentPositionIndex);

  useEffect(() => {
    if (urlKey !== selectedKey || urlSuffix !== selectedSuffix) {
      dispatch(openChord(urlKey, urlSuffix));
    }
  }, [urlKey, urlSuffix, selectedKey, selectedSuffix, dispatch]);

  const title = chordDisplayName(selectedKey, selectedSuffix);
  usePageTitle(`${title} — Strings Of Heaven`);

  const positions = chord?.positions ?? [];
  const notes = useMemo(() => {
    if (!chord || positions.length === 0) return [];
    const canonical = canonicalTypeForSuffix(chord.suffix);
    if (canonical) {
      try {
        return buildChordNotes(chord.key, canonical);
      } catch {
        return [];
      }
    }
    const position = positions[0];
    if (typeof position.frets[0] === 'string') return position.frets as string[];
    return (position.midi ?? []).map(midiToName);
  }, [chord, positions]);

  return (
    <section className="space-y-5">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link to="/explore" className="text-indigo-600 hover:underline dark:text-indigo-400">
          Chord library
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <span>{title}</span>
      </nav>

      <div className="text-center">
        <h1 className="text-3xl font-bold">{title}</h1>
        <InstrumentToggle className="mt-3" />
      </div>

      {positions.length === 0 ? (
        <p className="py-8 text-center text-slate-500 dark:text-slate-400">
          {title} is not available for {instrument}. Try switching instrument.
        </p>
      ) : (
        <>
          {notes.length > 0 && (
            <p className="text-center text-sm text-slate-600 dark:text-slate-300">
              Notes:{' '}
              {notes.map((note, i) => (
                <span key={`${note}-${i}`}>
                  {i > 0 && ', '}
                  <span className="font-semibold">{note}</span>
                </span>
              ))}
            </p>
          )}

          {positions.length > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => dispatch(prevPosition())}
                aria-label="Previous voicing"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Prev
              </button>
              <span aria-live="polite" className="text-sm font-medium tabular-nums">
                {positionIndex + 1} / {positions.length}
              </span>
              <button
                type="button"
                onClick={() => dispatch(nextPosition())}
                aria-label="Next voicing"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          )}

          <div className="mx-auto max-w-xs">
            <ChordDiagram chordKey={selectedKey} suffix={selectedSuffix} positionIndex={positionIndex} />
          </div>

          {positions.length > 1 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {positions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => dispatch(setPositionIndex(i))}
                  aria-label={`Show voicing ${i + 1}`}
                  className={`rounded-xl border p-2 ${
                    i === positionIndex
                      ? 'border-indigo-500 dark:border-indigo-400'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <ChordDiagram chordKey={selectedKey} suffix={selectedSuffix} positionIndex={i} />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}