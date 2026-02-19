'use client';

import { useMultiSelect } from '@/hooks/use-multi-select';

/**
 * Injects a <style> element that visually highlights all multi-selected components
 * using CSS attribute selectors targeting [data-puck-component="id"].
 *
 * Only renders when 2+ components are selected (isMultiSelected).
 * Uses CSS approach to avoid positional calculations and z-index conflicts.
 */
export function SelectionHighlight() {
  const { state, isMultiSelected } = useMultiSelect();

  if (!isMultiSelected) return null;

  const ids = Array.from(state.selectedIds);
  const selector = ids.map((id) => `[data-puck-component="${id}"]`).join(', ');

  return (
    <style>{`
      ${selector} {
        outline: 2px solid rgba(59, 130, 246, 0.6) !important;
        outline-offset: -1px;
      }
      ${selector}::after {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(59, 130, 246, 0.04);
        pointer-events: none;
        z-index: 1;
      }
    `}</style>
  );
}
