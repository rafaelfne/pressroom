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
 * Render an HTML string to a PDF buffer using Puppeteer.
 * Limits concurrent pages to prevent resource exhaustion.
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
