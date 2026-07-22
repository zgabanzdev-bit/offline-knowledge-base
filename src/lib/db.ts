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

class KnowledgeBaseDB extends Dexie {
  notes!: Table<Note, string>;
  settings!: Table<Setting, string>;

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
  }
}

export const db = new KnowledgeBaseDB();
