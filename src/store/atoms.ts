import { atom } from 'jotai';

export const activeNoteIdAtom = atom<string | null>(null);

export const commandPaletteOpenAtom = atom(false);
