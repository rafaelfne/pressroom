import { describe, it, expect } from 'vitest';
import {
  DEFAULT_HEADER_CONFIG,
  DEFAULT_FOOTER_CONFIG,
  DEFAULT_HEADER_FOOTER_CONFIG,
  PAGE_NUMBER_FORMATS,
  parseStoredHeaderFooterConfig,
  mergePageHeaderFooterOverride,
} from '@/lib/types/header-footer-config';

describe('DEFAULT_HEADER_CONFIG', () => {
  it('is disabled by default', () => {
    expect(DEFAULT_HEADER_CONFIG.enabled).toBe(false);
  });

  it('has 15mm height', () => {
    expect(DEFAULT_HEADER_CONFIG.height).toBe(15);
  });

  it('has all empty zones', () => {
    expect(DEFAULT_HEADER_CONFIG.zones.left).toEqual({ type: 'empty' });
    expect(DEFAULT_HEADER_CONFIG.zones.center).toEqual({ type: 'empty' });
    expect(DEFAULT_HEADER_CONFIG.zones.right).toEqual({ type: 'empty' });
  });

  it('has bottom border enabled', () => {
    expect(DEFAULT_HEADER_CONFIG.bottomBorder?.enabled).toBe(true);
    expect(DEFAULT_HEADER_CONFIG.bottomBorder?.color).toBe('#e5e7eb');
    expect(DEFAULT_HEADER_CONFIG.bottomBorder?.thickness).toBe(1);
  });
});

describe('DEFAULT_FOOTER_CONFIG', () => {
  it('is disabled by default', () => {
    expect(DEFAULT_FOOTER_CONFIG.enabled).toBe(false);
  });

  it('has 12mm height', () => {
    expect(DEFAULT_FOOTER_CONFIG.height).toBe(12);
  });

  it('has all empty zones', () => {
    expect(DEFAULT_FOOTER_CONFIG.zones.left).toEqual({ type: 'empty' });
    expect(DEFAULT_FOOTER_CONFIG.zones.center).toEqual({ type: 'empty' });
    expect(DEFAULT_FOOTER_CONFIG.zones.right).toEqual({ type: 'empty' });
  });

  it('has top border enabled', () => {
    expect(DEFAULT_FOOTER_CONFIG.topBorder?.enabled).toBe(true);
    expect(DEFAULT_FOOTER_CONFIG.topBorder?.color).toBe('#e5e7eb');
    expect(DEFAULT_FOOTER_CONFIG.topBorder?.thickness).toBe(1);
  });
});

describe('DEFAULT_HEADER_FOOTER_CONFIG', () => {
  it('contains both header and footer defaults', () => {
    expect(DEFAULT_HEADER_FOOTER_CONFIG.header).toEqual(DEFAULT_HEADER_CONFIG);
    expect(DEFAULT_HEADER_FOOTER_CONFIG.footer).toEqual(DEFAULT_FOOTER_CONFIG);
  });
});

describe('PAGE_NUMBER_FORMATS', () => {
  it('has three format options', () => {
    expect(PAGE_NUMBER_FORMATS).toHaveLength(3);
  });

  it('includes {page} format', () => {
    expect(PAGE_NUMBER_FORMATS).toContainEqual({ value: '{page}', label: '1' });
  });

  it('includes {page}/{total} format', () => {
    expect(PAGE_NUMBER_FORMATS).toContainEqual({ value: '{page}/{total}', label: '1/5' });
  });

  it('includes Page {page} of {total} format', () => {
    expect(PAGE_NUMBER_FORMATS).toContainEqual({
      value: 'Page {page} of {total}',
      label: 'Page 1 of 5',
    });
  });
});

