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

  it('has 20mm margins on all sides', () => {
    expect(DEFAULT_PAGE_CONFIG.margins).toEqual({
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
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

  it('A4 is 210 × 297 mm', () => {
    expect(PAPER_SIZES.A4.width).toBe(210);
    expect(PAPER_SIZES.A4.height).toBe(297);
  });

  it('Letter is 215.9 × 279.4 mm', () => {
    expect(PAPER_SIZES.Letter.width).toBe(215.9);
    expect(PAPER_SIZES.Letter.height).toBe(279.4);
  });

  it('Legal is 215.9 × 355.6 mm', () => {
    expect(PAPER_SIZES.Legal.width).toBe(215.9);
    expect(PAPER_SIZES.Legal.height).toBe(355.6);
  });

  it('A3 is 297 × 420 mm', () => {
    expect(PAPER_SIZES.A3.width).toBe(297);
    expect(PAPER_SIZES.A3.height).toBe(420);
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

  it('normal has 20mm margins', () => {
    expect(MARGIN_PRESETS.normal.margins).toEqual({
      top: 20, right: 20, bottom: 20, left: 20,
    });
  });

  it('narrow has 12.7mm margins', () => {
    expect(MARGIN_PRESETS.narrow.margins).toEqual({
      top: 12.7, right: 12.7, bottom: 12.7, left: 12.7,
    });
  });

  it('wide has 25.4mm margins', () => {
    expect(MARGIN_PRESETS.wide.margins).toEqual({
      top: 25.4, right: 25.4, bottom: 25.4, left: 25.4,
    });
  });
});

describe('getPageDimensions', () => {
  it('returns A4 portrait dimensions', () => {
    const dims = getPageDimensions(DEFAULT_PAGE_CONFIG);
    expect(dims).toEqual({ width: 210, height: 297 });
  });

  it('swaps dimensions for landscape', () => {
    const dims = getPageDimensions({
      ...DEFAULT_PAGE_CONFIG,
      orientation: 'landscape',
    });
    expect(dims).toEqual({ width: 297, height: 210 });
  });

  it('returns Letter dimensions', () => {
    const dims = getPageDimensions({
      ...DEFAULT_PAGE_CONFIG,
      paperSize: 'Letter',
    });
    expect(dims).toEqual({ width: 215.9, height: 279.4 });
  });

  it('returns custom dimensions when provided', () => {
    const dims = getPageDimensions({
      paperSize: 'Custom',
      orientation: 'portrait',
      margins: DEFAULT_PAGE_CONFIG.margins,
      customWidth: 150,
      customHeight: 200,
    });
    expect(dims).toEqual({ width: 150, height: 200 });
  });

  it('swaps custom dimensions for landscape', () => {
    const dims = getPageDimensions({
      paperSize: 'Custom',
      orientation: 'landscape',
      margins: DEFAULT_PAGE_CONFIG.margins,
      customWidth: 150,
      customHeight: 200,
    });
    expect(dims).toEqual({ width: 200, height: 150 });
  });

  it('falls back to A4 for Custom without dimensions', () => {
    const dims = getPageDimensions({
      paperSize: 'Custom',
      orientation: 'portrait',
      margins: DEFAULT_PAGE_CONFIG.margins,
    });
    expect(dims).toEqual({ width: 210, height: 297 });
  });
});

describe('detectMarginPreset', () => {
  it('detects normal preset', () => {
    expect(detectMarginPreset({ top: 20, right: 20, bottom: 20, left: 20 })).toBe('normal');
  });

  it('detects narrow preset', () => {
    expect(detectMarginPreset({ top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 })).toBe('narrow');
  });

  it('detects wide preset', () => {
    expect(detectMarginPreset({ top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 })).toBe('wide');
  });

  it('returns custom for non-matching margins', () => {
    expect(detectMarginPreset({ top: 15, right: 20, bottom: 25, left: 30 })).toBe('custom');
  });

  it('returns custom when one margin differs from preset', () => {
    expect(detectMarginPreset({ top: 20, right: 20, bottom: 20, left: 21 })).toBe('custom');
  });
});

describe('pageConfigToRenderOptions', () => {
  it('converts A4 portrait with normal margins', () => {
    const options = pageConfigToRenderOptions(DEFAULT_PAGE_CONFIG);
    expect(options).toEqual({
      format: 'A4',
      orientation: 'portrait',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });
  });

  it('converts Letter landscape', () => {
    const options = pageConfigToRenderOptions({
      paperSize: 'Letter',
      orientation: 'landscape',
      margins: { top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 },
    });
    expect(options).toEqual({
      format: 'Letter',
      orientation: 'landscape',
      margin: {
        top: '12.7mm',
        right: '12.7mm',
        bottom: '12.7mm',
        left: '12.7mm',
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

  it('converts Custom paper size to width/height strings', () => {
    const options = pageConfigToRenderOptions({
      paperSize: 'Custom',
      orientation: 'portrait',
      margins: { top: 10, right: 10, bottom: 10, left: 10 },
      customWidth: 150,
      customHeight: 200,
    });
    expect(options.width).toBe('150mm');
    expect(options.height).toBe('200mm');
    expect(options.format).toBeUndefined();
  });

  it('falls back to A4 dimensions for Custom without custom values', () => {
    const options = pageConfigToRenderOptions({
      paperSize: 'Custom',
      orientation: 'portrait',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
    });
    expect(options.width).toBe('210mm');
    expect(options.height).toBe('297mm');
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
