'use client';

import * as React from 'react';
import { useCallback, useRef, useState, createContext, useContext, useMemo } from 'react';
import type { ComponentData, Data } from '@puckeditor/core';
import type { ClipboardPayload } from './clipboard';
import {
  batchRemove,
  batchPaste,
  copySelected,
  cutSelected,
  getPasteInsertIndex,
  selectAllIds,
} from './multi-select-actions';

// ─── Types ───────────────────────────────────────────────────────────────────

type PuckDispatch = (action: Record<string, unknown>) => void;

export interface MultiSelectState {
  /** Set of currently selected component IDs */
  selectedIds: Set<string>;
  /** Whether the multi-select mode is active (more than 1 item selected) */
  isMultiSelectActive: boolean;
  /** Whether the clipboard has content to paste */
  hasClipboard: boolean;
}

export interface MultiSelectActions {
  /** Toggle a component's selection (Ctrl/Cmd+Click) */
  toggleSelect: (id: string) => void;
  /** Add a range of components to the selection (Shift+Click) */
  selectRange: (targetId: string, content: ComponentData[]) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Check if a component is selected */
  isSelected: (id: string) => boolean;
  /** Select all top-level components */
  selectAll: (content: ComponentData[]) => void;
  /** Copy selected components to clipboard */
  copy: (data: Data) => void;
  /** Cut selected components (copy + remove) */
  cut: (dispatch: PuckDispatch, data: Data) => void;
  /** Paste from clipboard */
  paste: (dispatch: PuckDispatch, data: Data) => void;
  /** Delete all selected components */
  deleteSelected: (dispatch: PuckDispatch, data: Data) => void;
}

export type MultiSelectContextValue = MultiSelectState & MultiSelectActions;

// ─── Context ─────────────────────────────────────────────────────────────────

const MultiSelectContext = createContext<MultiSelectContextValue | null>(null);

/**
 * Hook to access the multi-select context.
 * Must be used within a MultiSelectProvider.
 */
export function useMultiSelect(): MultiSelectContextValue {
  const ctx = useContext(MultiSelectContext);
  if (!ctx) {
    throw new Error('useMultiSelect must be used within a MultiSelectProvider');
  }
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export interface MultiSelectProviderProps {
  children: React.ReactNode;
}

/**
 * Provides multi-select and clipboard state to the studio editor.
 * Must wrap the Puck editor component. State is stored outside Puck
 * so it survives page switches (Puck remounts with key={pageId}).
 */
export function MultiSelectProvider({ children }: MultiSelectProviderProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const clipboardRef = useRef<ClipboardPayload | null>(null);
  const [hasClipboard, setHasClipboard] = useState(false);

  // Track last selected ID for Shift+Click range selection
  const lastSelectedIdRef = useRef<string | null>(null);

  const isMultiSelectActive = selectedIds.size > 1;

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      lastSelectedIdRef.current = id;
      return next;
    });
  }, []);

  const selectRange = useCallback(
    (targetId: string, content: ComponentData[]) => {
      const lastId = lastSelectedIdRef.current;
      if (!lastId) {
        // No anchor — just toggle the target
        setSelectedIds(new Set([targetId]));
        lastSelectedIdRef.current = targetId;
        return;
      }

      // Find indices of anchor and target
      const anchorIdx = content.findIndex((item) => item.props.id === lastId);
      const targetIdx = content.findIndex((item) => item.props.id === targetId);

      if (anchorIdx === -1 || targetIdx === -1) {
        setSelectedIds(new Set([targetId]));
        lastSelectedIdRef.current = targetId;
        return;
      }

      const start = Math.min(anchorIdx, targetIdx);
      const end = Math.max(anchorIdx, targetIdx);

      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (let i = start; i <= end; i++) {
          next.add(content[i].props.id);
        }
        return next;
      });
      // Keep the anchor for subsequent range selects
    },
    [],
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    lastSelectedIdRef.current = null;
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  const selectAllFn = useCallback((content: ComponentData[]) => {
    setSelectedIds(selectAllIds(content));
  }, []);

  const copy = useCallback(
    (data: Data) => {
      if (selectedIds.size === 0) return;
      clipboardRef.current = copySelected(data, selectedIds);
      setHasClipboard(true);
    },
    [selectedIds],
  );

  const cut = useCallback(
    (dispatch: PuckDispatch, data: Data) => {
      if (selectedIds.size === 0) return;
      clipboardRef.current = cutSelected(dispatch, data, selectedIds);
      setHasClipboard(true);
      setSelectedIds(new Set());
      lastSelectedIdRef.current = null;
    },
    [selectedIds],
  );

  const paste = useCallback(
    (dispatch: PuckDispatch, data: Data) => {
      const clipboard = clipboardRef.current;
      if (!clipboard || clipboard.items.length === 0) return;

      const insertIndex = getPasteInsertIndex(data.content, selectedIds);
      batchPaste(dispatch, data, clipboard, insertIndex);
    },
    [selectedIds],
  );

  const deleteSelected = useCallback(
    (dispatch: PuckDispatch, data: Data) => {
      if (selectedIds.size === 0) return;
      batchRemove(dispatch, data, selectedIds);
      setSelectedIds(new Set());
      lastSelectedIdRef.current = null;
    },
    [selectedIds],
  );

  const value = useMemo<MultiSelectContextValue>(
    () => ({
      selectedIds,
      isMultiSelectActive,
      hasClipboard,
      toggleSelect,
      selectRange,
      clearSelection,
      isSelected,
      selectAll: selectAllFn,
      copy,
      cut,
      paste,
      deleteSelected,
    }),
    [
      selectedIds,
      isMultiSelectActive,
      hasClipboard,
      toggleSelect,
      selectRange,
      clearSelection,
      isSelected,
      selectAllFn,
      copy,
      cut,
      paste,
      deleteSelected,
    ],
  );

  return (
    <MultiSelectContext.Provider value={value}>
      {children}
    </MultiSelectContext.Provider>
  );
}
