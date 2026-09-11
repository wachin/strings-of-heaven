import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { storage } from '@shared/config';
import type { SongEntry } from '@shared/types';
import { useSongStorage, type SongDraft } from '../hooks/useSongStorage';

const draft: SongDraft = {
  title: 'Como el ciervo',
  artist: 'Marcos Witt',
  type: 'chords',
  capo: 0,
  tuning: 'Standard',
  key: 'G',
  bpm: 0,
  timeSignature: '4/4',
  difficulty: 'beginner',
  description: '',
  body: 'G\nLetra de la canción',
};

function storedSongs(): SongEntry[] {
  const raw = localStorage.getItem(storage.keys.songs);
  return raw ? (JSON.parse(raw) as SongEntry[]) : [];
}

async function saveOne(result: { current: ReturnType<typeof useSongStorage> }): Promise<string> {
  let id = '';
  await act(async () => {
    id = await result.current.saveSong(draft);
  });
  return id;
}

describe('useSongStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves a new song with version 1 and generated timestamps', async () => {
    const { result } = renderHook(() => useSongStorage());
    const id = await saveOne(result);

    const songs = storedSongs();
    expect(songs).toHaveLength(1);
    expect(songs[0].id).toBe(id);
    expect(songs[0].version).toBe(1);
    expect(songs[0].createdAt).toBeTruthy();
    expect(songs[0].createdAt).toBe(songs[0].updatedAt);
  });

  it('updates a song in place instead of creating a duplicate', async () => {
    const { result } = renderHook(() => useSongStorage());
    const id = await saveOne(result);
    const createdAt = storedSongs()[0].createdAt;

    await act(async () => {
      await result.current.updateSong(id, { ...draft, title: 'Renamed', bpm: 90 });
    });

    const songs = storedSongs();
    expect(songs).toHaveLength(1); // no duplicate row
    expect(songs[0].id).toBe(id); // same identity
    expect(songs[0].createdAt).toBe(createdAt); // creation time preserved
    expect(songs[0].title).toBe('Renamed');
    expect(songs[0].bpm).toBe(90);
    expect(songs[0].version).toBe(2); // correction bumps the version
  });

  it('rejects updating a song that does not exist', async () => {
    const { result } = renderHook(() => useSongStorage());
    await act(async () => {
      await expect(result.current.updateSong('missing-id', draft)).rejects.toThrow(
        'Song not found',
      );
    });
    expect(storedSongs()).toHaveLength(0);
  });

  it('deletes a song', async () => {
    const { result } = renderHook(() => useSongStorage());
    const id = await saveOne(result);

    await act(async () => {
      await result.current.deleteSong(id);
    });

    expect(storedSongs()).toHaveLength(0);
  });
});
