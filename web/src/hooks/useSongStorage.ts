import { useState, useCallback } from 'react';
import { SongEntry } from '@shared/types';
import { config, storage } from '@shared/config';

/**
 * Custom hook for song storage management
 * 
 * MODE: Static (localStorage) by default
 * 
 * TO ENABLE API MODE (for server deployments):
 * 1. Set `useApiBackend: true` in shared/config.ts
 * 2. Set `apiBaseUrl` to your server endpoint
 * 3. Implement these API endpoints:
 *    - GET  /api/songs           → { songs: SongEntry[] }
 *    - POST /api/songs/upload    → { success: boolean, id: string }
 *    - GET  /api/songs/search?q= → { songs: SongEntry[] }
 *    - GET  /api/songs/:id       → { song: SongEntry }
 */

interface UseSongStorageReturn {
  songs: SongEntry[];
  loading: boolean;
  error: string | null;
  saveSong: (song: Omit<SongEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  loadSongs: () => Promise<void>;
  searchSongs: (query: string) => Promise<SongEntry[]>;
  getSong: (id: string) => Promise<SongEntry | null>;
  deleteSong: (id: string) => Promise<void>;
}

export function useSongStorage(): UseSongStorageReturn {
  const [songs, setSongs] = useState<SongEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate unique ID for new songs
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // localStorage implementation (static mode)
  const saveToLocalStorage = useCallback(async (song: Omit<SongEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const now = new Date().toISOString();
    const newSong: SongEntry = {
      ...song,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    const existing = localStorage.getItem(storage.keys.songs);
    const existingSongs: SongEntry[] = existing ? JSON.parse(existing) : [];
    
    // Check storage limits
    if (existingSongs.length >= storage.maxLocalSongs) {
      throw new Error(`Maximum ${storage.maxLocalSongs} songs allowed in localStorage`);
    }
    
    if (JSON.stringify(newSong).length > storage.maxSongSize) {
      throw new Error(`Song too large (max ${storage.maxSongSize} characters)`);
    }

    existingSongs.push(newSong);
    localStorage.setItem(storage.keys.songs, JSON.stringify(existingSongs));
    
    setSongs(existingSongs);
    return newSong.id;
  }, []);

  const loadFromLocalStorage = useCallback(async (): Promise<void> => {
    const stored = localStorage.getItem(storage.keys.songs);
    const parsedSongs: SongEntry[] = stored ? JSON.parse(stored) : [];
    setSongs(parsedSongs);
  }, []);

  const searchLocalStorage = useCallback(async (query: string): Promise<SongEntry[]> => {
    const stored = localStorage.getItem(storage.keys.songs);
    const allSongs: SongEntry[] = stored ? JSON.parse(stored) : [];
    
    if (!query.trim()) return allSongs;
    
    const lowercaseQuery = query.toLowerCase();
    return allSongs.filter(song => 
      song.title.toLowerCase().includes(lowercaseQuery) ||
      song.artist.toLowerCase().includes(lowercaseQuery) ||
      song.body.toLowerCase().includes(lowercaseQuery)
    );
  }, []);

  const getSongFromLocalStorage = useCallback(async (id: string): Promise<SongEntry | null> => {
    const stored = localStorage.getItem(storage.keys.songs);
    const allSongs: SongEntry[] = stored ? JSON.parse(stored) : [];
    return allSongs.find(song => song.id === id) || null;
  }, []);

  const deleteFromLocalStorage = useCallback(async (id: string): Promise<void> => {
    const stored = localStorage.getItem(storage.keys.songs);
    const allSongs: SongEntry[] = stored ? JSON.parse(stored) : [];
    const filtered = allSongs.filter(song => song.id !== id);
    
    localStorage.setItem(storage.keys.songs, JSON.stringify(filtered));
    setSongs(filtered);
  }, []);

  // API implementation (server mode)
  const saveToAPI = useCallback(async (song: Omit<SongEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const response = await fetch(`${config.apiBaseUrl}/songs/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(song),
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.id;
  }, []);

  const loadFromAPI = useCallback(async (): Promise<void> => {
    const response = await fetch(`${config.apiBaseUrl}/songs`);
    if (!response.ok) throw new Error(`Failed to load songs: ${response.statusText}`);
    
    const result = await response.json();
    setSongs(result.songs);
  }, []);

  const searchAPI = useCallback(async (query: string): Promise<SongEntry[]> => {
    const url = `${config.apiBaseUrl}/songs/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Search failed: ${response.statusText}`);
    
    const result = await response.json();
    return result.songs;
  }, []);

  const getSongFromAPI = useCallback(async (id: string): Promise<SongEntry | null> => {
    const response = await fetch(`${config.apiBaseUrl}/songs/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Failed to get song: ${response.statusText}`);
    
    const result = await response.json();
    return result.song;
  }, []);

  const deleteFromAPI = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`${config.apiBaseUrl}/songs/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Delete failed: ${response.statusText}`);
    
    // Refresh the songs list
    await loadFromAPI();
  }, [loadFromAPI]);

  // Main hook methods (switch between localStorage and API based on config)
  const saveSong = useCallback(async (song: Omit<SongEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      const id = config.useApiBackend 
        ? await saveToAPI(song)
        : await saveToLocalStorage(song);
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save song';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToAPI, saveToLocalStorage]);

  const loadSongs = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      if (config.useApiBackend) {
        await loadFromAPI();
      } else {
        await loadFromLocalStorage();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load songs';
      setError(errorMessage);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, [loadFromAPI, loadFromLocalStorage]);

  const searchSongs = useCallback(async (query: string): Promise<SongEntry[]> => {
    setLoading(true);
    setError(null);
    
    try {
      return config.useApiBackend 
        ? await searchAPI(query)
        : await searchLocalStorage(query);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [searchAPI, searchLocalStorage]);

  const getSong = useCallback(async (id: string): Promise<SongEntry | null> => {
    setLoading(true);
    setError(null);
    
    try {
      return config.useApiBackend 
        ? await getSongFromAPI(id)
        : await getSongFromLocalStorage(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get song';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getSongFromAPI, getSongFromLocalStorage]);

  const deleteSong = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      if (config.useApiBackend) {
        await deleteFromAPI(id);
      } else {
        await deleteFromLocalStorage(id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete song';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deleteFromAPI, deleteFromLocalStorage]);

  return {
    songs,
    loading,
    error,
    saveSong,
    loadSongs,
    searchSongs,
    getSong,
    deleteSong,
  };
}

export default useSongStorage;