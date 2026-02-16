import { describe, it, expect } from 'vitest';
import {
  mmToPx,
  getPageDimensionsPx,
  MM_TO_PX,
  ZOOM_LEVELS,
  DEFAULT_PAGE_CONFIG,
} from '@/lib/types/page-config';

describe('Page Config Utilities', () => {
  describe('mmToPx', () => {
    it('converts 210mm (A4 width) to 794px', () => {
      expect(mmToPx(210)).toBe(794);
    });

    it('converts 297mm (A4 height) to 1123px', () => {
      expect(mmToPx(297)).toBe(1123);
    });

    it('converts 0mm to 0px', () => {
      expect(mmToPx(0)).toBe(0);
    });
  });

  describe('getPageDimensionsPx', () => {
    it('returns correct A4 portrait dimensions', () => {
      const config = {
        ...DEFAULT_PAGE_CONFIG,
        paperSize: 'A4' as const,
        orientation: 'portrait' as const,
      };
      const dimensions = getPageDimensionsPx(config);
      expect(dimensions.width).toBe(794); // 210mm
      expect(dimensions.height).toBe(1123); // 297mm
    });

    it('returns correct A4 landscape dimensions (swapped)', () => {
      const config = {
        ...DEFAULT_PAGE_CONFIG,
        paperSize: 'A4' as const,
        orientation: 'landscape' as const,
      };
      const dimensions = getPageDimensionsPx(config);
      expect(dimensions.width).toBe(1123); // 297mm (swapped)
      expect(dimensions.height).toBe(794); // 210mm (swapped)
    });

    it('returns correct Letter portrait dimensions', () => {
      const config = {
        ...DEFAULT_PAGE_CONFIG,
        paperSize: 'Letter' as const,
        orientation: 'portrait' as const,
      };
      const dimensions = getPageDimensionsPx(config);
      expect(dimensions.width).toBe(816); // 215.9mm
      expect(dimensions.height).toBe(1056); // 279.4mm
    });
  });

  describe('Constants', () => {
    it('MM_TO_PX is approximately 3.78', () => {
      expect(MM_TO_PX).toBeCloseTo(3.78, 1);
    });

    it('ZOOM_LEVELS has 5 entries (50, 75, 100, 125, 150)', () => {
      expect(ZOOM_LEVELS).toHaveLength(5);
      expect(ZOOM_LEVELS).toEqual([50, 75, 100, 125, 150]);
    });
  });
});
