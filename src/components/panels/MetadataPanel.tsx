'use client';

import { useState, type KeyboardEvent } from 'react';
import { useActiveNote } from '@/hooks/useActiveNote';
import { useNotes } from '@/hooks/useNotes';
import { X } from 'lucide-react';

export function MetadataPanel() {
  const { activeNote } = useActiveNote();
  const { updateNote } = useNotes();
  const [tagInput, setTagInput] = useState('');

  if (!activeNote) return null;

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || activeNote.tags.includes(tag)) {
      setTagInput('');
      return;
    }
    updateNote(activeNote.id, { tags: [...activeNote.tags, tag] });
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    updateNote(activeNote.id, { tags: activeNote.tags.filter((t) => t !== tag) });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-4 text-sm">
      <div>
        <h3 className="mb-1 text-xs font-medium uppercase text-muted-foreground">Created</h3>
        <p>{new Date(activeNote.createdAt).toLocaleString()}</p>
      </div>

      <div>
        <h3 className="mb-1 text-xs font-medium uppercase text-muted-foreground">Last updated</h3>
        <p>{new Date(activeNote.updatedAt).toLocaleString()}</p>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase text-muted-foreground">Tags</h3>
        <div className="mb-2 flex flex-wrap gap-1">
          {activeNote.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs"
            >
              {tag}
              <button onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder="Add tag…"
          className="w-full rounded border bg-transparent px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}
