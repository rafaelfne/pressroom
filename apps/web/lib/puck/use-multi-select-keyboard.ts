'use client';

import { useEffect, useRef } from 'react';
import type { Data } from '@puckeditor/core';
import type { MultiSelectContextValue } from './multi-select-context';

type PuckDispatch = (action: Record<string, unknown>) => void;

/**
 * Check if the active element is an input, textarea, or contenteditable.
 * When true, keyboard shortcuts should not be intercepted.
 */
function isEditableElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea') return true;
  if (target.isContentEditable) return true;
  // Also check for elements inside a rich text editor
  if (target.closest('[contenteditable="true"]')) return true;
  return false;
}

interface UseMultiSelectKeyboardOptions {
  multiSelect: MultiSelectContextValue;
  getDispatch: () => PuckDispatch | null;
  getData: () => Data;
  /** Whether the keyboard shortcuts should be active */
  enabled?: boolean;
}

/**
 * Hook that registers keyboard shortcuts for multi-select operations.
 *
 * Shortcuts:
 * - Ctrl/Cmd+C: Copy selected components
 * - Ctrl/Cmd+X: Cut selected components
 * - Ctrl/Cmd+V: Paste from clipboard
 * - Ctrl/Cmd+A: Select all components
 * - Delete/Backspace: Delete selected components
 * - Escape: Clear selection
 */
export function useMultiSelectKeyboard({
  multiSelect,
  getDispatch,
  getData,
  enabled = true,
}: UseMultiSelectKeyboardOptions): void {
  // Use refs to always have the latest values without re-registering the listener
  const multiSelectRef = useRef(multiSelect);
  multiSelectRef.current = multiSelect;

  const getDispatchRef = useRef(getDispatch);
  getDispatchRef.current = getDispatch;

  const getDataRef = useRef(getData);
  getDataRef.current = getData;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when editing text
      if (isEditableElement(e.target)) return;

      const ms = multiSelectRef.current;
      const isMeta = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd+C — Copy
      if (isMeta && e.key === 'c' && !e.shiftKey) {
        if (ms.selectedIds.size > 0) {
          e.preventDefault();
          e.stopPropagation();
          ms.copy(getDataRef.current());
        }
        return;
      }

      // Ctrl/Cmd+X — Cut
      if (isMeta && e.key === 'x' && !e.shiftKey) {
        if (ms.selectedIds.size > 0) {
          e.preventDefault();
          e.stopPropagation();
          const dispatch = getDispatchRef.current();
          if (dispatch) {
            ms.cut(dispatch, getDataRef.current());
          }
        }
        return;
      }

      // Ctrl/Cmd+V — Paste
      if (isMeta && e.key === 'v' && !e.shiftKey) {
        if (ms.hasClipboard) {
          e.preventDefault();
          e.stopPropagation();
          const dispatch = getDispatchRef.current();
          if (dispatch) {
            ms.paste(dispatch, getDataRef.current());
          }
        }
        return;
      }

      // Ctrl/Cmd+A — Select All
      if (isMeta && e.key === 'a' && !e.shiftKey) {
        const data = getDataRef.current();
        if (data.content.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          ms.selectAll(data.content);
          // Deselect Puck's single item selection
          const dispatch = getDispatchRef.current();
          if (dispatch) {
            dispatch({ type: 'setUi', ui: { itemSelector: null } });
          }
        }
        return;
      }

      // Delete / Backspace — Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (ms.selectedIds.size > 0) {
          e.preventDefault();
          e.stopPropagation();
          const dispatch = getDispatchRef.current();
          if (dispatch) {
            ms.deleteSelected(dispatch, getDataRef.current());
            dispatch({ type: 'setUi', ui: { itemSelector: null } });
          }
        }
        return;
      }

      // Escape — Clear selection
      if (e.key === 'Escape') {
        if (ms.selectedIds.size > 0) {
          e.preventDefault();
          ms.clearSelection();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [enabled]);
}
