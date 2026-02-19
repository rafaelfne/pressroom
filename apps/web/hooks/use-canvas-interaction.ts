'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useMultiSelect } from '@/hooks/use-multi-select';
import { useComponentRects, rectsIntersect } from '@/hooks/use-component-rects';

export interface UseCanvasInteractionOptions {
  /** Ref to the scrollable workspace container (for marquee coordinate calculations) */
  canvasRef: React.RefObject<HTMLElement | null>;
  /** Callback when context menu should open */
  onContextMenu?: (position: { x: number; y: number }) => void;
  /** Whether interactions are enabled */
  enabled?: boolean;
}

/**
 * Finds the Puck component ID from a DOM element by traversing up to the
 * closest [data-puck-component] ancestor.
 */
function findComponentId(el: HTMLElement): string | null {
  const componentEl = el.closest<HTMLElement>('[data-puck-component]');
  return componentEl?.getAttribute('data-puck-component') ?? null;
}

/**
 * Check if an element is inside an editable area (input, textarea, contentEditable)
 */
function isInEditable(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea') return true;
  if (el.isContentEditable) return true;
  const editableParent = el.closest('[contenteditable="true"], input, textarea');
  return editableParent !== null;
}

/**
 * Hook that manages canvas interactions for multi-selection:
 * - Capture-phase click interception for Ctrl/Cmd+Click component selection
 * - Marquee (drag-to-select) rectangle on empty canvas areas
 * - Right-click context menu
 *
 * Must be used within a MultiSelectProvider.
 */
