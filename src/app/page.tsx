'use client';

import { useNotes } from '@/hooks/useNotes';
import { useActiveNote } from '@/hooks/useActiveNote';
import { useUIStore } from '@/store/useUIStore';
import { useIsDesktop } from '@/hooks/useBreakpoint';
import { AppShell } from '@/components/layout/AppShell';
import { NotesList } from '@/components/sidebar/NotesList';
import { Editor } from '@/components/editor/Editor';
import { RightPanel } from '@/components/panels/RightPanel';
import { useSearchIndex } from '@/hooks/useSearchIndex';
import { CommandPalette } from '@/components/command-palette/CommandPalette';
import { OfflineBanner } from '@/components/OfflineBanner';

export default function Home() {
  const { notes, createNote, deleteNote } = useNotes();
  const { activeNoteId, setActiveNoteId } = useActiveNote();
  const isDesktop = useIsDesktop();
  const setMobileView = useUIStore((s) => s.setMobileView);
  useSearchIndex();

  const handleSelectNote = (id: string) => {
    setActiveNoteId(id);
    if (!isDesktop) setMobileView('editor');
  };

  const handleCreateNote = async () => {
    const id = await createNote({ title: `Note ${Date.now()}` });
    handleSelectNote(id);
  };

  return (
    <>
      <CommandPalette />
      <OfflineBanner />
      <AppShell
        sidebar={
          <NotesList
            notes={notes}
            activeNoteId={activeNoteId}
            onSelect={handleSelectNote}
            onCreate={handleCreateNote}
            onDelete={(id) => {
              deleteNote(id);
              if (activeNoteId === id) setActiveNoteId(null);
            }}
          />
        }
        editor={<Editor />}
        metaPanel={<RightPanel />}
      />
    </>
  );
}
