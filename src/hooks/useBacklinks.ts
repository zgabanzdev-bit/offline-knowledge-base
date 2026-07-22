import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export function useBacklinks(noteId: string | null) {
  return useLiveQuery(async () => {
    if (!noteId) return [];

    const note = await db.notes.get(noteId);
    if (!note || note.backlinks.length === 0) return [];

    const linkedNotes = await db.notes.bulkGet(note.backlinks);
    return linkedNotes.filter((n): n is NonNullable<typeof n> => n !== undefined);
  }, [noteId]);
}
