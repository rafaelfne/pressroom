import { describe, it, expect, vi } from 'vitest';
import type { HeaderConfig, FooterConfig } from '@/lib/types/header-footer-config';

// Mock the binding module
vi.mock('@/lib/binding', () => ({
  resolveBindings: vi.fn((value: unknown, _data: Record<string, unknown>) => {
    if (typeof value !== 'string') return value;
    // Simple mock: replace {{key}} with data[key]
    return value.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_match, key) => {
      const keys = key.split('.');
      let result: unknown = _data;
      for (const k of keys) {
        if (result && typeof result === 'object') {
          result = (result as Record<string, unknown>)[k];
        } else {
          return `{{${key}}}`;
        }
      }
      return result !== undefined ? String(result) : `{{${key}}}`;
    });
  }),
}));

import {
  generateHeaderHtml,
  generateFooterHtml,
  escapeHtml,
} from '@/lib/rendering/header-footer-generator';

describe('escapeHtml', () => {
  it('escapes ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes angle brackets', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#39;s');
  });

  it('leaves safe strings unchanged', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });
});

describe('generateHeaderHtml', () => {
  it('returns empty span when disabled', () => {
    const config: HeaderConfig = {
      enabled: false,
      height: 15,
      zones: {
        left: { type: 'empty' },
        center: { type: 'empty' },
        right: { type: 'empty' },
      },
    };
    expect(generateHeaderHtml(config)).toBe('<span></span>');
  });

  it('generates HTML with text zones', () => {
    const config: HeaderConfig = {
      enabled: true,
      height: 15,
      zones: {
        left: { type: 'text', value: 'Report Title' },
        center: { type: 'empty' },
        right: { type: 'text', value: 'Company Name' },
      },
    };
    const html = generateHeaderHtml(config);
    expect(html).toContain('Report Title');
    expect(html).toContain('Company Name');
    expect(html).toContain('text-align: left');
    expect(html).toContain('text-align: right');
  });

  it('generates HTML with page numbers', () => {
    const config: HeaderConfig = {
      enabled: true,
      height: 15,
      zones: {
        left: { type: 'empty' },
        center: { type: 'empty' },
        right: { type: 'pageNumber', format: '{page}/{total}' },
      },
    };
    const html = generateHeaderHtml(config);
    expect(html).toContain('<span class="pageNumber"></span>');
    expect(html).toContain('<span class="totalPages"></span>');
  });

  it('generates correct page number format: {page}', () => {
    const config: HeaderConfig = {
      enabled: true,
      height: 15,
      zones: {
        left: { type: 'empty' },
        center: { type: 'empty' },
        right: { type: 'pageNumber', format: '{page}' },
      },
    };
    const html = generateHeaderHtml(config);
    expect(html).toContain('<span class="pageNumber"></span>');
    expect(html).not.toContain('totalPages');
  });

  it('generates correct page number format: Page {page} of {total}', () => {
    const config: HeaderConfig = {
      enabled: true,
      height: 15,
      zones: {
        left: { type: 'empty' },
        center: { type: 'pageNumber', format: 'Page {page} of {total}' },
        right: { type: 'empty' },
      },
    };
    const html = generateHeaderHtml(config);
    expect(html).toContain('Page <span class="pageNumber"></span> of <span class="totalPages"></span>');
  });

  it('generates HTML with image zone', () => {
    const config: HeaderConfig = {
      enabled: true,
      height: 15,
      zones: {
        left: { type: 'image', src: 'https://example.com/logo.png', alt: 'Logo' },
        center: { type: 'empty' },
        right: { type: 'empty' },
      },
    };
    const html = generateHeaderHtml(config);
    expect(html).toContain('<img');
    expect(html).toContain('src="https://example.com/logo.png"');
    expect(html).toContain('alt="Logo"');
  });

  it('includes inline styles for font size', () => {
    const config: HeaderConfig = {
      enabled: true,
      height: 15,
      zones: {
        left: { type: 'text', value: 'Title', fontSize: 14 },
        center: { type: 'empty' },
        right: { type: 'empty' },
      },
    };
    const html = generateHeaderHtml(config);
    expect(html).toContain('font-size: 14pt');
  });

  it('includes inline styles for font weight', () => {
    const config: HeaderConfig = {
      enabled: true,
      height: 15,
      zones: {
        left: { type: 'text', value: 'Bold Title', fontWeight: 'bold' },
        center: { type: 'empty' },
        right: { type: 'empty' },
      },
    };
    const html = generateHeaderHtml(config);
    expect(html).toContain('font-weight: bold');
  });

  it('includes background color when specified', () => {
    const config: HeaderConfig = {
      enabled: true,
      height: 15,
      zones: {
        left: { type: 'empty' },
        center: { type: 'empty' },
        right: { type: 'empty' },
      },
      backgroundColor: '#f0f0f0',
    };
    const html = generateHeaderHtml(config);
    expect(html).toContain('background-color: #f0f0f0');
  });

  it('includes bottom border when configured', () => {
    const config: HeaderConfig = {
      enabled: true,
      height: 15,
      zones: {
        left: { type: 'empty' },
        center: { type: 'empty' },
        right: { type: 'empty' },
      },
      bottomBorder: { enabled: true, color: '#000', thickness: 2 },
    };
    const html = generateHeaderHtml(config);
    expect(html).toContain('border-bottom:');
    expect(html).toContain('2px');
    expect(html).toContain('#000');
  });

  it('omits border when disabled', () => {
    const config: HeaderConfig = {
      enabled: true,
      height: 15,
      zones: {
        left: { type: 'empty' },
        center: { type: 'empty' },
        right: { type: 'empty' },
      },
      bottomBorder: { enabled: false },
    };
    const html = generateHeaderHtml(config);
    expect(html).not.toContain('border-bottom');
  });

  it('resolves bindings in text zones', () => {
    const config: HeaderConfig = {
      enabled: true,
      height: 15,
      zones: {
        left: { type: 'text', value: '{{company.name}}' },
        center: { type: 'empty' },
        right: { type: 'empty' },
      },
    };
    const data = { company: { name: 'Acme Corp' } };
    const html = generateHeaderHtml(config, data);
    expect(html).toContain('Acme Corp');
  });

  it('uses table layout for zones', () => {
    const config: HeaderConfig = {
      enabled: true,
      height: 15,
      zones: {
        left: { type: 'text', value: 'Left' },
        center: { type: 'text', value: 'Center' },
        right: { type: 'text', value: 'Right' },
      },
    };
    const html = generateHeaderHtml(config);
    expect(html).toContain('<table');
    expect(html).toContain('<tr>');
    expect(html).toContain('<td');
  });

  it('includes print color adjust for backgrounds', () => {
    const config: HeaderConfig = {
      enabled: true,
      height: 15,
      zones: {
        left: { type: 'empty' },
        center: { type: 'empty' },
        right: { type: 'empty' },
      },
    };
    const html = generateHeaderHtml(config);
    expect(html).toContain('-webkit-print-color-adjust: exact');
  });

  it('converts height from pixels to mm', () => {
    const config: HeaderConfig = {
      enabled: true,
      height: 57, // 57px at 72 DPI ≈ 20.11mm
      zones: {
        left: { type: 'empty' },
        center: { type: 'empty' },
        right: { type: 'empty' },
      },
    };
    const html = generateHeaderHtml(config);
    expect(html).toContain('height: 20.11mm');
  });

  it('escapes HTML in text values', () => {
    const config: HeaderConfig = {
      enabled: true,
      height: 15,
      zones: {
        left: { type: 'text', value: '<script>alert("xss")</script>' },
        center: { type: 'empty' },
        right: { type: 'empty' },
      },
    };
    const html = generateHeaderHtml(config);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes HTML in image src', () => {
    const config: HeaderConfig = {
      enabled: true,
      height: 15,
      zones: {
        left: { type: 'image', src: '" onerror="alert(1)', alt: '' },
        center: { type: 'empty' },
        right: { type: 'empty' },
      },
    };
    const html = generateHeaderHtml(config);
    expect(html).not.toContain('" onerror="');
    expect(html).toContain('&quot;');
  });
});

