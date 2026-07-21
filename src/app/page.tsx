'use client';

import { useNotes } from '@/hooks/useNotes';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { notes, createNote } = useNotes();

  return (
    <AppShell
      sidebar={
        <div className="p-4 space-y-2">
          <Button size="sm" onClick={() => createNote({ title: `Note ${Date.now()}` })}>
            + New note
          </Button>
          <ul className="text-sm space-y-1">
            {notes?.map((note) => (
              <li key={note.id} className="truncate">
                {note.title}
              </li>
            ))}
          </ul>
        </div>
      }
      editor={
        <div className="p-8 text-muted-foreground">
          {notes === undefined ? 'Loading...' : `Editor placeholder — ${notes.length} notes in DB`}
        </div>
      }
      metaPanel={<div className="p-4 text-sm text-muted-foreground">Meta panel placeholder</div>}
    />
  );
}
