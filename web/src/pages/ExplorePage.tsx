import { useMemo, useState } from 'react';
import { chordShorthand, getChordsForKey } from '@shared/engine/chord_engine';
import { filterChordsByQuery } from '@shared/engine/chord_search';
import {
  selectChordKey,
  selectDataEpoch,
  selectInstrument,
  selectSelectedKey,
} from '@shared/store';
import { useAppDispatch, useAppSelector } from '../hooks';
import { usePageTitle } from '../hooks/usePageTitle';
import { ChordCard } from '../components/ChordCard';
import { ChordTypeSelector } from '../components/ChordTypeSelector';
import { NoteSelector } from '../components/NoteSelector';

export function ExplorePage() {
  usePageTitle('Explore chords — Strings Of Heaven');
  const dispatch = useAppDispatch();
  const selectedKey = useAppSelector(selectSelectedKey);
  const instrument = useAppSelector(selectInstrument);
  const dataEpoch = useAppSelector(selectDataEpoch);
  const [query, setQuery] = useState('');
  /**
   * Chord-type filter, local to this page. It starts as `null` so no chip is
   * highlighted on arrival and every chord is listed; clicking a chip narrows
   * the list, clicking it again clears the filter.
   */
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const chords = useMemo(
    () => getChordsForKey(selectedKey, instrument),
    [selectedKey, instrument, dataEpoch],
  );

  // A suffix can be missing for some root notes (e.g. "Caug9" exists but
  // "G#aug9" may not), so drop the filter when it no longer applies.
  const activeType =
    typeFilter && chords.some((chord) => chord.suffix === typeFilter) ? typeFilter : null;

  const filtered = useMemo(() => {
    const byType = activeType ? chords.filter((chord) => chord.suffix === activeType) : chords;
    return filterChordsByQuery(byType, query);
  }, [chords, activeType, query]);

  const hasFilters = activeType !== null || query.trim() !== '';

  function clearFilters() {
    setTypeFilter(null);
    setQuery('');
  }

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Chord library</h1>

      <div className="space-y-3">
        <NoteSelector selected={selectedKey} onSelect={(key) => dispatch(selectChordKey(key))} />
        <ChordTypeSelector
          suffixes={chords.map((chord) => chord.suffix)}
          selected={activeType ?? undefined}
          onSelect={(suffix) =>
            setTypeFilter((current) => (current === suffix ? null : suffix))
          }
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search chords… (Cm, Cdim7, C7/G, Csus4)"
          aria-label="Search chords"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {filtered.length} {filtered.length === 1 ? 'chord' : 'chords'} for {selectedKey} on{' '}
          {instrument}
          {activeType && (
            <>
              {' · '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {chordShorthand(selectedKey, activeType)}
              </span>{' '}
              only
            </>
          )}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">
            No chords match “{query.trim()}”.
          </p>
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
            Try a chord-site name such as <code>Cm</code>, <code>Cdim7</code>,{' '}
            <code>C7/G</code> or <code>Csus4</code> — or the long name, like{' '}
            <code>C Minor</code>.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((chord) => (
            <ChordCard key={chord.suffix} chordKey={chord.key} suffix={chord.suffix} />
          ))}
        </div>
      )}
    </section>
  );
}
