import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotesList } from './NotesList';
import type { Note } from '@/lib/db';

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    title: 'Test note',
    content: '',
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    backlinks: [],
    isPinned: false,
    isArchived: false,
    ...overrides,
  };
}

describe('NotesList', () => {
  it('renders all provided notes by title', () => {
    render(
      <NotesList
        notes={[makeNote({ id: '1', title: 'First' }), makeNote({ id: '2', title: 'Second' })]}
        activeNoteId={null}
        onSelect={vi.fn()}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('calls onSelect with the correct id when a note is clicked', () => {
    const onSelect = vi.fn();
    render(
      <NotesList
        notes={[makeNote({ id: 'abc', title: 'Clickable' })]}
        activeNoteId={null}
        onSelect={onSelect}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Clickable'));
    expect(onSelect).toHaveBeenCalledWith('abc');
  });

  it('calls onDelete without triggering onSelect (stopPropagation)', () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();
    render(
      <NotesList
        notes={[makeNote({ id: 'xyz', title: 'Deletable' })]}
        activeNoteId={null}
        onSelect={onSelect}
        onCreate={vi.fn()}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByLabelText('Delete "Deletable"'));
    expect(onDelete).toHaveBeenCalledWith('xyz');
    expect(onSelect).not.toHaveBeenCalled();
  });
});
