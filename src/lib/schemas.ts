import { z } from 'zod';

export const noteSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  createdAt: z.number(),
  updatedAt: z.number(),
  backlinks: z.array(z.string()),
  isPinned: z.boolean(),
  isArchived: z.boolean(),
});

export const exportFileSchema = z.object({
  version: z.literal(1),
  exportedAt: z.number(),
  notes: z.array(noteSchema),
});

export type ExportFile = z.infer<typeof exportFileSchema>;
