import type { Data } from '@puckeditor/core';
import { resolveBindings } from '@/lib/binding';
import { generateHtml, generateMultiPageHtml } from './html-generator';
import { renderPdf, type PdfRenderOptions } from './pdf-renderer';

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
}

export interface RenderResult {
  content: Buffer | string;
  contentType: string;
}

/**
 * Render a report through the full pipeline:
 * Template JSON → Binding Resolution → Puck Render → HTML → PDF
 * Supports both single-page (templateData) and multi-page (pages) templates.
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
  } = options;

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

  const pdfBuffer = await renderPdf(html, pageConfig);
  return {
    content: pdfBuffer,
    contentType: 'application/pdf',
  };
}
