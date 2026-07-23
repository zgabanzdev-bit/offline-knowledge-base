import { useState } from 'react';
import { db } from '@/lib/db';
import { simpleHash } from '@/lib/hash';
import { useAIWorker } from './useAIWorker';
import { useNotes } from './useNotes';

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

export function useSimilarNotes() {
  const { embed } = useAIWorker();
  const { notes } = useNotes();
  const [isLoading, setIsLoading] = useState(false);

  const findSimilar = async (noteId: string, content: string, topK = 5) => {
    setIsLoading(true);
    try {
      const contentHash = simpleHash(content);

      let sourceEmbedding: number[];
      const cached = await db.embeddings.get(noteId);
      if (cached && cached.contentHash === contentHash) {
        sourceEmbedding = cached.vector;
      } else {
        sourceEmbedding = await embed(content);
        await db.embeddings.put({ noteId, vector: sourceEmbedding, contentHash });
      }

      const others = (notes ?? []).filter((n) => n.id !== noteId);
      const scored: { noteId: string; title: string; score: number }[] = [];

      for (const note of others) {
        const noteHash = simpleHash(note.content);
        let vector: number[];
        const otherCached = await db.embeddings.get(note.id);

        if (otherCached && otherCached.contentHash === noteHash) {
          vector = otherCached.vector;
        } else {
          vector = await embed(note.content);
          await db.embeddings.put({ noteId: note.id, vector, contentHash: noteHash });
        }

        scored.push({
          noteId: note.id,
          title: note.title,
          score: cosineSimilarity(sourceEmbedding, vector),
        });
      }

      return scored.sort((a, b) => b.score - a.score).slice(0, topK);
    } finally {
      setIsLoading(false);
    }
  };

  return { findSimilar, isLoading };
}
