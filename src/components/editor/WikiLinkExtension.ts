import { Node, mergeAttributes } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import type { WikiLinkItem } from './WikiLinkList';

export const WikiLinkPluginKey = new PluginKey('wikiLink');

interface WikiLinkOptions {
  suggestion: Partial<SuggestionOptions>;
  onLinkInserted?: (targetNoteId: string) => void;
}

interface WikiLinkStorage {
  items: WikiLinkItem[];
}

// Module augmentation: расширяем встроенные типы TipTap собственным storage
// и command-ом. Без этого TS видит editor.storage как {} и не знает о наших полях
declare module '@tiptap/core' {
  interface Storage {
    wikiLink: WikiLinkStorage;
  }

  interface Commands<ReturnType> {
    wikiLink: {
      setWikiLinkItems: (items: WikiLinkItem[]) => ReturnType;
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

          this.options.onLinkInserted?.(props.id);
        },
      }),
    ];
  },
});