export function useCanvasInteraction({
  canvasRef,
  onContextMenu,
  enabled = true,
}: UseCanvasInteractionOptions): void {
  const { state, dispatch } = useMultiSelect();
  const stateRef = useRef(state);
  stateRef.current = state;

  const onContextMenuRef = useRef(onContextMenu);
  onContextMenuRef.current = onContextMenu;

  // Track whether a marquee just ended to suppress the subsequent click
  const marqueeJustEndedRef = useRef(false);

  // Track whether we're currently in a marquee drag
  const isDraggingMarqueeRef = useRef(false);

  // Minimum distance in pixels before a mousedown becomes a marquee drag
  const MARQUEE_THRESHOLD = 5;
  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);

  // Component rects for marquee hit-testing
  const { rectsRef, refreshRects } = useComponentRects(canvasRef);

  // --- Click interception (capture phase) ---
  const handleClickCapture = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Skip if in an editable element
      if (isInEditable(target)) return;

      // If a marquee just finished, suppress the click to prevent Puck deselecting
      if (marqueeJustEndedRef.current) {
        marqueeJustEndedRef.current = false;
        e.stopPropagation();
        return;
      }

      const isModKey = e.ctrlKey || e.metaKey || e.shiftKey;
      const componentId = findComponentId(target);

      if (isModKey && componentId) {
        // Ctrl/Cmd/Shift+Click on a component: toggle multi-selection
        e.stopPropagation();
        e.preventDefault();
        dispatch({ type: 'TOGGLE_SELECTION', id: componentId });
        return;
      }

      if (!isModKey && stateRef.current.selectedIds.size > 1) {
        // Normal click with active multi-selection: clear multi-select, let Puck handle
        dispatch({ type: 'CLEAR_SELECTION' });
        return;
      }
    },
    [dispatch],
  );

  // --- Marquee selection (drag on empty canvas) ---
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left click
      if (!enabled) return;

      const target = e.target as HTMLElement;

      // Don't start marquee on: components, drawers, overlays, editables, toolbars
      if (target.closest('[data-puck-component]')) return;
      if (target.closest('[data-puck-drawer]')) return;
      if (target.closest('[data-puck-overlay]')) return;
      if (target.closest('[data-puck-overlay-portal]')) return;
      if (isInEditable(target)) return;
      // Don't start marquee on UI elements outside the canvas content area
      if (target.closest('[data-testid="zoom-toolbar"]')) return;
      if (target.closest('button')) return;

      const workspace = canvasRef.current;
      if (!workspace) return;

      // Only start if the click is inside the workspace
      if (!workspace.contains(target)) return;

      const wsRect = workspace.getBoundingClientRect();
      const startX = e.clientX - wsRect.left + workspace.scrollLeft;
      const startY = e.clientY - wsRect.top + workspace.scrollTop;

      marqueeStartRef.current = { x: startX, y: startY };
      isDraggingMarqueeRef.current = false;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!marqueeStartRef.current) return;

        const currentX = moveEvent.clientX - wsRect.left + workspace.scrollLeft;
        const currentY = moveEvent.clientY - wsRect.top + workspace.scrollTop;

        // Check if drag exceeds threshold before starting marquee
        if (!isDraggingMarqueeRef.current) {
          const distance = Math.sqrt(
            (currentX - marqueeStartRef.current.x) ** 2 +
              (currentY - marqueeStartRef.current.y) ** 2,
          );
          if (distance < MARQUEE_THRESHOLD) return;

          // Start the marquee
          isDraggingMarqueeRef.current = true;
          dispatch({
            type: 'START_MARQUEE',
            x: marqueeStartRef.current.x,
            y: marqueeStartRef.current.y,
            additive: moveEvent.shiftKey,
          });
        }

        dispatch({
          type: 'UPDATE_MARQUEE',
          x: currentX,
          y: currentY,
        });
      };

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);

        if (isDraggingMarqueeRef.current) {
          // Refresh component rects for accurate hit-testing
          refreshRects();

          const marquee = stateRef.current.marquee;
          if (marquee) {
            // Convert marquee coordinates (workspace-relative) to viewport coordinates
            const left = Math.min(marquee.startX, marquee.currentX);
            const top = Math.min(marquee.startY, marquee.currentY);
            const right = Math.max(marquee.startX, marquee.currentX);
            const bottom = Math.max(marquee.startY, marquee.currentY);

            const marqueeViewport = {
              left: left - workspace.scrollLeft + wsRect.left,
              top: top - workspace.scrollTop + wsRect.top,
              right: right - workspace.scrollLeft + wsRect.left,
              bottom: bottom - workspace.scrollTop + wsRect.top,
            };

            // Find all components whose bounding rects intersect the marquee
            const intersectedIds: string[] = [];
            for (const [componentId, rect] of rectsRef.current.entries()) {
              if (
                rectsIntersect(marqueeViewport, {
                  left: rect.left,
                  top: rect.top,
                  right: rect.right,
                  bottom: rect.bottom,
                })
              ) {
                intersectedIds.push(componentId);
              }
            }

            dispatch({ type: 'END_MARQUEE', intersectedIds });
          }

          // Suppress the click event that follows mouseup
          marqueeJustEndedRef.current = true;
          setTimeout(() => {
            marqueeJustEndedRef.current = false;
          }, 0);
        }

        marqueeStartRef.current = null;
        isDraggingMarqueeRef.current = false;
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [enabled, canvasRef, dispatch, refreshRects, rectsRef],
  );

  // --- Right-click context menu ---
  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const componentId = findComponentId(target);

      // Show context menu if right-clicking on a selected component or has multi-selection
      if (
        (componentId && stateRef.current.selectedIds.has(componentId)) ||
        stateRef.current.selectedIds.size > 0
      ) {
        e.preventDefault();
        e.stopPropagation();

        // If right-clicking on an unselected component with no modifier, select it first
        if (componentId && !stateRef.current.selectedIds.has(componentId)) {
          dispatch({ type: 'SELECT_ONE', id: componentId });
        }

        onContextMenuRef.current?.({ x: e.clientX, y: e.clientY });
      }
    },
    [dispatch],
  );

  // --- Attach/detach event listeners ---
  useEffect(() => {
    if (!enabled) return;

    // Find the Puck preview container
    const previewEl = document.querySelector<HTMLElement>('[data-puck-preview]');
    if (!previewEl) return;

    // Capture-phase click listener fires before Puck's bubble-phase handlers
    previewEl.addEventListener('click', handleClickCapture, true);
    previewEl.addEventListener('contextmenu', handleContextMenu, true);

    // Marquee mousedown on the workspace
    const workspace = canvasRef.current;
    if (workspace) {
      workspace.addEventListener('mousedown', handleMouseDown);
    }

    return () => {
      previewEl.removeEventListener('click', handleClickCapture, true);
      previewEl.removeEventListener('contextmenu', handleContextMenu, true);
      if (workspace) {
        workspace.removeEventListener('mousedown', handleMouseDown);
      }
    };
  }, [enabled, handleClickCapture, handleContextMenu, handleMouseDown, canvasRef]);
}
