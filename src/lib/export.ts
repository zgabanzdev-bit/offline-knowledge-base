import { zipSync, strToU8 } from 'fflate';
import TurndownService from 'turndown';
import { db, type Note } from './db';
import type { ExportFile } from './schemas';

const turndown = new TurndownService();

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9а-яё\s-]/gi, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60) || 'untitled'
  );
}

function noteToMarkdownFile(note: Note): { path: string; content: string } {
  const folder = note.tags[0] ?? 'untagged';
  const filename = `${slugify(note.title)}-${note.id.slice(0, 8)}.md`;

  const frontmatter = [
    '---',
    `title: ${note.title}`,
    `tags: [${note.tags.join(', ')}]`,
    `created: ${new Date(note.createdAt).toISOString()}`,
    `updated: ${new Date(note.updatedAt).toISOString()}`,
    '---',
    '',
  ].join('\n');

  const markdownBody = turndown.turndown(note.content);

  return { path: `${folder}/${filename}`, content: frontmatter + markdownBody };
}

export async function exportAllNotes(): Promise<Blob> {
  const notes = await db.notes.toArray();

  const exportData: ExportFile = {
    version: 1,
    exportedAt: Date.now(),
    notes,
  };

  const files: Record<string, Uint8Array> = {
    'notes.json': strToU8(JSON.stringify(exportData, null, 2)),
  };

  for (const note of notes) {
    const { path, content } = noteToMarkdownFile(note);
    files[path] = strToU8(content);
  }

  const zipped = zipSync(files, { level: 6 });
  return new Blob([zipped], { type: 'application/zip' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
