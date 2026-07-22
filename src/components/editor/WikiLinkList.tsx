'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export interface WikiLinkItem {
  id: string;
  title: string;
}

interface Props {
  items: WikiLinkItem[];
  command: (item: WikiLinkItem) => void;
}

export interface WikiLinkListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const WikiLinkList = forwardRef<WikiLinkListRef, Props>(({ items, command }, ref) => {
  const [selected, setSelected] = useState(0);
  useEffect(() => setSelected(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelected((i) => (i + items.length - 1) % items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelected((i) => (i + 1) % items.length);
        return true;
      }
      if (event.key === 'Enter') {
        if (items[selected]) command(items[selected]);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div className="rounded-md border bg-popover p-2 text-sm text-muted-foreground shadow-md">
        No matching notes
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-popover p-1 shadow-md">
      {items.map((item, i) => (
        <button
          key={item.id}
          onClick={() => command(item)}
          className={`block w-full rounded px-2 py-1 text-left text-sm ${
            i === selected ? 'bg-accent' : 'hover:bg-accent/50'
          }`}
        >
          {item.title}
        </button>
      ))}
    </div>
  );
});

WikiLinkList.displayName = 'WikiLinkList';
