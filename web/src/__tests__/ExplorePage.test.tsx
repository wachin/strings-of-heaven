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
  return screen.getByText(/chords? for C on guitar/).textContent ?? '';
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
