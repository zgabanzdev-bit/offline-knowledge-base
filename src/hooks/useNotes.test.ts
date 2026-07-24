import { describe, it, expect } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useNotes } from './useNotes';
import { db } from '@/lib/db';

describe('useNotes', () => {
  it('creates a note with sensible defaults', async () => {
    const { result } = renderHook(() => useNotes());

    let noteId = '';
    await act(async () => {
      noteId = await result.current.createNote({ title: 'My note' });
    });

    await waitFor(() => expect(result.current.notes).toHaveLength(1));
    expect(result.current.notes?.[0]).toMatchObject({
      id: noteId,
      title: 'My note',
      content: '',
      tags: [],
      isPinned: false,
      isArchived: false,
    });
  });

  it('updateNote performs a partial merge, not a replace', async () => {
    const { result } = renderHook(() => useNotes());

    let noteId = '';
    await act(async () => {
      noteId = await result.current.createNote({ title: 'Original', content: 'Body text' });
    });

    await act(async () => {
      await result.current.updateNote(noteId, { title: 'Renamed' });
    });

    const note = await db.notes.get(noteId);
    expect(note).toMatchObject({ title: 'Renamed', content: 'Body text' });
  });

  it('deleteNote removes the note and cleans up backlinks pointing to it', async () => {
    const { result } = renderHook(() => useNotes());

    let noteA = '';
    let noteB = '';
    await act(async () => {
      noteA = await result.current.createNote({ title: 'A' });
      noteB = await result.current.createNote({ title: 'B' });
    });

    await act(async () => {
      await result.current.linkNotes(noteA, noteB);
    });

    const noteBBefore = await db.notes.get(noteB);
    expect(noteBBefore?.backlinks).toContain(noteA);

    await act(async () => {
      await result.current.deleteNote(noteA);
    });

    const noteBAfter = await db.notes.get(noteB);
    expect(noteBAfter?.backlinks).not.toContain(noteA);
    expect(await db.notes.get(noteA)).toBeUndefined();
  });
});
