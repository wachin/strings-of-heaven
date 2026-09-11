import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createAppStore } from '@shared/store';
import { emptySongEntry } from '@shared/types';
import type { SongEntry } from '@shared/types';
import { storage } from '@shared/config';
import { SongViewPage } from '../pages/SongViewPage';

const SONG: SongEntry = {
  ...emptySongEntry(),
  id: 'song-1',
  title: 'Como el ciervo',
  artist: 'Marcos Witt',
  type: 'chords',
  capo: 2,
  key: 'G',
  bpm: 76,
  difficulty: 'intermediate',
  description: 'Play gently, capo on the 2nd fret.',
  body: '[Verse 1]\nG               Em\nComo el ciervo busca por las aguas,',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-02T00:00:00.000Z',
  version: 3,
};

function seed(songs: SongEntry[]) {
  localStorage.setItem(storage.keys.songs, JSON.stringify(songs));
}

function renderAt(path: string) {
  return render(
    <Provider store={createAppStore()}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/song/:id" element={<SongViewPage />} />
          <Route path="/songs" element={<p>songs list</p>} />
          <Route path="/submit" element={<p>submit form</p>} />
          <Route path="/chord/:key/:suffix" element={<p>chord diagram</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('SongViewPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the song metadata, notes and body', async () => {
    seed([SONG]);
    renderAt('/song/song-1');

    expect(
      await screen.findByRole('heading', { name: 'Como el ciervo' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Marcos Witt')).toBeInTheDocument();
    expect(screen.getByText('Play gently, capo on the 2nd fret.')).toBeInTheDocument();

    // Body is rendered with clickable chords.
    expect(screen.getByText('[Verse 1]')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Em' })).toHaveAttribute('href', '/chord/E/minor');

    // Metadata chips.
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('Chords')).toBeInTheDocument();
    const chips = Array.from(document.querySelectorAll('span')).map((s) => s.textContent);
    expect(chips).toContain('Key: G');
    expect(chips).toContain('Capo: 2');
    expect(chips).toContain('Tempo: 76 BPM');
    expect(chips).toContain('Time: 4/4');
    expect(chips).toContain('Version: 3');
  });

  it('links to the edit form for this song', async () => {
    seed([SONG]);
    renderAt('/song/song-1');

    const edit = await screen.findByRole('link', { name: 'Edit' });
    expect(edit).toHaveAttribute('href', '/submit?id=song-1');
  });

  it('shows a not-found message for an unknown id', async () => {
    seed([]);
    renderAt('/song/does-not-exist');

    expect(
      await screen.findByText('This song does not exist in this browser.'),
    ).toBeInTheDocument();
  });

  it('does not render the song body when the id does not match', async () => {
    seed([SONG]);
    renderAt('/song/other-id');

    await screen.findByText('This song does not exist in this browser.');
    expect(screen.queryByRole('link', { name: 'Em' })).not.toBeInTheDocument();
  });
});
