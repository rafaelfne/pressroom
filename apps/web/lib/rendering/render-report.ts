import type { Data } from '@puckeditor/core';
import { resolveBindings } from '@/lib/binding';
import { generateHtml, generateMultiPageHtml } from './html-generator';
import { renderPdf, type PdfRenderOptions } from './pdf-renderer';
import type { PageConfig } from '@/lib/types/page-config';
import { pageConfigToRenderOptions } from '@/lib/types/page-config';
import { resolveStyleTokensInData, type StyleToken } from '@/lib/types/style-system';
import { stripInvisibleComponents, resolveStyleConditionsInData } from '@/lib/utils/visibility';

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
  /** Style guide tokens for resolving StylableValue references in component props */
  styleTokens?: StyleToken[];
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
    templatePageConfig,
    styleTokens = [],
  } = options;

  // Resolve PDF render options: templatePageConfig takes precedence
  const resolvedPdfOptions: PdfRenderOptions = templatePageConfig
    ? pageConfigToRenderOptions(templatePageConfig)
    : { ...pageConfig };

  // Helper: strip invisible components, resolve style conditions, resolve bindings,
  // then style tokens in a Puck Data tree
  const resolveData = (content: Data): Data => {
    // Strip components whose visibilityCondition evaluates to hidden
    let resolved = stripInvisibleComponents(content, data);
    // Apply style condition overrides (before binding resolution so overridden
    // prop values participate in the remaining pipeline steps)
    resolved = resolveStyleConditionsInData(resolved, data, styleTokens);
    resolved = resolveBindings(resolved, data) as Data;
    // Always resolve StylableValue objects to plain strings — even without
    // tokens.  This normalises { mode:'inline', inline:'16' } → '16' so
    // server render functions always receive plain CSS strings.
    resolved = resolveStyleTokensInData(resolved, styleTokens);
    return resolved;
  };

  let html: string;

  if (pages && pages.length > 0) {
    // Multi-page rendering: resolve bindings + tokens for each page, then combine
    const resolvedPages = pages.map((page) => resolveData(page.content));
    html = await generateMultiPageHtml(resolvedPages, { title, cssStyles });
  } else if (templateData) {
    // Single-page rendering (backward compatible)
    const resolvedTemplate = resolveData(templateData);
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