describe('generateFooterHtml', () => {
  it('returns empty span when disabled', () => {
    const config: FooterConfig = {
      enabled: false,
      height: 12,
      zones: {
        left: { type: 'empty' },
        center: { type: 'empty' },
        right: { type: 'empty' },
      },
    };
    expect(generateFooterHtml(config)).toBe('<span></span>');
  });

  it('generates HTML with text and page number', () => {
    const config: FooterConfig = {
      enabled: true,
      height: 12,
      zones: {
        left: { type: 'text', value: '© Company' },
        center: { type: 'empty' },
        right: { type: 'pageNumber', format: '{page}/{total}' },
      },
    };
    const html = generateFooterHtml(config);
    expect(html).toContain('© Company');
    expect(html).toContain('<span class="pageNumber"></span>');
    expect(html).toContain('<span class="totalPages"></span>');
  });

  it('includes top border when configured', () => {
    const config: FooterConfig = {
      enabled: true,
      height: 12,
      zones: {
        left: { type: 'empty' },
        center: { type: 'empty' },
        right: { type: 'empty' },
      },
      topBorder: { enabled: true, color: '#ccc', thickness: 1 },
    };
    const html = generateFooterHtml(config);
    expect(html).toContain('border-top:');
    expect(html).toContain('#ccc');
  });

  it('resolves bindings in footer text', () => {
    const config: FooterConfig = {
      enabled: true,
      height: 12,
      zones: {
        left: { type: 'text', value: 'Generated: {{date}}' },
        center: { type: 'empty' },
        right: { type: 'empty' },
      },
    };
    const data = { date: '2026-01-15' };
    const html = generateFooterHtml(config, data);
    expect(html).toContain('Generated: 2026-01-15');
  });

  it('generates complete footer with all zone types', () => {
    const config: FooterConfig = {
      enabled: true,
      height: 10,
      zones: {
        left: { type: 'text', value: 'Confidential' },
        center: { type: 'image', src: 'https://example.com/icon.png' },
        right: { type: 'pageNumber', format: 'Page {page} of {total}' },
      },
      topBorder: { enabled: true, color: '#333', thickness: 1 },
      backgroundColor: '#fafafa',
    };
    const html = generateFooterHtml(config);
    expect(html).toContain('Confidential');
    expect(html).toContain('<img');
    expect(html).toContain('Page <span class="pageNumber"></span> of <span class="totalPages"></span>');
    expect(html).toContain('border-top:');
    expect(html).toContain('background-color: #fafafa');
  });
});
