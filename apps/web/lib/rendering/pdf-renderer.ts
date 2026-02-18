import type { PDFOptions } from 'puppeteer';
import { getBrowser } from './browser-pool';

export interface PdfRenderOptions {
  format?: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Tabloid';
  width?: string;
  height?: string;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  orientation?: 'portrait' | 'landscape';
  headerTemplate?: string;
  footerTemplate?: string;
  displayHeaderFooter?: boolean;
}

const DEFAULT_MARGIN = {
  top: '20mm',
  right: '15mm',
  bottom: '20mm',
  left: '15mm',
};

const MAX_CONCURRENT_PAGES = 10;
let activePages = 0;

/**
 * Paper sizes in mm (width × height for portrait orientation).
 * Used to calculate viewport width matching the PDF content area.
 */
const PAPER_SIZES_MM: Record<string, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
  Tabloid: { width: 279.4, height: 431.8 },
};

/**
 * Parse a margin string (e.g., "20mm", "1in", "96px") to mm.
 *
 * Unit handling:
 * - "mm": used as-is (Puppeteer native unit)
 * - "in": converted via exact factor (1in = 25.4mm)
 * - "px": treated as CSS reference pixels (96 DPI) per W3C spec.
 *   Note: The studio stores dimensions at 72 DPI (PDF points). Those values
 *   are converted to mm strings by `pageConfigToRenderOptions()` before
 *   reaching this function, so the 96 DPI path here is only for raw CSS px.
 */
function parseMarginToMm(value: string): number {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  if (value.endsWith('in')) return num * MM_PER_INCH;
  if (value.endsWith('px')) return (num * MM_PER_INCH) / VIEWPORT_DPI;
  // Default: mm
  return num;
}

/**
 * CSS reference pixel density (96 DPI) used for Puppeteer viewport calculations.
 * Note: The studio stores dimensions at 72 DPI (PDF points). Conversion from
 * 72 DPI px → mm happens in pageConfigToRenderOptions() before reaching this module.
 */
const VIEWPORT_DPI = 96;
/** Millimeters per inch conversion factor */
const MM_PER_INCH = 25.4;

/**
 * Calculate the viewport width in pixels that matches the PDF content area.
 * This ensures CSS layouts render at the correct width before PDF conversion (F-6.1).
 *
 * The viewport uses CSS pixels (96 DPI) because that's what Puppeteer's Chromium expects.
 * Margin values arrive as mm strings (converted from studio 72 DPI px upstream).
 */
function calculateViewportWidth(options: PdfRenderOptions): number {
  let paperWidthMm: number;

  if (options.width) {
    paperWidthMm = parseMarginToMm(options.width);
  } else {
    const format = options.format ?? 'A4';
    const size = PAPER_SIZES_MM[format] ?? PAPER_SIZES_MM.A4;
    paperWidthMm = options.orientation === 'landscape' ? size.height : size.width;
  }

  const marginLeftMm = parseMarginToMm(options.margin?.left ?? DEFAULT_MARGIN.left);
  const marginRightMm = parseMarginToMm(options.margin?.right ?? DEFAULT_MARGIN.right);
  const contentWidthMm = paperWidthMm - marginLeftMm - marginRightMm;

  return Math.round((contentWidthMm / MM_PER_INCH) * VIEWPORT_DPI);
}

/**
 * Render an HTML string to a PDF buffer using Puppeteer.
 * Limits concurrent pages to prevent resource exhaustion.
 *
 * Sets viewport width to match the PDF content area so CSS media queries
 * and responsive layouts compute correctly before PDF conversion.
 * Emulates 'screen' media type for consistent Tailwind/CSS rendering,
 * combined with printBackground: true for background colors (F-5.4, F-6.4).
 */
export async function renderPdf(
  html: string,
  options: PdfRenderOptions = {},
): Promise<Buffer> {
  if (activePages >= MAX_CONCURRENT_PAGES) {
    throw new Error('Too many concurrent render requests');
  }

  activePages++;
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set viewport width to match PDF content area (F-6.1)
    const viewportWidth = calculateViewportWidth(options);
    await page.setViewport({ width: viewportWidth, height: 1024 });

    // Emulate screen media for consistent CSS rendering (F-5.4)
    // Tailwind defaults differ between screen and print; screen mode with
    // printBackground: true gives the most predictable output.
    await page.emulateMediaType('screen');

    // Set content and wait for rendering to complete
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Build PDF options
    const pdfOptions: PDFOptions = {
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: options.margin?.top ?? DEFAULT_MARGIN.top,
        right: options.margin?.right ?? DEFAULT_MARGIN.right,
        bottom: options.margin?.bottom ?? DEFAULT_MARGIN.bottom,
        left: options.margin?.left ?? DEFAULT_MARGIN.left,
      },
    };

    // Page size: explicit dimensions take precedence over named format
    if (options.width && options.height) {
      pdfOptions.width = options.width;
      pdfOptions.height = options.height;
    } else {
      pdfOptions.format = options.format ?? 'A4';
    }

    // Orientation
    if (options.orientation === 'landscape') {
      pdfOptions.landscape = true;
    }

    // Header / footer
    if (options.displayHeaderFooter) {
      pdfOptions.displayHeaderFooter = true;
      pdfOptions.headerTemplate = options.headerTemplate ?? '<span></span>';
      pdfOptions.footerTemplate = options.footerTemplate ?? '<span></span>';
    }

    const pdfBuffer = await page.pdf(pdfOptions);

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
    activePages--;
  }
}
