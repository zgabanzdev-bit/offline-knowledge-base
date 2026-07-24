'use client';

import { useUIStore } from '@/store/useUIStore';
import { useIsDesktop } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { PanelLeft, Info } from 'lucide-react';

interface AppShellProps {
  sidebar: React.ReactNode;
  editor: React.ReactNode;
  metaPanel: React.ReactNode;
}

export function AppShell({ sidebar, editor, metaPanel }: AppShellProps) {
  const isDesktop = useIsDesktop();
  const isLeftPanelOpen = useUIStore((s) => s.isLeftPanelOpen);
  const isRightPanelOpen = useUIStore((s) => s.isRightPanelOpen);
  const mobileView = useUIStore((s) => s.mobileView);
  const setMobileView = useUIStore((s) => s.setMobileView);
  const isRightSheetOpen = useUIStore((s) => s.isRightSheetOpen);
  const setRightSheetOpen = useUIStore((s) => s.setRightSheetOpen);

  if (!isDesktop) {
    return (
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
        <header className="flex shrink-0 items-center justify-between border-b px-3 py-2 pt-[calc(env(safe-area-inset-top)+0.5rem)]">
          {mobileView === 'editor' ? (
            <button
              onClick={() => setMobileView('list')}
              className="flex items-center gap-1 text-sm text-muted-foreground"
            >
              <PanelLeft className="h-4 w-4" />
              Notes
            </button>
          ) : (
            <span className="text-sm font-medium">Knowledge Base</span>
          )}

          {mobileView === 'editor' && (
            <button onClick={() => setRightSheetOpen(true)} aria-label="Note details">
              <Info className="h-5 w-5" />
            </button>
          )}
        </header>

        <main className="min-h-0 flex-1 overflow-hidden">
          {mobileView === 'list' ? sidebar : editor}
        </main>

        <Sheet open={isRightSheetOpen} onOpenChange={setRightSheetOpen}>
          <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-sm">
            {metaPanel}
          </SheetContent>
        </Sheet>
      </div>
    );
  }

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
        <div className="h-full w-72 overflow-y-auto no-scrollbar">{metaPanel}</div>
      </aside>
    </div>
  );
}
