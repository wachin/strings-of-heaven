/**
 * useSongStorage — persist and retrieve SongEntry objects in localStorage.
 *
 * This is the storage layer for the static / GitHub Pages deployment.
 * All data lives in the browser — no server required.
 *
 * ── For fork maintainers who want a real backend ─────────────────────────────
 * Replace the three functions below (loadSongs, saveSong, deleteSong) with
 * fetch() calls to your own REST API. The hook's public interface stays the
 * same, so no changes are needed in the components.
 *
 * Example swap (REST API mode):
 *
 *   // Instead of:
 *   localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
 *
 *   // Use:
 *   await fetch('/api/songs', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(entry),
 *   });
 *
 * See README.md → "Deployment → Self-hosted fork" for full instructions.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useCallback, useEffect, useState } from 'react';
import type { SongEntry } from '@shared/types/song';

const STORAGE_KEY = 'soh_songs_v1';

// ── Low-level storage helpers (swap these for API calls in a fork) ────────────

function loadSongs(): SongEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as SongEntry[];
  } catch {
    return [];
  }
}

function persistSongs(songs: SongEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}

// ── Public hook ───────────────────────────────────────────────────────────────

export interface UseSongStorageReturn {
  /** All songs currently saved, sorted by updatedAt descending. */
  songs: SongEntry[];
  /**
   * Save a song. If entry.id already exists it is updated; otherwise it is
   * inserted. Returns the saved entry (with id and timestamps filled in).
   */
  saveSong: (entry: SongEntry) => SongEntry;
  /** Remove a song by id. No-op if the id is not found. */
  deleteSong: (id: string) => void;
  /** Find a single song by id. */
  getSongById: (id: string) => SongEntry | undefined;
}

export function useSongStorage(): UseSongStorageReturn {
  const [songs, setSongs] = useState<SongEntry[]>(() =>
    [...loadSongs()].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    ),
  );

  // Keep state in sync with localStorage changes from other tabs
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        setSongs(
          [...loadSongs()].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        );
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const saveSong = useCallback((entry: SongEntry): SongEntry => {
    const now = new Date().toISOString();
    const existing = loadSongs();

    let saved: SongEntry;
    if (entry.id && existing.some((s) => s.id === entry.id)) {
      // Update
      saved = { ...entry, updatedAt: now };
      const updated = existing.map((s) => (s.id === saved.id ? saved : s));
      persistSongs(updated);
      setSongs([...updated].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ));
    } else {
      // Insert — generate a simple unique id
      saved = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [saved, ...existing];
      persistSongs(updated);
      setSongs([...updated].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ));
    }
    return saved;
  }, []);

  const deleteSong = useCallback((id: string): void => {
    const updated = loadSongs().filter((s) => s.id !== id);
    persistSongs(updated);
    setSongs([...updated].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    ));
  }, []);

  const getSongById = useCallback(
    (id: string) => songs.find((s) => s.id === id),
    [songs],
  );

  return { songs, saveSong, deleteSong, getSongById };
}
