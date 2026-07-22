'use client';

import { useNotes } from '@/hooks/useNotes';
import { useActiveNote } from '@/hooks/useActiveNote';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Editor } from '@/components/editor/Editor';

export default function Home() {
  const { notes, createNote, deleteNote } = useNotes();
  const { activeNoteId, setActiveNoteId } = useActiveNote();

  return (
    <AppShell
      sidebar={
        <div className="p-4 space-y-2">
          <Button
            size="sm"
            onClick={async () => {
              const id = await createNote({ title: `Note ${Date.now()}` });
              setActiveNoteId(id);
            }}
          >
            + New note
          </Button>
          <ul className="text-sm space-y-1">
            {notes?.map((note) => (
              <li
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={cn(
                  'truncate cursor-pointer rounded px-2 py-1 flex justify-between group',
                  activeNoteId === note.id ? 'bg-accent' : 'hover:bg-accent/50',
                )}
              >
                <span className="truncate">{note.title}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                    if (activeNoteId === note.id) setActiveNoteId(null);
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      }
      editor={<Editor />}

      metaPanel={<div className="p-4 text-sm text-muted-foreground">Meta panel placeholder</div>}
    />
  );
}
