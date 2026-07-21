import { atom } from 'jotai';

/** ID текущей открытой в редакторе заметки. null — ничего не выбрано (empty state) */
export const activeNoteIdAtom = atom<string | null>(null);
