import { Node, mergeAttributes } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import type { WikiLinkItem } from './WikiLinkList';

export const WikiLinkPluginKey = new PluginKey('wikiLink');

interface WikiLinkOptions {
  suggestion: Partial<SuggestionOptions>;
  onLinkInserted?: (sourceNoteId: string | null, targetNoteId: string) => void;
}

interface WikiLinkStorage {
  items: WikiLinkItem[];
  activeNoteId: string | null;
}

declare module '@tiptap/core' {
  interface Storage {
    wikiLink: WikiLinkStorage;
  }

  interface Commands<ReturnType> {
    wikiLink: {
      setWikiLinkItems: (items: WikiLinkItem[]) => ReturnType;
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
        class:
          'wiki-link cursor-pointer rounded bg-primary/10 px-1 text-primary hover:bg-primary/20',
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
    ];
  },
});
