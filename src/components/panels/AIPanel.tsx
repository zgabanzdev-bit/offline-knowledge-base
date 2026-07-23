'use client';

import { useState } from 'react';
import { useActiveNote } from '@/hooks/useActiveNote';
import { useNotes } from '@/hooks/useNotes';
import { useAIWorker } from '@/hooks/useAIWorker';
import { useSimilarNotes } from '@/hooks/useSimilarNotes';
import { Button } from '@/components/ui/button';

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function AIPanel() {
  const { activeNote, setActiveNoteId } = useActiveNote();
  const { notes, updateNote } = useNotes();
  const { summarize, classify, progress } = useAIWorker();
  const { findSimilar, isLoading: similarLoading } = useSimilarNotes();

  const [summary, setSummary] = useState<string | null>(null);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [similar, setSimilar] = useState<{ noteId: string; title: string; score: number }[]>([]);
  const [busy, setBusy] = useState<'summarize' | 'tags' | 'similar' | null>(null);

  const [renderedAINoteId, setRenderedAINoteId] = useState(activeNote?.id ?? null);

  if ((activeNote?.id ?? null) !== renderedAINoteId) {
    setRenderedAINoteId(activeNote?.id ?? null);
    setSummary(null);
    setSuggestedTags([]);
    setSimilar([]);
  }

  if (!activeNote) return null;
  const plainText = stripHtml(activeNote.content);

  const handleSummarize = async () => {
    if (!plainText.trim()) return;
    setBusy('summarize');
    try {
      setSummary(await summarize(plainText));
    } finally {
      setBusy(null);
    }
  };

  const handleSuggestTags = async () => {
    if (!plainText.trim()) return;
    setBusy('tags');
    try {
      const existingTags = Array.from(new Set((notes ?? []).flatMap((n) => n.tags)));
      const fallback = ['idea', 'reference', 'todo', 'personal', 'work'];
      const candidates = existingTags.length > 0 ? existingTags : fallback;

      const result = await classify(plainText, candidates);
      const relevant = result.labels.filter((_, i) => result.scores[i] > 0.5).slice(0, 5);
      setSuggestedTags(relevant);
    } finally {
      setBusy(null);
    }
  };

  const handleFindSimilar = async () => {
    setBusy('similar');
    try {
      setSimilar(await findSimilar(activeNote.id, activeNote.content));
    } finally {
      setBusy(null);
    }
  };

  const applyTag = (tag: string) => {
    if (activeNote.tags.includes(tag)) return;
    updateNote(activeNote.id, { tags: [...activeNote.tags, tag] });
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-xs font-medium uppercase text-muted-foreground">AI Assistant</h3>

      {progress && (
        <p className="text-xs text-muted-foreground">
          Loading model{progress.progress ? `: ${Math.round(progress.progress)}%` : '…'}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" disabled={busy !== null} onClick={handleSummarize}>
          {busy === 'summarize' ? 'Summarizing…' : 'Summarize'}
        </Button>
        <Button size="sm" variant="secondary" disabled={busy !== null} onClick={handleSuggestTags}>
          {busy === 'tags' ? 'Thinking…' : 'Suggest tags'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={busy !== null || similarLoading}
          onClick={handleFindSimilar}
        >
          {busy === 'similar' ? 'Searching…' : 'Find similar'}
        </Button>
      </div>

      {summary && <p className="rounded bg-muted p-2 text-sm">{summary}</p>}

      {suggestedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {suggestedTags.map((tag) => (
            <button
              key={tag}
              onClick={() => applyTag(tag)}
              className="rounded-full border border-dashed px-2 py-0.5 text-xs hover:bg-accent"
            >
              + {tag}
            </button>
          ))}
        </div>
      )}

      {similar.length > 0 && (
        <ul className="space-y-1">
          {similar.map((s) => (
            <li
              key={s.noteId}
              onClick={() => setActiveNoteId(s.noteId)}
              className="cursor-pointer truncate rounded px-2 py-1 text-sm hover:bg-accent"
            >
              {s.title}{' '}
              <span className="text-xs text-muted-foreground">({(s.score * 100).toFixed(0)}%)</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
