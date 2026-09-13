import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createAppStore } from '@shared/store';
import { ExplorePage } from '../pages/ExplorePage';

function renderExplore() {
  return render(
    <Provider store={createAppStore()}>
      <MemoryRouter>
        <ExplorePage />
      </MemoryRouter>
    </Provider>,
  );
}

/** The "N chords for C on guitar" line. */
function countLine(): string {
  return screen.getByRole('status').textContent ?? '';
}

function typeButton(label: string): HTMLElement {
  return screen.getByRole('button', { name: label });
}

describe('ExplorePage — chord type filter', () => {
  it('leaves every chord type unselected on arrival', () => {
    renderExplore();

    // "Major" used to be highlighted on load while doing nothing at all.
    for (const label of ['Major', 'Minor', 'dim', 'dim7']) {
      expect(typeButton(label)).toHaveAttribute('aria-pressed', 'false');
    }
    expect(countLine()).toMatch(/^\d+ chords for C on guitar$/);
    expect(screen.getByText('C Major')).toBeInTheDocument();
  });

  it('shows only the clicked type', async () => {
    const user = userEvent.setup();
    renderExplore();

    await user.click(typeButton('Minor'));

    expect(typeButton('Minor')).toHaveAttribute('aria-pressed', 'true');
    expect(countLine()).toContain('1 chord for C on guitar');
    expect(screen.getByText('C Minor')).toBeInTheDocument();
    expect(screen.queryByText('C Major')).not.toBeInTheDocument();
    expect(screen.queryByText('C Diminished')).not.toBeInTheDocument();
  });

  it('clears the filter when the active type is clicked again', async () => {
    const user = userEvent.setup();
    renderExplore();
    const before = countLine();

    await user.click(typeButton('Minor'));
    expect(countLine()).toContain('1 chord');

    await user.click(typeButton('Minor'));
    expect(typeButton('Minor')).toHaveAttribute('aria-pressed', 'false');
    expect(countLine()).toBe(before);
  });

  it('switches between types', async () => {
    const user = userEvent.setup();
    renderExplore();

    await user.click(typeButton('dim7'));
    expect(screen.getByText('C Diminished 7th')).toBeInTheDocument();
    expect(screen.queryByText('C Minor')).not.toBeInTheDocument();

    await user.click(typeButton('sus4'));
    expect(screen.getByText('C Suspended 4th')).toBeInTheDocument();
    expect(screen.queryByText('C Diminished 7th')).not.toBeInTheDocument();
  });
});

describe('ExplorePage — search', () => {
  const search = () => screen.getByRole('searchbox', { name: 'Search chords' });

  it('finds a chord by its chord-site name', async () => {
    const user = userEvent.setup();
    renderExplore();

    await user.type(search(), 'Cm');

    expect(countLine()).toContain('1 chord for C on guitar');
    expect(screen.getByText('C Minor')).toBeInTheDocument();
    expect(screen.queryByText('C Major')).not.toBeInTheDocument();
  });

  it('finds a slash chord by name', async () => {
    const user = userEvent.setup();
    renderExplore();

    await user.type(search(), 'C7/G');

    expect(countLine()).toContain('1 chord for C on guitar');
    expect(screen.getByText('C7/G')).toBeInTheDocument();
  });

  it('still accepts the long display name', async () => {
    const user = userEvent.setup();
    renderExplore();

    await user.type(search(), 'C Diminished 7th');

    expect(screen.getByText('C Diminished 7th')).toBeInTheDocument();
    expect(countLine()).toContain('1 chord');
  });

  it('does not narrow when only the root note is typed', async () => {
    const user = userEvent.setup();
    renderExplore();
    const before = countLine();

    await user.type(search(), 'C');

    expect(countLine()).toBe(before);
  });

  it('offers a way out when nothing matches', async () => {
    const user = userEvent.setup();
    renderExplore();

    await user.type(search(), 'zzz');

    expect(screen.getByText(/No chords match/)).toBeInTheDocument();
    expect(screen.getByText(/C7\/G/)).toBeInTheDocument(); // the hint

    await user.click(screen.getAllByRole('button', { name: 'Clear filters' })[0]);
    expect(screen.getByText('C Major')).toBeInTheDocument();
  });
});

describe('ExplorePage — searching another note', () => {
  const search = () => screen.getByRole('searchbox', { name: 'Search chords' });

  it('follows the note the query names', async () => {
    const user = userEvent.setup();
    renderExplore();
    expect(countLine()).toContain('for C on guitar');

    await user.type(search(), 'Ebm');

    expect(countLine()).toContain('1 chord for Eb on guitar');
    expect(screen.getByText('Eb Minor')).toBeInTheDocument();
  });

  it('accepts the note in either spelling', async () => {
    const user = userEvent.setup();
    renderExplore();

    await user.type(search(), 'D#m');

    // "D#" is the same pitch as "Eb", which is the spelling the page uses.
    expect(countLine()).toContain('for Eb on guitar');
    expect(screen.getByText('Eb Minor')).toBeInTheDocument();
  });

  it('lights up the note button it switched to', async () => {
    const user = userEvent.setup();
    renderExplore();

    await user.type(search(), 'F#maj7');

    expect(screen.getByRole('button', { name: 'F#' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'C' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('F# Major 7th')).toBeInTheDocument();
  });

  it('stays on the current note when the query fits there', async () => {
    const user = userEvent.setup();
    renderExplore();

    // "add9" starts with the letter A but is a suffix, not the note A.
    await user.type(search(), 'add9');

    expect(countLine()).toContain('for C on guitar');
    expect(screen.getByText('C Add 9')).toBeInTheDocument();
  });

  it('goes back to the chosen note when the search is cleared', async () => {
    const user = userEvent.setup();
    renderExplore();

    await user.type(search(), 'Ebm');
    expect(countLine()).toContain('for Eb');

    await user.clear(search());
    expect(countLine()).toContain('for C on guitar');
    expect(screen.getByText('C Major')).toBeInTheDocument();
  });

  it('picking a note by hand clears the search', async () => {
    const user = userEvent.setup();
    renderExplore();

    await user.type(search(), 'Ebm');
    await user.click(screen.getByRole('button', { name: 'G' }));

    expect(search()).toHaveValue('');
    expect(countLine()).toContain('for G on guitar');
  });
});
