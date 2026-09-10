import { useMemo, useState } from 'react';
import { getChordsForKey } from '@shared/engine/chord_engine';
import {
  selectChordKey,
  selectDataEpoch,
  selectInstrument,
  selectSelectedKey,
  selectSelectedSuffix,
  selectSuffix,
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
  const selectedSuffix = useAppSelector(selectSelectedSuffix);
  const instrument = useAppSelector(selectInstrument);
  const dataEpoch = useAppSelector(selectDataEpoch);
  const [query, setQuery] = useState('');

  const chords = useMemo(
    () => getChordsForKey(selectedKey, instrument),
    [selectedKey, instrument, dataEpoch],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chords;
    return chords.filter((c) => c.displayName.toLowerCase().includes(q) || c.suffix.includes(q));
  }, [chords, query]);

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Chord library</h1>

      <div className="space-y-3">
        <NoteSelector selected={selectedKey} onSelect={(key) => dispatch(selectChordKey(key))} />
        <ChordTypeSelector
          suffixes={chords.map((c) => c.suffix)}
          selected={selectedSuffix}
          onSelect={(suffix) => dispatch(selectSuffix(suffix))}
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search chords…"
          aria-label="Search chords"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {filtered.length} chords for {selectedKey} on {instrument}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((chord) => (
          <ChordCard key={chord.suffix} chordKey={chord.key} suffix={chord.suffix} />
        ))}
      </div>
    </section>
  );
}