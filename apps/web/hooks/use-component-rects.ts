'use client';

import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook that provides a mapping of Puck component IDs to their DOM bounding rectangles.
 * Used for marquee selection hit-testing.
 * 
 * Since Puck uses iframe: false, components are in the same document and
 * we can query them directly via [data-puck-component] attributes.
 */
export function useComponentRects(canvasRef: React.RefObject<HTMLElement | null>): {
  rectsRef: React.RefObject<Map<string, DOMRect>>;
  refreshRects: () => void;
} {
  const rectsRef = useRef<Map<string, DOMRect>>(new Map());

  const refreshRects = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      rectsRef.current = new Map();
      return;
    }

    const newRects = new Map<string, DOMRect>();
    
    // Puck renders each component with data attributes
    // The selector matches Puck's component wrapper elements
    const elements = canvas.querySelectorAll<HTMLElement>('[data-puck-component]');
    
    for (const el of elements) {
      // Puck component wrappers have data-puck-component with the component ID
      const componentId = el.getAttribute('data-puck-component');
      if (componentId) {
        newRects.set(componentId, el.getBoundingClientRect());
      }
    }

    rectsRef.current = newRects;
  }, [canvasRef]);

  // Refresh rects when the component mounts and on resize
  useEffect(() => {
    refreshRects();
    
    const handleResize = () => refreshRects();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [refreshRects]);

  return { rectsRef, refreshRects };
}

/**
 * Check if two rectangles intersect.
 */
export function rectsIntersect(
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number }
): boolean {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}
