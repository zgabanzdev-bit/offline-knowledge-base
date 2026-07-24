import { unzipSync, strFromU8 } from 'fflate';
import { db } from './db';
import { exportFileSchema } from './schemas';

export interface ImportResult {
  imported: number;
  skipped: number;
  skippedTitles: string[];
}

export async function importNotesFromZip(file: File): Promise<ImportResult> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const files = unzipSync(buffer);

  const notesJsonEntry = files['notes.json'];
  if (!notesJsonEntry) {
    throw new Error('Invalid export file: notes.json not found in archive');
  }

  const rawJson = JSON.parse(strFromU8(notesJsonEntry));

  const parseResult = exportFileSchema.safeParse(rawJson);
  if (!parseResult.success) {
    throw new Error(`Invalid export file format: ${parseResult.error.message}`);
  }

  const { notes: importedNotes } = parseResult.data;

  let imported = 0;
  const skippedTitles: string[] = [];

  await db.transaction('rw', db.notes, async () => {
    for (const note of importedNotes) {
      const existing = await db.notes.get(note.id);
      if (existing) {
        skippedTitles.push(note.title);
        continue;
      }
      await db.notes.add(note);
      imported++;
    }
  });

  return { imported, skipped: skippedTitles.length, skippedTitles };
}
