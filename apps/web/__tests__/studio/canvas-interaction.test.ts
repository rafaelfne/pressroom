import { describe, it, expect } from 'vitest';
import { rectsIntersect } from '@/hooks/use-component-rects';

describe('Canvas Interaction Utilities', () => {
  describe('rectsIntersect', () => {
    it('returns true when rectangles overlap', () => {
      const a = { left: 0, top: 0, right: 100, bottom: 100 };
      const b = { left: 50, top: 50, right: 150, bottom: 150 };

      expect(rectsIntersect(a, b)).toBe(true);
    });

    it('returns true when one rectangle is inside the other', () => {
      const a = { left: 0, top: 0, right: 200, bottom: 200 };
      const b = { left: 50, top: 50, right: 100, bottom: 100 };

      expect(rectsIntersect(a, b)).toBe(true);
    });

    it('returns false when rectangles are side by side', () => {
      const a = { left: 0, top: 0, right: 100, bottom: 100 };
      const b = { left: 200, top: 0, right: 300, bottom: 100 };

      expect(rectsIntersect(a, b)).toBe(false);
    });

    it('returns false when rectangles are stacked vertically with gap', () => {
      const a = { left: 0, top: 0, right: 100, bottom: 100 };
      const b = { left: 0, top: 200, right: 100, bottom: 300 };

      expect(rectsIntersect(a, b)).toBe(false);
    });

    it('returns true when rectangles share an edge', () => {
      const a = { left: 0, top: 0, right: 100, bottom: 100 };
      const b = { left: 100, top: 0, right: 200, bottom: 100 };

      expect(rectsIntersect(a, b)).toBe(true);
    });

    it('returns true for identical rectangles', () => {
      const a = { left: 50, top: 50, right: 150, bottom: 150 };

      expect(rectsIntersect(a, a)).toBe(true);
    });

    it('handles marquee-like small selection rectangle', () => {
      // Simulate a small marquee selection that only covers a portion of a component
      const marquee = { left: 60, top: 60, right: 80, bottom: 80 };
      const component = { left: 0, top: 0, right: 200, bottom: 100 };

      expect(rectsIntersect(marquee, component)).toBe(true);
    });

    it('returns false when marquee misses component', () => {
      const marquee = { left: 300, top: 300, right: 400, bottom: 400 };
      const component = { left: 0, top: 0, right: 200, bottom: 100 };

      expect(rectsIntersect(marquee, component)).toBe(false);
    });
  });
});

describe('findPuckItemSelector', () => {
  // Import tested indirectly through the integration, but we can test the logic
  const PUCK_ROOT_ZONE = 'root:default-zone';

  function findPuckItemSelector(
    data: { content: Array<{ props: { id: string } }>; zones?: Record<string, Array<{ props: { id: string } }>> },
    componentId: string,
  ): { zone: string; index: number } | null {
    const rootIndex = (data.content || []).findIndex(
      (c) => c.props.id === componentId,
    );
    if (rootIndex !== -1) {
      return { zone: PUCK_ROOT_ZONE, index: rootIndex };
    }

    for (const [zoneKey, components] of Object.entries(data.zones || {})) {
      const idx = components.findIndex((c) => c.props.id === componentId);
      if (idx !== -1) {
        return { zone: zoneKey, index: idx };
      }
    }

    return null;
  }

  it('finds component in root content', () => {
    const data = {
      content: [
        { props: { id: 'comp-1' } },
        { props: { id: 'comp-2' } },
        { props: { id: 'comp-3' } },
      ],
    };

    expect(findPuckItemSelector(data, 'comp-2')).toEqual({
      zone: 'root:default-zone',
      index: 1,
    });
  });

  it('finds component in a zone', () => {
    const data = {
      content: [{ props: { id: 'comp-1' } }],
      zones: {
        'comp-1-slot': [
          { props: { id: 'nested-1' } },
          { props: { id: 'nested-2' } },
        ],
      },
    };

    expect(findPuckItemSelector(data, 'nested-2')).toEqual({
      zone: 'comp-1-slot',
      index: 1,
    });
  });

  it('returns null for non-existent component', () => {
    const data = {
      content: [{ props: { id: 'comp-1' } }],
    };

    expect(findPuckItemSelector(data, 'non-existent')).toBeNull();
  });

  it('prefers root content over zones for same ID', () => {
    const data = {
      content: [{ props: { id: 'comp-1' } }],
      zones: {
        'parent-slot': [{ props: { id: 'comp-1' } }],
      },
    };

    const result = findPuckItemSelector(data, 'comp-1');
    expect(result?.zone).toBe('root:default-zone');
    expect(result?.index).toBe(0);
  });

  it('returns first root index when component is at position 0', () => {
    const data = {
      content: [{ props: { id: 'first' } }],
    };

    expect(findPuckItemSelector(data, 'first')).toEqual({
      zone: 'root:default-zone',
      index: 0,
    });
  });
});
