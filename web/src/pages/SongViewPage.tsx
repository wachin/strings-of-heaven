/**
 * SongViewPage — read-only view of a single saved song (/song/:id).
 *
 * Shows the song metadata, the performance notes written by the submitter, and
 * the body rendered with clickable chords (see `SongBody`). From here the user
 * can jump to the edit form, which updates this same entry in place.
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { SongEntry } from '@shared/types';
import { DIFFICULTY_LABELS, SONG_TYPE_LABELS } from '@shared/types/song';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSongStorage } from '../hooks/useSongStorage';
import { SongBody } from '../components/SongBody';

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      <span className="text-slate-400 dark:text-slate-500">{label}:</span> {value}
    </span>
  );
}

export function SongViewPage() {
  const { id } = useParams<{ id: string }>();
  const { getSong } = useSongStorage();
  const [song, setSong] = useState<SongEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageTitle(song ? `${song.title} — Strings Of Heaven` : 'Song — Strings Of Heaven');

  useEffect(() => {
    let active = true;

    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    getSong(id)
      .then((found) => {
        if (active) setSong(found);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load song');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, getSong]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16" role="status" aria-label="Loading song">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <section className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">Error loading song: {error}</p>
        </div>
        <Link to="/songs" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          ← Back to my songs
        </Link>
      </section>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!song) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">
            This song does not exist in this browser.
          </p>
          <Link
            to="/songs"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← Back to my songs
          </Link>
        </div>
      </section>
    );
  }

  // ── Song ───────────────────────────────────────────────────────────────────
  return (
    <section className="space-y-5">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link to="/songs" className="text-indigo-600 hover:underline dark:text-indigo-400">
          My songs
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <span>{song.title}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold">{song.title}</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">{song.artist}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to={`/submit?id=${encodeURIComponent(song.id)}`}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Edit
          </Link>
          <Link
            to="/songs"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            All songs
          </Link>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          {SONG_TYPE_LABELS[song.type]}
        </span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {DIFFICULTY_LABELS[song.difficulty]}
        </span>
        {song.key && <MetaChip label="Key" value={song.key} />}
        <MetaChip label="Capo" value={song.capo > 0 ? String(song.capo) : 'none'} />
        {song.bpm > 0 && <MetaChip label="Tempo" value={`${song.bpm} BPM`} />}
        <MetaChip label="Time" value={song.timeSignature} />
        {song.tuning && <MetaChip label="Tuning" value={song.tuning} />}
        <MetaChip label="Version" value={String(song.version)} />
      </div>

      {/* Performance notes */}
      {song.description.trim() && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notes</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
            {song.description}
          </p>
        </div>
      )}

      {/* Body */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <SongBody body={song.body} />
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Last edited {new Date(song.updatedAt).toLocaleString()}
      </p>
    </section>
  );
}

export default SongViewPage;
