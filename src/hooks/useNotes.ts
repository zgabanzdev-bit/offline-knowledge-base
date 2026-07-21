import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db, type Note } from '@/lib/db';

type CreateNoteInput = Partial<Pick<Note, 'title' | 'content' | 'tags'>>;
type UpdateNoteInput = Partial<Omit<Note, 'id' | 'createdAt'>>;

export function useNotes() {
  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray(), []);

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

  const updateNote = async (id: string, patch: UpdateNoteInput): Promise<void> => {
    await db.notes.update(id, {
      ...patch,
      updatedAt: Date.now(),
    });
  };

  const deleteNote = async (id: string): Promise<void> => {
    // TODO: нужно будет пройтись по
    // db.notes.where('backlinks').equals(id) и вычистить ссылки на удалённую
    // заметку из чужих backlinks-массивов
    await db.notes.delete(id);
  };

  const getNoteById = async (id: string): Promise<Note | undefined> => {
    return db.notes.get(id);
  };

  return {
    notes,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
  };
}
