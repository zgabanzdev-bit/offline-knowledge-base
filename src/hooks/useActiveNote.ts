import { useAtom } from 'jotai';
import { useLiveQuery } from 'dexie-react-hooks';
import { activeNoteIdAtom } from '@/store/atoms';
import { db } from '@/lib/db';

export function useActiveNote() {
  const [activeNoteId, setActiveNoteId] = useAtom(activeNoteIdAtom);

  const activeNote = useLiveQuery(
    () => (activeNoteId ? db.notes.get(activeNoteId) : undefined),
    [activeNoteId],
  );

  return { activeNoteId, setActiveNoteId, activeNote };
}
