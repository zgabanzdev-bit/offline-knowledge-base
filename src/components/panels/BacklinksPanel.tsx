'use client';

import { useBacklinks } from '@/hooks/useBacklinks';
import { useActiveNote } from '@/hooks/useActiveNote';

export function BacklinksPanel() {
  const { activeNoteId, setActiveNoteId } = useActiveNote();
  const backlinks = useBacklinks(activeNoteId);

  if (!activeNoteId) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium uppercase text-muted-foreground">
        Backlinks {backlinks && backlinks.length > 0 && `(${backlinks.length})`}
      </h3>

      {backlinks === undefined ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
      ) : backlinks.length === 0 ? (
        <p className="text-xs text-muted-foreground">No notes link here yet</p>
      ) : (
        <ul className="space-y-1">
          {backlinks.map((note) => (
            <li
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className="cursor-pointer rounded px-2 py-1.5 text-sm hover:bg-accent"
            >
              <div className="truncate font-medium">{note.title}</div>
              <div className="truncate text-xs text-muted-foreground">
                {stripHtml(note.content).slice(0, 80)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
