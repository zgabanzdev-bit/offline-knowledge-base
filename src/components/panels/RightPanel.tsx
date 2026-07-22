'use client';

import { useActiveNote } from '@/hooks/useActiveNote';
import { MetadataPanel } from './MetadataPanel';
import { BacklinksPanel } from './BacklinksPanel';

export function RightPanel() {
  const { activeNoteId } = useActiveNote();

  if (!activeNoteId) {
    return <div className="p-4 text-sm text-muted-foreground">Select a note to see details</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <MetadataPanel />
      <div className="border-t pt-4">
        <BacklinksPanel />
      </div>
    </div>
  );
}
