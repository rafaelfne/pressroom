'use client';

import { useMultiSelect } from '@/hooks/use-multi-select';

/**
 * Renders the marquee selection rectangle overlay.
 * Positioned absolutely over the canvas workspace.
 * Only visible when the user is actively dragging a selection rectangle.
 */
export function MarqueeSelection() {
  const { state } = useMultiSelect();

  if (!state.marquee) {
    return null;
  }

  const { startX, startY, currentX, currentY } = state.marquee;

  // Calculate rectangle bounds (handle dragging in any direction)
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  return (
    <div
      data-testid="marquee-selection"
      className="pointer-events-none absolute z-50"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.4)',
      }}
    />
  );
}
