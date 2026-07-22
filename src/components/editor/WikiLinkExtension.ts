import { Node, mergeAttributes } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';
import { Plugin as ProseMirrorPlugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { WikiLinkItem } from './WikiLinkList';

export const WikiLinkPluginKey = new PluginKey('wikiLink');
const WikiLinkDecorationsPluginKey = new PluginKey('wikiLinkDecorations');

interface WikiLinkOptions {
  suggestion: Partial<SuggestionOptions>;
  onLinkInserted?: (sourceNoteId: string | null, targetNoteId: string) => void;
}

interface WikiLinkStorage {
  items: WikiLinkItem[];
  allNoteIds: Set<string>;
  activeNoteId: string | null;
}

declare module '@tiptap/core' {
  interface Storage {
    wikiLink: WikiLinkStorage;
  }

  interface Commands<ReturnType> {
    wikiLink: {
      setWikiLinkItems: (items: WikiLinkItem[]) => ReturnType;
      setAllNoteIds: (ids: string[]) => ReturnType;
      setActiveNoteId: (id: string | null) => ReturnType;
    };
  }
}

export const WikiLink = Node.create<WikiLinkOptions, WikiLinkStorage>({
  name: 'wikiLink',
  group: 'inline',
  inline: true,
  atom: true,

  addOptions() {
    return {
      suggestion: { char: '[[', pluginKey: WikiLinkPluginKey },
      onLinkInserted: undefined,
    };
  },

  addStorage() {
    return {
      items: [],
      allNoteIds: new Set<string>(),
      activeNoteId: null,
    };
  },

  addAttributes() {
    return {
      noteId: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-note-id'),
        renderHTML: (attrs) => ({ 'data-note-id': attrs.noteId }),
      },
      title: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-title'),
        renderHTML: (attrs) => ({ 'data-title': attrs.title }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-note-id]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: 'wiki-link cursor-pointer rounded px-1',
        'data-note-id': node.attrs.noteId,
      }),
      `[[${node.attrs.title}]]`,
    ];
  },

  addCommands() {
    return {
      setWikiLinkItems: (items: WikiLinkItem[]) => () => {
        this.storage.items = items;
        return true;
      },
      setAllNoteIds:
        (ids: string[]) =>
        ({ tr, dispatch }) => {
          this.storage.allNoteIds = new Set(ids);
          if (dispatch) dispatch(tr);
          return true;
        },
      setActiveNoteId: (id: string | null) => () => {
        this.storage.activeNoteId = id;
        return true;
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              { type: this.name, attrs: { noteId: props.id, title: props.title } },
              { type: 'text', text: ' ' },
            ])
            .run();

          this.options.onLinkInserted?.(this.storage.activeNoteId, props.id);
        },
      }),
      new ProseMirrorPlugin({
        key: WikiLinkDecorationsPluginKey,
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = [];

            state.doc.descendants((node, pos) => {
              if (node.type.name !== this.name) return;

              const exists = this.storage.allNoteIds.has(node.attrs.noteId);
              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: exists
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'bg-destructive/10 text-destructive line-through cursor-not-allowed',
                  title: exists ? '' : 'Note was deleted',
                }),
              );
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
