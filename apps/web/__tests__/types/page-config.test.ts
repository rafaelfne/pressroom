import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PAGE_CONFIG,
  PAPER_SIZES,
  MARGIN_PRESETS,
  getPageDimensions,
  detectMarginPreset,
  pageConfigToRenderOptions,
  mergePageConfig,
  parseStoredPageConfig,
  type PageConfig,
} from '@/lib/types/page-config';

describe('DEFAULT_PAGE_CONFIG', () => {
  it('has A4 paper size', () => {
    expect(DEFAULT_PAGE_CONFIG.paperSize).toBe('A4');
  });

  it('has portrait orientation', () => {
    expect(DEFAULT_PAGE_CONFIG.orientation).toBe('portrait');
  });

  it('has 16px margins on all sides (normal preset)', () => {
    expect(DEFAULT_PAGE_CONFIG.margins).toEqual({
      top: 16,
      right: 16,
      bottom: 16,
      left: 16,
    });
  });
});

describe('PAPER_SIZES', () => {
  it('contains A4, Letter, Legal, A3', () => {
    expect(PAPER_SIZES).toHaveProperty('A4');
    expect(PAPER_SIZES).toHaveProperty('Letter');
    expect(PAPER_SIZES).toHaveProperty('Legal');
    expect(PAPER_SIZES).toHaveProperty('A3');
  });

  it('A4 is 595 × 842 px', () => {
    expect(PAPER_SIZES.A4.width).toBe(595);
    expect(PAPER_SIZES.A4.height).toBe(842);
  });

  it('Letter is 612 × 792 px', () => {
    expect(PAPER_SIZES.Letter.width).toBe(612);
    expect(PAPER_SIZES.Letter.height).toBe(792);
  });

  it('Legal is 612 × 1008 px', () => {
    expect(PAPER_SIZES.Legal.width).toBe(612);
    expect(PAPER_SIZES.Legal.height).toBe(1008);
  });

  it('A3 is 842 × 1191 px', () => {
    expect(PAPER_SIZES.A3.width).toBe(842);
    expect(PAPER_SIZES.A3.height).toBe(1191);
  });

  it('all sizes have labels', () => {
    for (const key of Object.keys(PAPER_SIZES)) {
      const size = PAPER_SIZES[key as keyof typeof PAPER_SIZES];
      expect(size.label).toBeTruthy();
    }
  });
});

describe('MARGIN_PRESETS', () => {
  it('contains normal, narrow, wide', () => {
    expect(MARGIN_PRESETS).toHaveProperty('normal');
    expect(MARGIN_PRESETS).toHaveProperty('narrow');
    expect(MARGIN_PRESETS).toHaveProperty('wide');
  });

  it('normal has 16px margins', () => {
    expect(MARGIN_PRESETS.normal.margins).toEqual({
      top: 16, right: 16, bottom: 16, left: 16,
    });
  });

  it('narrow has 8px margins', () => {
    expect(MARGIN_PRESETS.narrow.margins).toEqual({
      top: 8, right: 8, bottom: 8, left: 8,
    });
  });

  it('wide has 24px margins', () => {
    expect(MARGIN_PRESETS.wide.margins).toEqual({
      top: 24, right: 24, bottom: 24, left: 24,
    });
  });
});

describe('getPageDimensions', () => {
  it('returns A4 portrait dimensions', () => {
    const dims = getPageDimensions(DEFAULT_PAGE_CONFIG);
    expect(dims).toEqual({ width: 595, height: 842 });
  });

  it('swaps dimensions for landscape', () => {
    const dims = getPageDimensions({
      ...DEFAULT_PAGE_CONFIG,
      orientation: 'landscape',
    });
    expect(dims).toEqual({ width: 842, height: 595 });
  });

  it('returns Letter dimensions', () => {
    const dims = getPageDimensions({
      ...DEFAULT_PAGE_CONFIG,
      paperSize: 'Letter',
    });
    expect(dims).toEqual({ width: 612, height: 792 });
  });

  it('returns custom dimensions when provided', () => {
    const dims = getPageDimensions({
      paperSize: 'Custom',
      orientation: 'portrait',
      margins: DEFAULT_PAGE_CONFIG.margins,
      customWidth: 400,
      customHeight: 600,
    });
    expect(dims).toEqual({ width: 400, height: 600 });
  });

  it('swaps custom dimensions for landscape', () => {
    const dims = getPageDimensions({
      paperSize: 'Custom',
      orientation: 'landscape',
      margins: DEFAULT_PAGE_CONFIG.margins,
      customWidth: 400,
      customHeight: 600,
    });
    expect(dims).toEqual({ width: 600, height: 400 });
  });

  it('falls back to A4 for Custom without dimensions', () => {
    const dims = getPageDimensions({
      paperSize: 'Custom',
      orientation: 'portrait',
      margins: DEFAULT_PAGE_CONFIG.margins,
    });
    expect(dims).toEqual({ width: 595, height: 842 });
  });
});

