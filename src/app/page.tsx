'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useNotes } from '@/hooks/useNotes';
import { useActiveNote } from '@/hooks/useActiveNote';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Editor } from '@/components/editor/Editor';
import { RightPanel } from '@/components/panels/RightPanel';
import { useSearchIndex } from '@/hooks/useSearchIndex';
import { CommandPalette } from '@/components/command-palette/CommandPalette';
import { OfflineBanner } from '@/components/OfflineBanner';

export default function Home() {
  const { notes, createNote, deleteNote } = useNotes();
  const { activeNoteId, setActiveNoteId } = useActiveNote();
  useSearchIndex();

  return (
    <>
      <CommandPalette />
      <OfflineBanner />
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
              <AnimatePresence initial={false}>
                {notes?.map((note) => (
                  <motion.li
                    key={note.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
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
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        }

        editor={<Editor />}

        metaPanel={<RightPanel />}
      />
    </>
  );
}
