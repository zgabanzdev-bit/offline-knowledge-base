import Dexie, { type Table } from 'dexie';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  backlinks: string[];
  isPinned: boolean;
  isArchived: boolean;
}

export interface Setting {
  key: string;
  value: unknown;
}

export interface NoteEmbedding {
  noteId: string;
  vector: number[];
  contentHash: string;
}

class KnowledgeBaseDB extends Dexie {
  notes!: Table<Note, string>;
  settings!: Table<Setting, string>;
  embeddings!: Table<NoteEmbedding, string>;

  constructor() {
    super('KnowledgeBaseDB');

    this.version(1).stores({
      notes: 'id, title, *tags, createdAt, updatedAt, isPinned, isArchived',
      settings: 'key',
    });

    this.version(2).stores({
      notes: 'id, title, *tags, *backlinks, createdAt, updatedAt, isPinned, isArchived',
      settings: 'key',
    });

    this.version(3).stores({
      notes: 'id, title, *tags, *backlinks, createdAt, updatedAt, isPinned, isArchived',
      settings: 'key',
      embeddings: 'noteId',
    });
  }
}

export const db = new KnowledgeBaseDB();
