import { useEffect } from 'react';
import { useNotes } from './useNotes';
import { rebuildSearchIndex } from '@/lib/search';

export function useSearchIndex() {
  const { notes } = useNotes();

  useEffect(() => {
    if (notes === undefined) return;
    rebuildSearchIndex(notes);
  }, [notes]);

  return { isReady: notes !== undefined };
}
