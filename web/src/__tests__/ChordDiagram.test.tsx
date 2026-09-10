import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createAppStore } from '@shared/store';
import { ChordDiagram } from '../components/ChordDiagram';
import { InstrumentToggle } from '../components/InstrumentToggle';

describe('ChordDiagram', () => {
  it('renders a guitar diagram with a descriptive aria-label', () => {
    render(
      <Provider store={createAppStore()}>
        <ChordDiagram chordKey="C" suffix="major" />
      </Provider>,
    );
    expect(screen.getByRole('img', { name: /C Major chord on guitar.*x32010/ })).toBeInTheDocument();
  });

  it('renders a piano diagram after switching instrument', async () => {
    const user = userEvent.setup();
    render(
      <Provider store={createAppStore()}>
        <InstrumentToggle />
        <ChordDiagram chordKey="C" suffix="major" />
      </Provider>,
    );
    await user.click(screen.getByRole('button', { name: 'Piano' }));
    expect(
      screen.getByRole('img', { name: /C Major chord on piano: press C, E, G/ }),
    ).toBeInTheDocument();
  });

  it('renders a ukulele diagram with 4 strings data', async () => {
    const user = userEvent.setup();
    render(
      <Provider store={createAppStore()}>
        <InstrumentToggle />
        <ChordDiagram chordKey="C" suffix="major" />
      </Provider>,
    );
    await user.click(screen.getByRole('button', { name: 'Ukulele' }));
    expect(
      screen.getByRole('img', { name: /C Major chord on ukulele.*0003/ }),
    ).toBeInTheDocument();
  });
});

describe('InstrumentToggle', () => {
  it('switches instruments and maps equivalent suffixes', async () => {
    const user = userEvent.setup();
    const store = createAppStore();
    render(
      <Provider store={store}>
        <InstrumentToggle />
      </Provider>,
    );
    const pianoButton = screen.getByRole('button', { name: 'Piano' });
    expect(pianoButton).toHaveAttribute('aria-pressed', 'false');
    await user.click(pianoButton);
    expect(store.getState().ui.instrument).toBe('piano');
    expect(store.getState().chords.selectedSuffix).toBe('major');
  });
});