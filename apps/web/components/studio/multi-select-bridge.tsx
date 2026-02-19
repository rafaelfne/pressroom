'use client';

import { useEffect, useCallback, useRef } from 'react';
import type { createUsePuck, Data } from '@puckeditor/core';
import { useMultiSelect } from '@/lib/puck/multi-select-context';
import { useMultiSelectKeyboard } from '@/lib/puck/use-multi-select-keyboard';
import { useMultiSelectHighlight } from '@/lib/puck/use-multi-select-highlight';

interface MultiSelectBridgeProps {
  usePuck: ReturnType<typeof createUsePuck>;
  dataRef: React.MutableRefObject<Data>;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  /** Optional external ref to expose Puck's dispatch outside the Puck tree */
  dispatchRef?: React.MutableRefObject<((action: Record<string, unknown>) => void) | null>;
}

/**
 * Bridge component that lives inside Puck's component tree and connects
 * the multi-select system with Puck's internal state.
 *
 * Responsibilities:
 * - Wire keyboard shortcuts to Puck's dispatch
 * - Sync DOM highlights for multi-selected components
 * - Intercept Ctrl/Shift+Click on component overlays for multi-select
 * - Clear Puck's itemSelector when multi-select is active
 */
export function MultiSelectBridge({
  usePuck,
  dataRef,
  wrapperRef,
  dispatchRef: externalDispatchRef,
}: MultiSelectBridgeProps) {
  const dispatch = usePuck((s) => s.dispatch);
  const multiSelect = useMultiSelect();
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  // Expose dispatch to the external ref (for toolbar outside Puck tree)
  useEffect(() => {
    if (externalDispatchRef) {
      externalDispatchRef.current = dispatch;
    }
    return () => {
      if (externalDispatchRef) {
        externalDispatchRef.current = null;
      }
    };
  }, [dispatch, externalDispatchRef]);

  // Wire keyboard shortcuts
  const getDispatch = useCallback(() => dispatchRef.current, []);
  const getData = useCallback(() => dataRef.current, [dataRef]);

  useMultiSelectKeyboard({
    multiSelect,
    getDispatch,
    getData,
    enabled: true,
  });

  // Sync DOM highlights
  useMultiSelectHighlight(multiSelect.selectedIds);

  // When multi-select has >1 items, clear Puck's single item selector
  useEffect(() => {
    if (multiSelect.isMultiSelectActive) {
      dispatch({ type: 'setUi', ui: { itemSelector: null } });
    }
  }, [multiSelect.isMultiSelectActive, dispatch]);

  // Intercept Ctrl/Shift+Click on component overlays
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleClick = (e: MouseEvent) => {
      const isModifier = e.metaKey || e.ctrlKey || e.shiftKey;
      if (!isModifier) {
        // Normal click — if user clicks somewhere, clear multi-select if active
        if (multiSelect.selectedIds.size > 0) {
          // Check if we clicked a component overlay (Puck manages it)
          const target = e.target as HTMLElement;
          const overlay = target.closest('[data-puck-overlay]');
          if (overlay || !target.closest('[data-puck-component]')) {
            // Clicked outside components or on overlay — clear (if not on a specific component)
            // But only if we're not clicking a Puck component (which Puck handles itself)
            if (!overlay) {
              multiSelect.clearSelection();
            }
          }
        }
        return;
      }

      // Find the component element this click targets
      const target = e.target as HTMLElement;

      // Try to find the puck component wrapper
      const componentEl =
        target.closest('[data-puck-component]') ||
        findComponentFromOverlay(target);

      if (!componentEl) return;

      const componentId = componentEl.getAttribute('data-puck-component');
      if (!componentId) return;

      // Prevent Puck from handling this click (which would do single-select)
      e.stopPropagation();
      e.preventDefault();

      if (e.shiftKey) {
        // Range select
        const data = dataRef.current;
        multiSelect.selectRange(componentId, data.content);
      } else {
        // Toggle select (Ctrl/Cmd+Click)
        multiSelect.toggleSelect(componentId);
      }
    };

    // Use capture phase to intercept before Puck's handlers
    wrapper.addEventListener('click', handleClick, { capture: true });
    return () => wrapper.removeEventListener('click', handleClick, { capture: true });
  }, [wrapperRef, multiSelect, dataRef]);

  return null;
}

/**
 * When clicking on Puck's overlay (which sits above the component),
 * find the corresponding component element by looking at nearby elements
 * or the overlay's data attributes.
 */
function findComponentFromOverlay(target: HTMLElement): Element | null {
  // Puck overlays may have reference to the component they cover
  const overlay = target.closest('[data-puck-overlay]');
  if (!overlay) return null;

  // The overlay is positioned over a component — try to get the component ID
  // from sibling or parent structure. Puck generates overlays near the component.
  // Fallback: look for component elements in the same parent
  const parent = overlay.parentElement;
  if (parent) {
    const component = parent.querySelector('[data-puck-component]');
    if (component) return component;
  }

  return null;
}
