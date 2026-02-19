'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { createUsePuck, Data } from '@puckeditor/core';
import { useMultiSelect } from '@/hooks/use-multi-select';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useCanvasInteraction } from '@/hooks/use-canvas-interaction';
import { SelectionContextMenu } from '@/components/studio/selection-context-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { collectAllIds, collectAllIdsDeep } from '@/lib/studio/multi-select-operations';
import { toast } from 'sonner';

/** Puck's root zone compound for root-level content */
const PUCK_ROOT_ZONE = 'root:default-zone';

export interface MultiSelectIntegrationProps {
  usePuck: ReturnType<typeof createUsePuck>;
  puckDataRef: React.MutableRefObject<Data>;
  templateId: string;
  activePageId: string;
  activePageName: string;
  canvasRef: React.RefObject<HTMLElement | null>;
}

/**
 * Finds the Puck itemSelector (zone + index) for a component by its ID.
 * Searches root content first, then all zones.
 */
function findPuckItemSelector(
  data: Data,
  componentId: string,
): { zone: string; index: number } | null {
  // Check root content
  const rootIndex = (data.content || []).findIndex(
    (c) => (c.props.id as string) === componentId,
  );
  if (rootIndex !== -1) {
    return { zone: PUCK_ROOT_ZONE, index: rootIndex };
  }

  // Check zones
  for (const [zoneKey, components] of Object.entries(data.zones || {})) {
    const idx = components.findIndex((c) => (c.props.id as string) === componentId);
    if (idx !== -1) {
      return { zone: zoneKey, index: idx };
    }
  }

  return null;
}

/**
 * Bridge component that integrates the multi-selection system with Puck.
 * Must be rendered inside Puck's component tree to access usePuck.
 *
 * Responsibilities:
 * - Wires keyboard shortcuts to Puck dispatch
 * - Wires canvas interactions (click selection, marquee, context menu)
 * - Syncs Puck's itemSelector with multi-select state
 * - Clears selection on page switches
 */
export function MultiSelectIntegration({
  usePuck,
  puckDataRef,
  templateId,
  activePageId,
  activePageName,
  canvasRef,
}: MultiSelectIntegrationProps) {
  const dispatch = usePuck((s) => s.dispatch);
  const { state, dispatch: multiSelectDispatch, isMultiSelected } = useMultiSelect();
  const prevPageId = useRef(activePageId);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    position: { x: number; y: number };
  }>({ open: false, position: { x: 0, y: 0 } });

  // Delete confirmation dialog state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    count: number;
    onConfirm: (() => void) | null;
  }>({ open: false, count: 0, onConfirm: null });

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

  // Delete confirmation callback — opens AlertDialog instead of window.confirm
  const handleDeleteConfirm = useCallback(
    (count: number, onConfirm: () => void) => {
      setDeleteConfirm({ open: true, count, onConfirm });
    },
    [],
  );

  // Wire up keyboard shortcuts
  useKeyboardShortcuts({
    getData,
    setData,
    templateId,
    activePageId,
    activePageName,
    onToast: handleToast,
    onDeleteConfirm: handleDeleteConfirm,
    enabled: true,
  });

  // Wire up canvas interactions (click selection, marquee, context menu)
  const handleContextMenuOpen = useCallback(
    (position: { x: number; y: number }) => {
      setContextMenu({ open: true, position });
    },
    [],
  );

  useCanvasInteraction({
    canvasRef,
    onContextMenu: handleContextMenuOpen,
    enabled: true,
  });

  // Sync: when selection becomes exactly 1 item, restore Puck's itemSelector
  useEffect(() => {
    if (state.selectedIds.size === 1) {
      const [selectedId] = state.selectedIds;
      const selector = findPuckItemSelector(puckDataRef.current, selectedId);
      if (selector) {
        dispatch({
          type: 'setUi',
          ui: { itemSelector: selector },
        });
      }
    }
  }, [state.selectedIds, dispatch, puckDataRef]);

  // Context menu action handlers - synthesize keyboard events to reuse shortcut logic
  const handleContextMenuClose = useCallback(() => {
    setContextMenu({ open: false, position: { x: 0, y: 0 } });
  }, []);

  const synthesizeKeyEvent = useCallback((key: string, ctrlKey = false) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, ctrlKey, metaKey: false, bubbles: true }));
  }, []);

  const handleCopy = useCallback(() => synthesizeKeyEvent('c', true), [synthesizeKeyEvent]);
  const handleCut = useCallback(() => synthesizeKeyEvent('x', true), [synthesizeKeyEvent]);
  const handlePaste = useCallback(() => synthesizeKeyEvent('v', true), [synthesizeKeyEvent]);
  const handleDuplicate = useCallback(() => synthesizeKeyEvent('d', true), [synthesizeKeyEvent]);
  const handleDelete = useCallback(() => synthesizeKeyEvent('Delete'), [synthesizeKeyEvent]);

  const handleSelectAll = useCallback(() => {
    const data = puckDataRef.current;
    const rootIds = collectAllIds(data);
    const allRootSelected =
      rootIds.length > 0 && rootIds.every((id) => state.selectedIds.has(id));

    if (allRootSelected) {
      const allIds = collectAllIdsDeep(data);
      multiSelectDispatch({ type: 'SELECT_ALL', allIds });
    } else {
      multiSelectDispatch({ type: 'SELECT_ALL', allIds: rootIds });
    }
  }, [puckDataRef, state.selectedIds, multiSelectDispatch]);

  return (
    <>
      <SelectionContextMenu
        open={contextMenu.open}
        position={contextMenu.position}
        onClose={handleContextMenuClose}
        onCopy={handleCopy}
        onCut={handleCut}
        onPaste={handlePaste}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onSelectAll={handleSelectAll}
        hasClipboard={state.clipboard !== null}
        hasSelection={state.selectedIds.size > 0}
      />

      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm({ open: false, count: 0, onConfirm: null });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteConfirm.count} components?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove {deleteConfirm.count} components from the page. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                deleteConfirm.onConfirm?.();
                setDeleteConfirm({ open: false, count: 0, onConfirm: null });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
