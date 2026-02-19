'use client';

import * as React from 'react';
import { Copy, Clipboard, Scissors, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMultiSelect } from '@/lib/puck/multi-select-context';
import type { Data } from '@puckeditor/core';

export interface MultiSelectToolbarProps {
  getData: () => Data;
  getDispatch: () => ((action: Record<string, unknown>) => void) | null;
}

/**
 * Floating toolbar that appears when multiple components are selected.
 * Shows copy, cut, paste, and delete actions with a selection count badge.
 */
export function MultiSelectToolbar({ getData, getDispatch }: MultiSelectToolbarProps) {
  const {
    selectedIds,
    isMultiSelectActive,
    hasClipboard,
    copy,
    cut,
    paste,
    deleteSelected,
  } = useMultiSelect();

  if (!isMultiSelectActive && !hasClipboard) return null;
  if (selectedIds.size === 0 && !hasClipboard) return null;

  const dispatch = getDispatch();
  const count = selectedIds.size;

  return (
    <div
      className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-lg border bg-background/95 px-2 py-1.5 shadow-lg backdrop-blur-sm"
      data-testid="multi-select-toolbar"
    >
      {count > 0 && (
        <span className="text-xs font-medium text-muted-foreground px-2" data-testid="selection-count">
          {count} selected
        </span>
      )}

      {count > 0 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            data-testid="multi-select-copy"
            onClick={() => copy(getData())}
            className="h-7 px-2 gap-1 text-xs"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>

          <Button
            variant="ghost"
            size="sm"
            data-testid="multi-select-cut"
            onClick={() => {
              if (dispatch) cut(dispatch, getData());
            }}
            className="h-7 px-2 gap-1 text-xs"
          >
            <Scissors className="h-3.5 w-3.5" />
            Cut
          </Button>
        </>
      )}

      {hasClipboard && (
        <Button
          variant="ghost"
          size="sm"
          data-testid="multi-select-paste"
          onClick={() => {
            if (dispatch) paste(dispatch, getData());
          }}
          className="h-7 px-2 gap-1 text-xs"
        >
          <Clipboard className="h-3.5 w-3.5" />
          Paste
        </Button>
      )}

      {count > 0 && (
        <Button
          variant="ghost"
          size="sm"
          data-testid="multi-select-delete"
          onClick={() => {
            if (dispatch) {
              deleteSelected(dispatch, getData());
              dispatch({ type: 'setUi', ui: { itemSelector: null } });
            }
          }}
          className="h-7 px-2 gap-1 text-xs text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      )}
    </div>
  );
}
