'use client';

import { useMultiSelect } from '@/hooks/use-multi-select';

/**
 * Displays the number of selected components as a floating badge.
 * Only visible when more than 1 component is selected (multi-selection).
 */
export function SelectionCountBadge() {
  const { selectedCount, isMultiSelected } = useMultiSelect();

  if (!isMultiSelected) {
    return null;
  }

  return (
    <div
      data-testid="selection-count-badge"
      className="absolute top-3 left-1/2 -translate-x-1/2 z-40 
        rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-md"
    >
      {selectedCount} selected
    </div>
  );
}
