/**
 * Regression test for the GitHub Pages sub-path deployment.
 *
 * The app is published under /strings-of-heaven/. React Router must use that
 * segment as its basename: without it, "/strings-of-heaven/song/<id>" matches no
 * route, the catch-all `<Navigate to="/" />` fires, and the visitor is thrown
 * out of the project site (on GitHub Pages "/" is the user's own site).
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createAppStore } from '@shared/store';
import { emptySongEntry } from '@shared/types';
import type { SongEntry } from '@shared/types';
import { storage } from '@shared/config';
import App from '../App';
import { routerBasename } from '../router';

const BASE = '/strings-of-heaven/';

const SONG: SongEntry = {
  ...emptySongEntry(),
  id: 'song-9',
  title: 'Perfect',
  artist: 'Simple Plan',
  body: 'D               A\nHey dad look at me',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

describe('sub-path deployment (GitHub Pages)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(storage.keys.songs, JSON.stringify([SONG]));
  });

  it('resolves a deep link under the deployment sub-path', async () => {
    window.history.replaceState({}, '', `${BASE}song/song-9`);

    render(
      <Provider store={createAppStore()}>
        <BrowserRouter basename={routerBasename(BASE)}>
          <App />
        </BrowserRouter>
      </Provider>,
    );

    expect(await screen.findByRole('heading', { name: 'Perfect' })).toBeInTheDocument();
    // The catch-all must not have moved the visitor off the project sub-path.
    expect(window.location.pathname).toBe(`${BASE}song/song-9`);
  });

  it('keeps the app on its sub-path when opening the index', async () => {
    window.history.replaceState({}, '', BASE);

    render(
      <Provider store={createAppStore()}>
        <BrowserRouter basename={routerBasename(BASE)}>
          <App />
        </BrowserRouter>
      </Provider>,
    );

    expect(await screen.findByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(window.location.pathname).toBe(BASE);
  });
});
