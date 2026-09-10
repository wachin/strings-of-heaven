import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteSelector } from '../components/NoteSelector';
import { ChordTypeSelector } from '../components/ChordTypeSelector';

describe('NoteSelector', () => {
  it('renders 12 root note buttons', () => {
    render(<NoteSelector selected="C" onSelect={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(12);
    expect(screen.getByRole('button', { name: 'C#' })).toBeInTheDocument();
  });

  it('marks the selected note and dispatches clicks', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<NoteSelector selected="C" onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: 'C' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'A' }));
    expect(onSelect).toHaveBeenCalledWith('A');
  });
});

describe('ChordTypeSelector', () => {
  it('renders chips for each suffix with friendly labels', () => {
    render(<ChordTypeSelector suffixes={['major', 'minor', 'm7']} selected="major" onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: 'Major' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Minor' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'm7' })).toBeInTheDocument();
  });

  it('selects a suffix', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ChordTypeSelector suffixes={['major', '7']} selected="major" onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: '7' }));
    expect(onSelect).toHaveBeenCalledWith('7');
  });
});