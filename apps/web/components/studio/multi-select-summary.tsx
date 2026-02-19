'use client';

import * as React from 'react';
import { Layers } from 'lucide-react';

export interface MultiSelectSummaryProps {
  count: number;
}

/**
 * Summary panel shown in the right sidebar when multiple components are selected.
 * Displays the selection count and keyboard shortcut hints.
 */
export function MultiSelectSummary({ count }: MultiSelectSummaryProps) {
  return (
    <div className="space-y-4 p-4" data-testid="multi-select-summary">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-bold" data-testid="multi-select-count-header">
          {count} components selected
        </h3>
      </div>

      <p className="text-xs text-muted-foreground">
        Use the toolbar above the canvas or keyboard shortcuts to manage selected components.
      </p>

      <div className="space-y-2 border-t border-border pt-4">
        <h4 className="text-xs font-medium text-muted-foreground">Keyboard Shortcuts</h4>
        <div className="space-y-1.5">
          <ShortcutRow keys="⌘ C" label="Copy" />
          <ShortcutRow keys="⌘ X" label="Cut" />
          <ShortcutRow keys="⌘ V" label="Paste" />
          <ShortcutRow keys="⌫" label="Delete" />
          <ShortcutRow keys="⌘ A" label="Select all" />
          <ShortcutRow keys="Esc" label="Clear selection" />
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
        {keys}
      </kbd>
    </div>
  );
}
