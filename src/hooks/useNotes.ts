import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db, type Note } from '@/lib/db';

type CreateNoteInput = Partial<Pick<Note, 'title' | 'content' | 'tags'>>;

export function useNotes() {
  // useLiveQuery подписывается на изменения таблицы 'notes' и
  // автоматически перерендерит компонент при любой мутации через db.notes.*
  const notes = useLiveQuery(
    () => db.notes.orderBy('updatedAt').reverse().toArray(),
    [], // deps — пусто, т.к. запрос не зависит от внешнего стейта
  );

  const createNote = async (input: CreateNoteInput = {}): Promise<string> => {
    const now = Date.now();
    const note: Note = {
      id: uuidv4(),
      title: input.title ?? 'Untitled',
      content: input.content ?? '',
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
      backlinks: [],
      isPinned: false,
      isArchived: false,
    };

    await db.notes.add(note);
    return note.id;
  };

  return {
    /** undefined во время первой загрузки, затем массив — используй для skeleton-стейта */
    notes,
    createNote,
  };
}
