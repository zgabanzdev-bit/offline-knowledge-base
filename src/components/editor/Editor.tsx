'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { WikiLink } from './WikiLinkExtension';
import { createWikiLinkSuggestion } from './createWikiLinkSuggestion';
import { useActiveNote } from '@/hooks/useActiveNote';
import { useNotes } from '@/hooks/useNotes';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

type SaveStatus = 'idle' | 'saving' | 'saved';

export function Editor() {
  const { activeNoteId, activeNote, setActiveNoteId } = useActiveNote();
  const { notes, updateNote, linkNotes } = useNotes();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [titleDraft, setTitleDraft] = useState(activeNote?.title ?? '');
  const [renderedNoteId, setRenderedNoteId] = useState(activeNoteId);
  const [syncedNoteId, setSyncedNoteId] = useState<string | null>(null);

  if (activeNoteId !== renderedNoteId) {
    setRenderedNoteId(activeNoteId);
    setSaveStatus('idle');
    setTitleDraft('');
    setSyncedNoteId(null);
  }

  const debouncedSave = useDebouncedCallback((id: string, html: string) => {
    updateNote(id, { content: html }).then(() => setSaveStatus('saved'));
  }, 500);

  if (activeNote && activeNote.id === activeNoteId && syncedNoteId !== activeNoteId) {
    setSyncedNoteId(activeNoteId);
    setTitleDraft(activeNote.title);
  }

  const debouncedSaveTitle = useDebouncedCallback((id: string, title: string) => {
    updateNote(id, { title }).then(() => setSaveStatus('saved'));
  }, 500);

  const editor = useEditor({
    extensions: [
      StarterKit,
      WikiLink.configure({
        suggestion: createWikiLinkSuggestion(),
        onLinkInserted: (sourceNoteId, targetNoteId) => {
          if (sourceNoteId) linkNotes(sourceNoteId, targetNoteId);
        },
      }),
    ],
    content: activeNote?.content ?? '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px]',
      },
      handleClick: (_view, _pos, event) => {
        const target = event.target as HTMLElement;
        const noteId = target.closest('[data-note-id]')?.getAttribute('data-note-id');
        if (noteId) {
          setActiveNoteId(noteId);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const sourceId = editor.storage.wikiLink.activeNoteId;
      if (!sourceId) return;
      setSaveStatus('saving');
      debouncedSave(sourceId, editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    const allNotes = notes ?? [];

    editor.commands.setWikiLinkItems(
      allNotes.filter((n) => n.id !== activeNoteId).map((n) => ({ id: n.id, title: n.title })),
    );
    editor.commands.setAllNoteIds(allNotes.map((n) => n.id));
    editor.commands.setActiveNoteId(activeNoteId);
  }, [editor, notes, activeNoteId]);

  useEffect(() => {
    if (!editor || !activeNote) return;
    if (editor.getHTML() !== activeNote.content) {
      editor.commands.setContent(activeNote.content, { emitUpdate: false });
    }
  }, [editor, activeNote]);

  if (!activeNoteId) {
    return <div className="p-8 text-muted-foreground">Select or create a note</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-muted-foreground">
        <input
          value={titleDraft}
          onChange={(e) => {
            setTitleDraft(e.target.value);
            if (!activeNoteId) return;
            setSaveStatus('saving');
            debouncedSaveTitle(activeNoteId, e.target.value);
          }}
          className="bg-transparent text-xs font-medium outline-none"
          placeholder="Untitled"
        />

        <span>
          {saveStatus === 'saving' && 'Saving…'}
          {saveStatus === 'saved' && 'Saved'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
