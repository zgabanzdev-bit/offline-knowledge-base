'use client';

import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils';

interface AppShellProps {
  sidebar: React.ReactNode;
  editor: React.ReactNode;
  metaPanel: React.ReactNode;
}

export function AppShell({ sidebar, editor, metaPanel }: AppShellProps) {
  const isLeftPanelOpen = useUIStore((s) => s.isLeftPanelOpen);
  const isRightPanelOpen = useUIStore((s) => s.isRightPanelOpen);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <aside
        className={cn(
          'shrink-0 border-r transition-all duration-200 overflow-hidden',
          isLeftPanelOpen ? 'w-64' : 'w-0',
        )}
      >
        <div className="h-full w-64 overflow-y-auto">{sidebar}</div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">{editor}</main>

      <aside
        className={cn(
          'shrink-0 border-l transition-all duration-200 overflow-hidden',
          isRightPanelOpen ? 'w-72' : 'w-0',
        )}
      >
        <div className="h-full w-72 overflow-y-auto">{metaPanel}</div>
      </aside>
    </div>
  );
}
