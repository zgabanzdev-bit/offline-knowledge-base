'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useActiveNote } from '@/hooks/useActiveNote';
import { useNotes } from '@/hooks/useNotes';
import { useAIWorker } from '@/hooks/useAIWorker';
import { useSimilarNotes } from '@/hooks/useSimilarNotes';
import { useReducedMotion } from '@/hooks/useReducedMotion';
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

  const shouldReduceMotion = useReducedMotion();

  const revealVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    visible: { opacity: 1, y: 0 },
  };

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

      <AnimatePresence mode="popLayout">
        {progress && (
          <motion.p
            key="progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-muted-foreground"
          >
            Loading model{progress.progress ? `: ${Math.round(progress.progress)}%` : '…'}
          </motion.p>
        )}
      </AnimatePresence>

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

      <AnimatePresence mode="wait">
        {busy && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1 w-1 rounded-full bg-current"
                animate={shouldReduceMotion ? {} : { opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
            Thinking
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {summary && (
          <motion.p
            key="summary"
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="rounded bg-muted p-2 text-sm"
          >
            {summary}
          </motion.p>
        )}
      </AnimatePresence>

      {suggestedTags.length > 0 && (
        <motion.div
          className="flex flex-wrap gap-1"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {suggestedTags.map((tag) => (
            <motion.button
              key={tag}
              variants={revealVariants}
              onClick={() => applyTag(tag)}
              className="rounded-full border border-dashed px-2 py-0.5 text-xs hover:bg-accent"
            >
              + {tag}
            </motion.button>
          ))}
        </motion.div>
      )}

      {similar.length > 0 && (
        <motion.ul
          className="space-y-1"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {similar.map((s) => (
            <motion.li
              key={s.noteId}
              variants={revealVariants}
              onClick={() => setActiveNoteId(s.noteId)}
              className="cursor-pointer truncate rounded px-2 py-1 text-sm hover:bg-accent"
            >
              {s.title}{' '}
              <span className="text-xs text-muted-foreground">({(s.score * 100).toFixed(0)}%)</span>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
