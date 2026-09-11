/**
 * SongsPage — lists all songs saved in localStorage.
 *
 * Shows title, artist, type, difficulty, capo, BPM, and last-edited date.
 * The title links to the song view (/song/:id); each row also has Edit/Delete.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DIFFICULTY_LABELS, SONG_TYPE_LABELS } from '@shared/types/song';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSongStorage } from '../hooks/useSongStorage';

export function SongsPage() {
  usePageTitle('My songs — Strings Of Heaven');
  const navigate = useNavigate();
  const { songs, deleteSong, loadSongs, loading, error } = useSongStorage();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Load songs when component mounts
  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  const filtered = songs.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q)
    );
  });

  function handleDelete(id: string) {
    deleteSong(id);
    setConfirmDelete(null);
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My songs</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {loading 
              ? 'Loading songs...' 
              : `${songs.length} ${songs.length === 1 ? 'song' : 'songs'} saved locally in this browser.`
            }
          </p>
        </div>
        <Link
          to="/submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add song
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error loading songs: {error}
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Search */}
      {!loading && songs.length > 0 && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or artist…"
          aria-label="Search songs"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
        />
      )}

      {/* Empty state */}
      {!loading && !error && songs.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">No songs yet.</p>
          <Link
            to="/submit"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Add your first song →
          </Link>
        </div>
      )}

      {/* Song list */}
      {!loading && !error && filtered.length > 0 && (
        <ul className="space-y-3">
          {filtered.map((song) => (
            <li
              key={song.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                {/* Left: song info */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/song/${encodeURIComponent(song.id)}`}
                      className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {song.title}
                    </Link>
                    <span className="text-slate-500 dark:text-slate-400">—</span>
                    <span className="text-slate-600 dark:text-slate-300">{song.artist}</span>
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="rounded bg-indigo-100 px-1.5 py-0.5 font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {SONG_TYPE_LABELS[song.type]}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {DIFFICULTY_LABELS[song.difficulty]}
                    </span>
                    {song.capo > 0 && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        Capo {song.capo}
                      </span>
                    )}
                    {song.bpm > 0 && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {song.bpm} BPM
                      </span>
                    )}
                    {song.key && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Key: {song.key}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Last edited {new Date(song.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Right: actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/submit?id=${song.id}`)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    Edit
                  </button>

                  {confirmDelete === song.id ? (
                    <>
                      <span className="text-xs text-red-600 dark:text-red-400">Delete?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(song.id)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(song.id)}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && filtered.length === 0 && songs.length > 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No songs match your search.
        </p>
      )}
    </section>
  );
}
