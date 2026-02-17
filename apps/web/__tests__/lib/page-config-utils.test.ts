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
    it('converts 210mm (A4 width in mm) to 595px at 72 DPI', () => {
      expect(mmToPx(210)).toBe(595);
    });

    it('converts 297mm (A4 height in mm) to 842px at 72 DPI', () => {
      expect(mmToPx(297)).toBe(842);
    });

    it('converts 0mm to 0px', () => {
      expect(mmToPx(0)).toBe(0);
    });

    it('converts 25.4mm (1 inch) to 72px', () => {
      expect(mmToPx(25.4)).toBe(72);
    });
  });

  describe('getPageDimensionsPx', () => {
    it('returns correct A4 portrait dimensions (72 DPI, same as stored)', () => {
      const config = {
        ...DEFAULT_PAGE_CONFIG,
        paperSize: 'A4' as const,
        orientation: 'portrait' as const,
      };
      const dimensions = getPageDimensionsPx(config);
      // 72 DPI storage = 72 DPI screen display (1:1 mapping)
      expect(dimensions.width).toBe(595);
      expect(dimensions.height).toBe(842);
    });

    it('returns correct A4 landscape dimensions in screen pixels (swapped)', () => {
      const config = {
        ...DEFAULT_PAGE_CONFIG,
        paperSize: 'A4' as const,
        orientation: 'landscape' as const,
      };
      const dimensions = getPageDimensionsPx(config);
      expect(dimensions.width).toBe(842);
      expect(dimensions.height).toBe(595);
    });

    it('returns correct Letter portrait dimensions', () => {
      const config = {
        ...DEFAULT_PAGE_CONFIG,
        paperSize: 'Letter' as const,
        orientation: 'portrait' as const,
      };
      const dimensions = getPageDimensionsPx(config);
      // 72 DPI storage = 72 DPI screen display (1:1 mapping)
      expect(dimensions.width).toBe(612);
      expect(dimensions.height).toBe(792);
    });
  });

  describe('pxToScreen', () => {
    it('returns same value (1:1 mapping at 72 DPI)', () => {
      // With 72 DPI screen, pxToScreen is 1:1
      expect(pxToScreen(72)).toBe(72);
    });

    it('returns A4 width unchanged', () => {
      expect(pxToScreen(595)).toBe(595);
    });

    it('converts 0 to 0', () => {
      expect(pxToScreen(0)).toBe(0);
    });
  });

  describe('Constants', () => {
    it('MM_TO_PX is 72/25.4 (approximately 2.835)', () => {
      expect(MM_TO_PX).toBeCloseTo(2.835, 2);
    });

    it('DPI_TO_SCREEN is 1 (72/72, no scaling)', () => {
      expect(DPI_TO_SCREEN).toBe(1);
    });

    it('ZOOM_LEVELS has 5 entries (50, 75, 100, 125, 150)', () => {
      expect(ZOOM_LEVELS).toHaveLength(5);
      expect(ZOOM_LEVELS).toEqual([50, 75, 100, 125, 150]);
    });
  });
});