describe('detectMarginPreset', () => {
  it('detects normal preset', () => {
    expect(detectMarginPreset({ top: 16, right: 16, bottom: 16, left: 16 })).toBe('normal');
  });

  it('detects narrow preset', () => {
    expect(detectMarginPreset({ top: 8, right: 8, bottom: 8, left: 8 })).toBe('narrow');
  });

  it('detects wide preset', () => {
    expect(detectMarginPreset({ top: 24, right: 24, bottom: 24, left: 24 })).toBe('wide');
  });

  it('returns custom for non-matching margins', () => {
    expect(detectMarginPreset({ top: 15, right: 20, bottom: 25, left: 30 })).toBe('custom');
  });

  it('returns custom when one margin differs from preset', () => {
    expect(detectMarginPreset({ top: 57, right: 57, bottom: 57, left: 58 })).toBe('custom');
  });
});

describe('pageConfigToRenderOptions', () => {
  it('converts A4 portrait with normal margins (16px → mm)', () => {
    const options = pageConfigToRenderOptions(DEFAULT_PAGE_CONFIG);
    expect(options).toEqual({
      format: 'A4',
      orientation: 'portrait',
      margin: {
        top: '5.64mm',
        right: '5.64mm',
        bottom: '5.64mm',
        left: '5.64mm',
      },
    });
  });

  it('converts Letter landscape with narrow margins (36px → mm)', () => {
    const options = pageConfigToRenderOptions({
      paperSize: 'Letter',
      orientation: 'landscape',
      margins: { top: 36, right: 36, bottom: 36, left: 36 },
    });
    expect(options).toEqual({
      format: 'Letter',
      orientation: 'landscape',
      margin: {
        top: '12.70mm',
        right: '12.70mm',
        bottom: '12.70mm',
        left: '12.70mm',
      },
    });
  });

  it('converts A3 format', () => {
    const options = pageConfigToRenderOptions({
      ...DEFAULT_PAGE_CONFIG,
      paperSize: 'A3',
    });
    expect(options.format).toBe('A3');
    expect(options.width).toBeUndefined();
    expect(options.height).toBeUndefined();
  });

  it('converts Legal format', () => {
    const options = pageConfigToRenderOptions({
      ...DEFAULT_PAGE_CONFIG,
      paperSize: 'Legal',
    });
    expect(options.format).toBe('Legal');
  });

  it('converts Custom paper size to width/height in mm', () => {
    const options = pageConfigToRenderOptions({
      paperSize: 'Custom',
      orientation: 'portrait',
      margins: { top: 28, right: 28, bottom: 28, left: 28 },
      customWidth: 425,
      customHeight: 567,
    });
    // 425px → 149.93mm, 567px → 200.02mm
    expect(options.width).toBe('149.93mm');
    expect(options.height).toBe('200.02mm');
    expect(options.format).toBeUndefined();
  });

  it('falls back to A4 dimensions for Custom without custom values', () => {
    const options = pageConfigToRenderOptions({
      paperSize: 'Custom',
      orientation: 'portrait',
      margins: { top: 57, right: 57, bottom: 57, left: 57 },
    });
    // A4: 595px → 209.90mm, 842px → 297.04mm
    expect(options.width).toBe('209.90mm');
    expect(options.height).toBe('297.04mm');
  });
});

