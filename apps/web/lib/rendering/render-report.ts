import type { Data } from '@puckeditor/core';
import { resolveBindings } from '@/lib/binding';
import { generateHtml, generateMultiPageHtml } from './html-generator';
import { renderPdf, type PdfRenderOptions } from './pdf-renderer';
import { generateHeaderHtml, generateFooterHtml } from './header-footer-generator';
import type { PageConfig } from '@/lib/types/page-config';
import { pageConfigToRenderOptions, pxToMm } from '@/lib/types/page-config';
import type { HeaderFooterConfig } from '@/lib/types/header-footer-config';

export interface TemplatePage {
  id: string;
  name: string;
  content: Data;
}

export interface RenderReportOptions {
  templateData?: Data;
  pages?: TemplatePage[];
  data?: Record<string, unknown>;
  format?: 'pdf' | 'html';
  title?: string;
  cssStyles?: string;
  pageConfig?: PdfRenderOptions;
  /** Structured page configuration (takes precedence over pageConfig when present with paperSize) */
  templatePageConfig?: PageConfig;
  /** Template-level header/footer configuration */
  headerFooterConfig?: HeaderFooterConfig;
}

export interface RenderResult {
  content: Buffer | string;
  contentType: string;
}

/**
 * Render a report through the full pipeline:
 * Template JSON → Binding Resolution → Puck Render → HTML → PDF
 * Supports both single-page (templateData) and multi-page (pages) templates.
 * When headerFooterConfig is provided, generates Puppeteer header/footer templates
 * and auto-adjusts margins to accommodate header/footer height.
 */
export async function renderReport(
  options: RenderReportOptions,
): Promise<RenderResult> {
  const {
    templateData,
    pages,
    data = {},
    format = 'pdf',
    title = 'Report',
    cssStyles = '',
    pageConfig = {},
    templatePageConfig,
    headerFooterConfig,
  } = options;

  // Resolve PDF render options: templatePageConfig takes precedence
  const resolvedPdfOptions: PdfRenderOptions = templatePageConfig
    ? pageConfigToRenderOptions(templatePageConfig)
    : { ...pageConfig };

  // Integrate header/footer into PDF options when configured
  if (headerFooterConfig) {
    const headerConfig = headerFooterConfig.header;
    const footerConfig = headerFooterConfig.footer;
    const hasHeader = headerConfig?.enabled === true;
    const hasFooter = footerConfig?.enabled === true;

    // Page margins for header/footer horizontal alignment
    const pageMargins = templatePageConfig
      ? { left: templatePageConfig.margins.left, right: templatePageConfig.margins.right }
      : undefined;

    if (hasHeader || hasFooter) {
      resolvedPdfOptions.displayHeaderFooter = true;

      if (hasHeader && headerConfig) {
        resolvedPdfOptions.headerTemplate = generateHeaderHtml(headerConfig, data, pageMargins);
        // Auto-adjust top margin to accommodate header height (convert 72 DPI px → mm)
        const headerHeight = headerConfig.height ?? 43;
        resolvedPdfOptions.margin = {
          ...resolvedPdfOptions.margin,
          top: `${pxToMm(headerHeight).toFixed(4)}mm`,
        };
      }

      if (hasFooter && footerConfig) {
        resolvedPdfOptions.footerTemplate = generateFooterHtml(footerConfig, data, pageMargins);
        // Auto-adjust bottom margin to accommodate footer height (convert 72 DPI px → mm)
        const footerHeight = footerConfig.height ?? 34;
        resolvedPdfOptions.margin = {
          ...resolvedPdfOptions.margin,
          bottom: `${pxToMm(footerHeight).toFixed(4)}mm`,
        };
      }
    }
  }

  let html: string;

  if (pages && pages.length > 0) {
    // Multi-page rendering: resolve bindings for each page, then combine
    const resolvedPages = pages.map(
      (page) => resolveBindings(page.content, data) as Data,
    );
    html = await generateMultiPageHtml(resolvedPages, { title, cssStyles });
  } else if (templateData) {
    // Single-page rendering (backward compatible)
    const resolvedTemplate = resolveBindings(templateData, data) as Data;
    html = await generateHtml(resolvedTemplate, { title, cssStyles });
  } else {
    throw new Error('Either templateData or pages must be provided');
  }

  if (format === 'html') {
    return {
      content: html,
      contentType: 'text/html',
    };
  }

  const pdfBuffer = await renderPdf(html, resolvedPdfOptions);
  return {
    content: pdfBuffer,
    contentType: 'application/pdf',
  };
}
