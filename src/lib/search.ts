import MiniSearch from 'minisearch';
import type { Note } from './db';

export interface SearchableNote {
  id: string;
  title: string;
  content: string;
}

export const searchIndex = new MiniSearch<SearchableNote>({
  fields: ['title', 'content'],
  storeFields: ['title'],
  searchOptions: {
    boost: { title: 2 },
    fuzzy: 0.2,
    prefix: true,
  },
});

function toPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function noteToSearchable(note: Note): SearchableNote {
  return { id: note.id, title: note.title, content: toPlainText(note.content) };
}

export function rebuildSearchIndex(notes: Note[]): void {
  searchIndex.removeAll();
  searchIndex.addAll(notes.map(noteToSearchable));
}

export function upsertNoteInIndex(note: Note): void {
  const searchable = noteToSearchable(note);
  if (searchIndex.has(note.id)) {
    searchIndex.discard(note.id);
  }
  searchIndex.add(searchable);
}

export function removeNoteFromIndex(id: string): void {
  if (searchIndex.has(id)) {
    searchIndex.discard(id);
  }
}