describe('mergePageConfig', () => {
  it('returns base when override is undefined', () => {
    const result = mergePageConfig(DEFAULT_PAGE_CONFIG);
    expect(result).toEqual(DEFAULT_PAGE_CONFIG);
  });

  it('returns base when override is empty object', () => {
    const result = mergePageConfig(DEFAULT_PAGE_CONFIG, {});
    expect(result.paperSize).toBe('A4');
    expect(result.orientation).toBe('portrait');
    expect(result.margins).toEqual(DEFAULT_PAGE_CONFIG.margins);
  });

  it('overrides orientation', () => {
    const result = mergePageConfig(DEFAULT_PAGE_CONFIG, {
      orientation: 'landscape',
    });
    expect(result.orientation).toBe('landscape');
    expect(result.paperSize).toBe('A4');
  });

  it('overrides paper size', () => {
    const result = mergePageConfig(DEFAULT_PAGE_CONFIG, {
      paperSize: 'Letter',
    });
    expect(result.paperSize).toBe('Letter');
    expect(result.orientation).toBe('portrait');
  });

  it('merges margins individually', () => {
    const result = mergePageConfig(DEFAULT_PAGE_CONFIG, {
      margins: { top: 10, right: 20, bottom: 20, left: 20 },
    });
    expect(result.margins.top).toBe(10);
    expect(result.margins.right).toBe(20);
    expect(result.margins.bottom).toBe(20);
    expect(result.margins.left).toBe(20);
  });

  it('preserves base margins for unspecified sides in override', () => {
    const base: PageConfig = {
      paperSize: 'A4',
      orientation: 'portrait',
      margins: { top: 15, right: 25, bottom: 35, left: 45 },
    };
    const result = mergePageConfig(base, {
      margins: { top: 10, right: 25, bottom: 35, left: 45 },
    });
    expect(result.margins.top).toBe(10);
    expect(result.margins.right).toBe(25);
  });

  it('overrides custom dimensions', () => {
    const base: PageConfig = {
      paperSize: 'Custom',
      orientation: 'portrait',
      margins: DEFAULT_PAGE_CONFIG.margins,
      customWidth: 100,
      customHeight: 200,
    };
    const result = mergePageConfig(base, {
      customWidth: 300,
    });
    expect(result.customWidth).toBe(300);
    expect(result.customHeight).toBe(200);
  });

  it('overrides all fields at once', () => {
    const result = mergePageConfig(DEFAULT_PAGE_CONFIG, {
      paperSize: 'Letter',
      orientation: 'landscape',
      margins: { top: 10, right: 10, bottom: 10, left: 10 },
    });
    expect(result.paperSize).toBe('Letter');
    expect(result.orientation).toBe('landscape');
    expect(result.margins).toEqual({ top: 10, right: 10, bottom: 10, left: 10 });
  });
});

describe('parseStoredPageConfig', () => {
  it('returns DEFAULT_PAGE_CONFIG for null', () => {
    expect(parseStoredPageConfig(null)).toEqual(DEFAULT_PAGE_CONFIG);
  });

  it('returns DEFAULT_PAGE_CONFIG for undefined', () => {
    expect(parseStoredPageConfig(undefined)).toEqual(DEFAULT_PAGE_CONFIG);
  });

  it('returns DEFAULT_PAGE_CONFIG for non-object', () => {
    expect(parseStoredPageConfig('string')).toEqual(DEFAULT_PAGE_CONFIG);
    expect(parseStoredPageConfig(42)).toEqual(DEFAULT_PAGE_CONFIG);
  });

  it('parses a stored config with paperSize', () => {
    const stored = { paperSize: 'Letter', orientation: 'landscape' };
    const result = parseStoredPageConfig(stored);
    expect(result.paperSize).toBe('Letter');
    expect(result.orientation).toBe('landscape');
    expect(result.margins).toEqual(DEFAULT_PAGE_CONFIG.margins);
  });

  it('parses stored config with margins', () => {
    const stored = {
      paperSize: 'A4',
      margins: { top: 10, right: 15, bottom: 10, left: 15 },
    };
    const result = parseStoredPageConfig(stored);
    expect(result.margins).toEqual({ top: 10, right: 15, bottom: 10, left: 15 });
  });

  it('fills in defaults for missing fields', () => {
    const stored = { paperSize: 'A3' };
    const result = parseStoredPageConfig(stored);
    expect(result.paperSize).toBe('A3');
    expect(result.orientation).toBe('portrait');
    expect(result.margins).toEqual(DEFAULT_PAGE_CONFIG.margins);
  });

  it('parses stored config with custom dimensions', () => {
    const stored = {
      paperSize: 'Custom',
      customWidth: 150,
      customHeight: 200,
    };
    const result = parseStoredPageConfig(stored);
    expect(result.paperSize).toBe('Custom');
    expect(result.customWidth).toBe(150);
    expect(result.customHeight).toBe(200);
  });

  it('ignores non-string paperSize', () => {
    const stored = { paperSize: 123 };
    const result = parseStoredPageConfig(stored);
    expect(result.paperSize).toBe('A4');
  });

  it('ignores non-string orientation', () => {
    const stored = { orientation: true };
    const result = parseStoredPageConfig(stored);
    expect(result.orientation).toBe('portrait');
  });
});
