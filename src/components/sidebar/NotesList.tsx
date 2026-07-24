'use client';

import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Note } from '@/lib/db';

interface NotesListProps {
  notes: Note[] | undefined;
  activeNoteId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export function NotesList({ notes, activeNoteId, onSelect, onCreate, onDelete }: NotesListProps) {
  return (
    <div className="flex h-full flex-col p-4">
      <Button size="sm" onClick={onCreate} className="mb-2 shrink-0">
        + New note
      </Button>
      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto text-sm">
        <AnimatePresence initial={false}>
          {notes?.map((note) => (
            <motion.li
              key={note.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => onSelect(note.id)}
              className={cn(
                'group flex cursor-pointer justify-between truncate rounded px-2 py-2 lg:py-1',
                activeNoteId === note.id ? 'bg-accent' : 'hover:bg-accent/50',
              )}
            >
              <span className="truncate">{note.title}</span>
              <button
                aria-label={`Delete "${note.title}"`}
                className="text-muted-foreground opacity-0 group-hover:opacity-100 lg:opacity-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
              >
                ✕
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
