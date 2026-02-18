import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Browser, Page } from 'puppeteer';

// Mock browser-pool
vi.mock('@/lib/rendering/browser-pool', () => ({
  getBrowser: vi.fn(),
}));

import { getBrowser } from '@/lib/rendering/browser-pool';
import { renderPdf } from '@/lib/rendering/pdf-renderer';

describe('renderPdf', () => {
  let mockPage: Page;
  let mockBrowser: Browser;

  beforeEach(() => {
    // Create mock page
    mockPage = {
      setContent: vi.fn().mockResolvedValue(undefined),
      setViewport: vi.fn().mockResolvedValue(undefined),
      emulateMediaType: vi.fn().mockResolvedValue(undefined),
      pdf: vi.fn().mockResolvedValue(Buffer.from('mock-pdf-data')),
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Page;

    // Create mock browser
    mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
    } as unknown as Browser;

    vi.mocked(getBrowser).mockResolvedValue(mockBrowser);
  });

  it('renders HTML to PDF buffer', async () => {
    const html = '<html><body>Test</body></html>';
    const buffer = await renderPdf(html);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.toString()).toBe('mock-pdf-data');
  });

  it('sets HTML content with networkidle0 wait', async () => {
    const html = '<html><body>Test</body></html>';
    await renderPdf(html);

    expect(mockPage.setContent).toHaveBeenCalledWith(html, { waitUntil: 'networkidle0' });
  });

  it('uses default A4 format', async () => {
    const html = '<html><body>Test</body></html>';
    await renderPdf(html);

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'A4',
      }),
    );
  });

  it('uses custom format when provided', async () => {
    const html = '<html><body>Test</body></html>';
    await renderPdf(html, { format: 'Letter' });

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'Letter',
      }),
    );
  });

  it('uses custom dimensions when provided', async () => {
    const html = '<html><body>Test</body></html>';
    await renderPdf(html, { width: '800px', height: '600px' });

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        width: '800px',
        height: '600px',
      }),
    );
    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.not.objectContaining({
        format: expect.anything(),
      }),
    );
  });

  it('uses default margins', async () => {
    const html = '<html><body>Test</body></html>';
    await renderPdf(html);

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      }),
    );
  });

  it('uses custom margins when provided', async () => {
    const html = '<html><body>Test</body></html>';
    await renderPdf(html, {
      margin: {
        top: '10mm',
        bottom: '10mm',
      },
    });

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        margin: {
          top: '10mm',
          right: '15mm',
          bottom: '10mm',
          left: '15mm',
        },
      }),
    );
  });

  it('uses landscape orientation when specified', async () => {
    const html = '<html><body>Test</body></html>';
    await renderPdf(html, { orientation: 'landscape' });

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        landscape: true,
      }),
    );
  });

  it('uses portrait orientation by default', async () => {
    const html = '<html><body>Test</body></html>';
    await renderPdf(html);

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.not.objectContaining({
        landscape: true,
      }),
    );
  });

  it('enables header/footer when displayHeaderFooter is true', async () => {
    const html = '<html><body>Test</body></html>';
    await renderPdf(html, {
      displayHeaderFooter: true,
      headerTemplate: '<div>Header</div>',
      footerTemplate: '<div>Footer</div>',
    });

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        displayHeaderFooter: true,
        headerTemplate: '<div>Header</div>',
        footerTemplate: '<div>Footer</div>',
      }),
    );
  });

  it('uses default header/footer templates when not provided', async () => {
    const html = '<html><body>Test</body></html>';
    await renderPdf(html, { displayHeaderFooter: true });

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        displayHeaderFooter: true,
        headerTemplate: '<span></span>',
        footerTemplate: '<span></span>',
      }),
    );
  });

  it('enables print background', async () => {
    const html = '<html><body>Test</body></html>';
    await renderPdf(html);

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        printBackground: true,
      }),
    );
  });

  it('disables preferCSSPageSize', async () => {
    const html = '<html><body>Test</body></html>';
    await renderPdf(html);

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        preferCSSPageSize: false,
      }),
    );
  });

  it('closes page after rendering', async () => {
    const html = '<html><body>Test</body></html>';
    await renderPdf(html);

    expect(mockPage.close).toHaveBeenCalledTimes(1);
  });

  it('closes page even if error occurs', async () => {
    const html = '<html><body>Test</body></html>';
    vi.mocked(mockPage.pdf).mockRejectedValue(new Error('PDF generation failed'));

    await expect(renderPdf(html)).rejects.toThrow('PDF generation failed');
    expect(mockPage.close).toHaveBeenCalledTimes(1);
  });

  it('converts Uint8Array to Buffer', async () => {
    const html = '<html><body>Test</body></html>';
    const uint8Array = new Uint8Array([1, 2, 3, 4]);
    vi.mocked(mockPage.pdf).mockResolvedValue(uint8Array);

    const buffer = await renderPdf(html);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(Array.from(buffer)).toEqual([1, 2, 3, 4]);
  });

  it('sets viewport width to match A4 content area', async () => {
    const html = '<html><body>Test</body></html>';
    await renderPdf(html);

    // A4 (210mm) - default margins (15mm left + 15mm right) = 180mm content width
    // 180mm / 25.4 * 96 ≈ 680px
    expect(mockPage.setViewport).toHaveBeenCalledWith(
      expect.objectContaining({
        width: expect.any(Number),
        height: 1024,
      }),
    );
    const { width } = vi.mocked(mockPage.setViewport).mock.calls[0][0] as { width: number; height: number };
    expect(width).toBeGreaterThan(600);
    expect(width).toBeLessThan(800);
  });

  it('sets viewport for landscape orientation', async () => {
    const html = '<html><body>Test</body></html>';
    await renderPdf(html, { orientation: 'landscape' });

    // A4 landscape (297mm) - default margins = 267mm
    const { width } = vi.mocked(mockPage.setViewport).mock.calls[0][0] as { width: number; height: number };
    expect(width).toBeGreaterThan(900);
  });

  it('emulates screen media type', async () => {
    const html = '<html><body>Test</body></html>';
    await renderPdf(html);

    expect(mockPage.emulateMediaType).toHaveBeenCalledWith('screen');
  });
});
