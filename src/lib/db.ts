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
      // 'id' — primary key. '*tags' — multi-entry индекс: Dexie/IndexedDB
      // сам разворачивает массив в отдельные записи индекса, что даёт
      // db.notes.where('tags').equals('project-x') без ручного JOIN.
      // 'content' НЕ индексируем — полнотекстовый поиск по контенту
      // будет через MiniSearch (in-memory), IndexedDB индекс тут бесполезен
      // и только раздувает размер БД.
      notes: 'id, title, *tags, createdAt, updatedAt, isPinned, isArchived',
      settings: 'key',
    });
  }
}

export const db = new KnowledgeBaseDB();
