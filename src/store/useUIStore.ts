import { create } from 'zustand';

type MobileView = 'list' | 'editor';

interface UIState {
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;

  mobileView: MobileView;
  setMobileView: (view: MobileView) => void;
  isRightSheetOpen: boolean;
  setRightSheetOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLeftPanelOpen: true,
  isRightPanelOpen: true,
  toggleLeftPanel: () => set((s) => ({ isLeftPanelOpen: !s.isLeftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ isRightPanelOpen: !s.isRightPanelOpen })),

  mobileView: 'list',
  setMobileView: (view) => set({ mobileView: view }),
  isRightSheetOpen: false,
  setRightSheetOpen: (open) => set({ isRightSheetOpen: open }),
}));
