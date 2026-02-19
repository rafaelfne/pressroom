import { describe, it, expect } from 'vitest';
import {
  mmToPx,
  pxToScreen,
  getPageDimensionsPx,
  MM_TO_PX,
  DPI_TO_SCREEN,
  ZOOM_LEVELS,
  DEFAULT_PAGE_CONFIG,
} from '@/lib/types/page-config';

describe('Page Config Utilities', () => {
  describe('mmToPx', () => {
    it('converts 210mm (A4 width in mm) to 794px at 96 DPI', () => {
      expect(mmToPx(210)).toBe(794);
    });

    it('converts 297mm (A4 height in mm) to 1123px at 96 DPI', () => {
      expect(mmToPx(297)).toBe(1123);
    });

    it('converts 0mm to 0px', () => {
      expect(mmToPx(0)).toBe(0);
    });

    it('converts 25.4mm (1 inch) to 96px', () => {
      expect(mmToPx(25.4)).toBe(96);
    });
  });

  describe('getPageDimensionsPx', () => {
    it('returns correct A4 portrait dimensions (96 DPI)', () => {
      const config = {
        ...DEFAULT_PAGE_CONFIG,
        paperSize: 'A4' as const,
        orientation: 'portrait' as const,
      };
      const dimensions = getPageDimensionsPx(config);
      // 96 DPI storage = 96 DPI screen display (1:1 mapping)
      expect(dimensions.width).toBe(794);
      expect(dimensions.height).toBe(1123);
    });

    it('returns correct A4 landscape dimensions in screen pixels (swapped)', () => {
      const config = {
        ...DEFAULT_PAGE_CONFIG,
        paperSize: 'A4' as const,
        orientation: 'landscape' as const,
      };
      const dimensions = getPageDimensionsPx(config);
      expect(dimensions.width).toBe(1123);
      expect(dimensions.height).toBe(794);
    });

    it('returns correct Letter portrait dimensions', () => {
      const config = {
        ...DEFAULT_PAGE_CONFIG,
        paperSize: 'Letter' as const,
        orientation: 'portrait' as const,
      };
      const dimensions = getPageDimensionsPx(config);
      // 96 DPI storage = 96 DPI screen display (1:1 mapping)
      expect(dimensions.width).toBe(816);
      expect(dimensions.height).toBe(1056);
    });
  });

  describe('pxToScreen', () => {
    it('returns same value (1:1 mapping at 96 DPI)', () => {
      // With 96 DPI screen, pxToScreen is 1:1
      expect(pxToScreen(96)).toBe(96);
    });

    it('returns A4 width unchanged', () => {
      expect(pxToScreen(794)).toBe(794);
    });

    it('converts 0 to 0', () => {
      expect(pxToScreen(0)).toBe(0);
    });
  });

  describe('Constants', () => {
    it('MM_TO_PX is 96/25.4 (approximately 3.78)', () => {
      expect(MM_TO_PX).toBeCloseTo(3.78, 2);
    });

    it('DPI_TO_SCREEN is 1 (96/96, no scaling)', () => {
      expect(DPI_TO_SCREEN).toBe(1);
    });

    it('ZOOM_LEVELS has 5 entries (50, 75, 100, 125, 150)', () => {
      expect(ZOOM_LEVELS).toHaveLength(5);
      expect(ZOOM_LEVELS).toEqual([50, 75, 100, 125, 150]);
    });
  });
});
