'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { createUsePuck, Data } from '@puckeditor/core';
import { useMultiSelect } from '@/hooks/use-multi-select';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { toast } from 'sonner';

export interface MultiSelectIntegrationProps {
  usePuck: ReturnType<typeof createUsePuck>;
  puckDataRef: React.MutableRefObject<Data>;
  templateId: string;
  activePageId: string;
  activePageName: string;
}

/**
 * Bridge component that integrates the multi-selection system with Puck.
 * Must be rendered inside Puck's component tree to access usePuck.
 *
 * Responsibilities:
 * - Wires keyboard shortcuts to Puck dispatch
 * - Syncs Puck's itemSelector with multi-select state
 * - Clears selection on page switches
 */
export function MultiSelectIntegration({
  usePuck,
  puckDataRef,
  templateId,
  activePageId,
  activePageName,
}: MultiSelectIntegrationProps) {
  const dispatch = usePuck((s) => s.dispatch);
  const { state, dispatch: multiSelectDispatch, isMultiSelected } = useMultiSelect();
  const prevPageId = useRef(activePageId);

  // Clear selection when page switches
  useEffect(() => {
    if (prevPageId.current !== activePageId) {
      multiSelectDispatch({ type: 'CLEAR_SELECTION' });
      prevPageId.current = activePageId;
    }
  }, [activePageId, multiSelectDispatch]);

  // When multi-selection is active (>1), clear Puck's itemSelector to avoid conflicts
  useEffect(() => {
    if (isMultiSelected) {
      dispatch({
        type: 'setUi',
        ui: { itemSelector: null },
      });
    }
  }, [isMultiSelected, dispatch]);

  // Callback for keyboard shortcuts: get current data
  const getData = useCallback(() => puckDataRef.current, [puckDataRef]);

  // Callback for keyboard shortcuts: set data via Puck dispatch
  const setData = useCallback(
    (data: Data) => {
      dispatch({ type: 'setData', data });
    },
    [dispatch],
  );

  // Toast callback
  const handleToast = useCallback((message: string) => {
    toast.success(message);
  }, []);

  // Wire up keyboard shortcuts
  useKeyboardShortcuts({
    getData,
    setData,
    templateId,
    activePageId,
    activePageName,
    onToast: handleToast,
    enabled: true,
  });

  // Sync: when selection becomes exactly 1 item, restore Puck's itemSelector
  useEffect(() => {
    if (state.selectedIds.size === 1) {
      // We don't try to set itemSelector here because we don't have
      // the selector (zone + index) readily available. Puck's native
      // click handling will set it when the user clicks a single component.
    }
  }, [state.selectedIds.size]);

  return null;
}