describe('parseStoredHeaderFooterConfig', () => {
  it('returns defaults for null', () => {
    expect(parseStoredHeaderFooterConfig(null)).toEqual(DEFAULT_HEADER_FOOTER_CONFIG);
  });

  it('returns defaults for undefined', () => {
    expect(parseStoredHeaderFooterConfig(undefined)).toEqual(DEFAULT_HEADER_FOOTER_CONFIG);
  });

  it('returns defaults for non-object', () => {
    expect(parseStoredHeaderFooterConfig('string')).toEqual(DEFAULT_HEADER_FOOTER_CONFIG);
    expect(parseStoredHeaderFooterConfig(42)).toEqual(DEFAULT_HEADER_FOOTER_CONFIG);
  });

  it('returns defaults for empty object', () => {
    const result = parseStoredHeaderFooterConfig({});
    expect(result.header).toEqual(DEFAULT_HEADER_CONFIG);
    expect(result.footer).toEqual(DEFAULT_FOOTER_CONFIG);
  });

  it('parses header with enabled flag', () => {
    const stored = {
      header: {
        enabled: true,
        height: 20,
        zones: {
          left: { type: 'text', value: 'Title' },
          center: { type: 'empty' },
          right: { type: 'pageNumber', format: '{page}' },
        },
      },
    };
    const result = parseStoredHeaderFooterConfig(stored);
    expect(result.header?.enabled).toBe(true);
    expect(result.header?.height).toBe(20);
    expect(result.header?.zones.left).toEqual({ type: 'text', value: 'Title' });
    expect(result.header?.zones.right).toEqual({
      type: 'pageNumber',
      format: '{page}',
    });
  });

  it('parses footer with page number format', () => {
    const stored = {
      footer: {
        enabled: true,
        height: 10,
        zones: {
          left: { type: 'text', value: '© Company' },
          center: { type: 'empty' },
          right: { type: 'pageNumber', format: '{page}/{total}' },
        },
      },
    };
    const result = parseStoredHeaderFooterConfig(stored);
    expect(result.footer?.enabled).toBe(true);
    expect(result.footer?.zones.right).toEqual({
      type: 'pageNumber',
      format: '{page}/{total}',
    });
  });

  it('parses image zone content', () => {
    const stored = {
      header: {
        enabled: true,
        height: 15,
        zones: {
          left: { type: 'image', src: 'https://example.com/logo.png', alt: 'Logo' },
          center: { type: 'empty' },
          right: { type: 'empty' },
        },
      },
    };
    const result = parseStoredHeaderFooterConfig(stored);
    expect(result.header?.zones.left).toEqual({
      type: 'image',
      src: 'https://example.com/logo.png',
      alt: 'Logo',
    });
  });

  it('parses text zone with styling', () => {
    const stored = {
      header: {
        enabled: true,
        height: 15,
        zones: {
          left: { type: 'text', value: 'Bold Title', fontSize: 14, fontWeight: 'bold', color: '#333' },
          center: { type: 'empty' },
          right: { type: 'empty' },
        },
      },
    };
    const result = parseStoredHeaderFooterConfig(stored);
    const leftZone = result.header?.zones.left;
    expect(leftZone).toEqual({
      type: 'text',
      value: 'Bold Title',
      fontSize: 14,
      fontWeight: 'bold',
      color: '#333',
    });
  });

  it('parses border config', () => {
    const stored = {
      header: {
        enabled: true,
        height: 15,
        zones: {
          left: { type: 'empty' },
          center: { type: 'empty' },
          right: { type: 'empty' },
        },
        bottomBorder: { enabled: true, color: '#000', thickness: 2 },
      },
    };
    const result = parseStoredHeaderFooterConfig(stored);
    expect(result.header?.bottomBorder).toEqual({
      enabled: true,
      color: '#000',
      thickness: 2,
    });
  });

  it('parses background color', () => {
    const stored = {
      header: {
        enabled: true,
        height: 15,
        zones: {
          left: { type: 'empty' },
          center: { type: 'empty' },
          right: { type: 'empty' },
        },
        backgroundColor: '#f5f5f5',
      },
    };
    const result = parseStoredHeaderFooterConfig(stored);
    expect(result.header?.backgroundColor).toBe('#f5f5f5');
  });

  it('handles invalid zone type gracefully', () => {
    const stored = {
      header: {
        enabled: true,
        height: 15,
        zones: {
          left: { type: 'unknown_type' },
          center: { type: 'empty' },
          right: { type: 'empty' },
        },
      },
    };
    const result = parseStoredHeaderFooterConfig(stored);
    expect(result.header?.zones.left).toEqual({ type: 'empty' });
  });

  it('handles invalid page number format gracefully', () => {
    const stored = {
      footer: {
        enabled: true,
        height: 12,
        zones: {
          left: { type: 'empty' },
          center: { type: 'pageNumber', format: 'invalid_format' },
          right: { type: 'empty' },
        },
      },
    };
    const result = parseStoredHeaderFooterConfig(stored);
    const centerZone = result.footer?.zones.center;
    expect(centerZone?.type).toBe('pageNumber');
    if (centerZone?.type === 'pageNumber') {
      expect(centerZone.format).toBe('{page}');
    }
  });

  it('handles missing zones gracefully', () => {
    const stored = {
      header: {
        enabled: true,
        height: 15,
      },
    };
    const result = parseStoredHeaderFooterConfig(stored);
    // Should fall back to default zones
    expect(result.header?.zones).toEqual(DEFAULT_HEADER_CONFIG.zones);
  });
});

describe('mergePageHeaderFooterOverride', () => {
  it('returns both true when override is undefined', () => {
    const result = mergePageHeaderFooterOverride();
    expect(result).toEqual({ showHeader: true, showFooter: true });
  });

  it('returns both true when override is empty', () => {
    const result = mergePageHeaderFooterOverride({});
    expect(result).toEqual({ showHeader: true, showFooter: true });
  });

  it('respects showHeader false', () => {
    const result = mergePageHeaderFooterOverride({ showHeader: false });
    expect(result.showHeader).toBe(false);
    expect(result.showFooter).toBe(true);
  });

  it('respects showFooter false', () => {
    const result = mergePageHeaderFooterOverride({ showFooter: false });
    expect(result.showHeader).toBe(true);
    expect(result.showFooter).toBe(false);
  });

  it('respects both false', () => {
    const result = mergePageHeaderFooterOverride({ showHeader: false, showFooter: false });
    expect(result.showHeader).toBe(false);
    expect(result.showFooter).toBe(false);
  });
});
