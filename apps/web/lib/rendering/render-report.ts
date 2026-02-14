import type { Data } from '@puckeditor/core';
import { resolveBindings } from '@/lib/binding';
import { generateHtml } from './html-generator';
import { renderPdf, type PdfRenderOptions } from './pdf-renderer';

export interface RenderReportOptions {
  templateData: Data;
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
 */
export async function renderReport(
  options: RenderReportOptions,
): Promise<RenderResult> {
  const {
    templateData,
    data = {},
    format = 'pdf',
    title = 'Report',
    cssStyles = '',
    pageConfig = {},
  } = options;

  // Step 1: Resolve data bindings in template
  const resolvedTemplate = resolveBindings(templateData, data) as Data;

  // Step 2: Generate HTML from Puck template
  const html = await generateHtml(resolvedTemplate, { title, cssStyles });

  // Step 3: If HTML format requested, return directly
  if (format === 'html') {
    return {
      content: html,
      contentType: 'text/html',
    };
  }

  // Step 4: Convert HTML to PDF via Puppeteer
  const pdfBuffer = await renderPdf(html, pageConfig);

  return {
    content: pdfBuffer,
    contentType: 'application/pdf',
  };
}
