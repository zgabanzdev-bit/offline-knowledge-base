'use client';

import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useMemo, useState, useRef } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { commandPaletteOpenAtom, activeNoteIdAtom } from '@/store/atoms';
import { useTheme } from 'next-themes';
import { searchIndex } from '@/lib/search';
import { exportAllNotes, downloadBlob } from '@/lib/export';
import { importNotesFromZip } from '@/lib/import';
import { useNotes } from '@/hooks/useNotes';
import { FileText, Moon, Sun, Plus, Download, Upload } from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useAtom(commandPaletteOpenAtom);
  const setActiveNoteId = useSetAtom(activeNoteIdAtom);
  const { createNote } = useNotes();
  const { setTheme, theme } = useTheme();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        createNote().then(setActiveNoteId);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [createNote, setActiveNoteId]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchIndex.search(query).slice(0, 8);
  }, [query]);

  const runAndClose = (action: () => void) => {
    action();
    setOpen(false);
    setQuery('');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const blob = await exportAllNotes();
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadBlob(blob, `knowledge-base-export-${timestamp}.zip`);
  };

  const handleImportFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const result = await importNotesFromZip(file);
      alert(
        `Imported ${result.imported} notes.` +
          (result.skipped > 0 ? ` Skipped ${result.skipped} duplicates.` : ''),
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Import failed');
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={handleImportFileSelected}
      />

      <CommandDialog open={open} onOpenChange={setOpen} commandProps={{ shouldFilter: false }}>
        <CommandInput
          placeholder="Search notes or run a command…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {results.length > 0 && (
            <CommandGroup heading="Notes">
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  value={`note-${result.id}`}
                  onSelect={() => runAndClose(() => setActiveNoteId(result.id as string))}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {result.title as string}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          <CommandGroup heading="Actions">
            <CommandItem
              value="new-note"
              onSelect={() =>
                runAndClose(async () => {
                  const id = await createNote();
                  setActiveNoteId(id);
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              New note
            </CommandItem>
            <CommandItem
              value="toggle-theme"
              onSelect={() => runAndClose(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
            >
              {theme === 'dark' ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              Toggle theme
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Data">
            <CommandItem value="export-data" onSelect={() => runAndClose(handleExport)}>
              <Download className="mr-2 h-4 w-4" />
              Export all notes
            </CommandItem>
            <CommandItem
              value="import-data"
              onSelect={() => runAndClose(() => fileInputRef.current?.click())}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import notes
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
