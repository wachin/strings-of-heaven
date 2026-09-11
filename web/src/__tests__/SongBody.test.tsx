import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createAppStore } from '@shared/store';
import { SongBody } from '../components/SongBody';

const BODY = `[Verse 1]
G               Em
Como el ciervo busca por las aguas,
      C      G         C    D
así clama mi alma por ti Señor.`;

function renderBody(body: string) {
  return render(
    <Provider store={createAppStore()}>
      <MemoryRouter>
        <SongBody body={body} />
      </MemoryRouter>
    </Provider>,
  );
}

/** Text content of every chord line, in document order. */
function chordLineTexts(): string[] {
  return Array.from(document.querySelectorAll('.whitespace-pre')).map((el) => el.textContent ?? '');
}

describe('SongBody', () => {
  it('renders section headers and lyrics', () => {
    renderBody(BODY);
    expect(screen.getByText('[Verse 1]')).toBeInTheDocument();
    expect(screen.getByText('Como el ciervo busca por las aguas,')).toBeInTheDocument();
  });

  it('renders every chord as a link to its diagram', () => {
    renderBody(BODY);

    expect(screen.getByRole('link', { name: 'Em' })).toHaveAttribute('href', '/chord/E/minor');
    expect(screen.getAllByRole('link', { name: 'G' })[0]).toHaveAttribute('href', '/chord/G/major');
    expect(screen.getAllByRole('link', { name: 'C' })[0]).toHaveAttribute('href', '/chord/C/major');
    expect(screen.getByRole('link', { name: 'D' })).toHaveAttribute('href', '/chord/D/major');
  });

  it('preserves the original spacing so chords stay above their syllables', () => {
    renderBody(BODY);
    expect(chordLineTexts()).toContain('G               Em');
    expect(chordLineTexts()).toContain('      C      G         C    D');
  });

  it('maps shorthand suffixes to the chord-database spelling', () => {
    renderBody('Am   G/B');
    expect(screen.getByRole('link', { name: 'Am' })).toHaveAttribute('href', '/chord/A/minor');
    expect(screen.getByRole('link', { name: 'G/B' })).toHaveAttribute('href', '/chord/G/major');
  });

  it('accepts CRLF bodies without misaligning chords', () => {
    renderBody('G   Em\r\nHello\r\n');
    expect(screen.getByRole('link', { name: 'Em' })).toHaveAttribute('href', '/chord/E/minor');
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('shows a placeholder when the body is empty', () => {
    renderBody('   ');
    expect(screen.getByText('This song has no body yet.')).toBeInTheDocument();
  });
});
