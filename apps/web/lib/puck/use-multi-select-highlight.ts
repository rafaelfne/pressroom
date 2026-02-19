'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook that syncs the multi-select visual highlight state with the DOM.
 * Sets `data-multi-selected="true"` on Puck component elements whose
 * IDs are in the selected set, and removes it from the rest.
 *
 * Uses Puck's internal `[data-puck-component]` attribute to find elements.
 */
export function useMultiSelectHighlight(selectedIds: Set<string>): void {
  const prevIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const prevIds = prevIdsRef.current;

    // IDs that were deselected — remove highlight
    for (const id of prevIds) {
      if (!selectedIds.has(id)) {
        const el = document.querySelector(`[data-puck-component="${id}"]`);
        if (el) {
          el.removeAttribute('data-multi-selected');
        }
      }
    }

    // IDs that are newly selected — add highlight
    for (const id of selectedIds) {
      if (!prevIds.has(id)) {
        const el = document.querySelector(`[data-puck-component="${id}"]`);
        if (el) {
          el.setAttribute('data-multi-selected', 'true');
        }
      }
    }

    prevIdsRef.current = new Set(selectedIds);
  }, [selectedIds]);

  // Cleanup on unmount — remove all highlights
  useEffect(() => {
    return () => {
      const elements = document.querySelectorAll('[data-multi-selected]');
      elements.forEach((el) => el.removeAttribute('data-multi-selected'));
    };
  }, []);
}
