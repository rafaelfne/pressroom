import type { Data, Config } from '@puckeditor/core';
import { googleFontUrl } from '@/components/report-components/text-block';

export interface HtmlGeneratorOptions {
  title?: string;
  cssStyles?: string;
}

/**
 * Render a Puck data tree to an HTML string using our server-safe component config.
 *
 * This is a custom renderer that replaces Puck's <Render> component.
 * We avoid importing @puckeditor/core at runtime because:
 * - In Next.js API routes (RSC context), Turbopack resolves @puckeditor/core
 *   to its "react-server" export (rsc.mjs), which uses RSC React with hooks
 *   set to null (useMemo, useContext, etc.), breaking renderToStaticMarkup.
 * - Our custom renderer uses only createElement + renderToStaticMarkup — zero hooks.
 *
 * The renderer walks data.content, looks up each component in the config,
 * and calls its render function with a puck.renderDropZone that resolves
 * nested zones from data.zones.
 */
function renderPuckData(
  data: Data,
  config: Config,
  createElement: typeof import('react').createElement,
  renderToStaticMarkup: (element: import('react').ReactElement) => string,
): string {
  type ComponentItem = { type: string; props: Record<string, unknown> };

  function renderZone(items: ComponentItem[]): import('react').ReactNode[] {
    return items.map((item, index) => {
      const componentConfig = config.components[item.type];
      if (!componentConfig?.render) return null;

      const RenderFn = componentConfig.render as import('react').FC<Record<string, unknown>>;

      const itemId = item.props?.id as string | undefined;

      const puck = {
        renderDropZone: ({ zone }: { zone: string }) => {
          // Puck stores zones as "<parentComponentId>:<zoneName>"
          const zoneKey = itemId ? `${itemId}:${zone}` : zone;
          const children = (data.zones?.[zoneKey] ?? []) as ComponentItem[];
          if (children.length === 0) return null;
          return createElement('div', { key: `zone-${zone}` }, ...renderZone(children));
        },
      };

      return createElement(RenderFn, {
        key: itemId ?? `item-${index}`,
        ...item.props,
        puck,
      });
    });
  }

  const content = (data.content ?? []) as ComponentItem[];
  const rootElement = createElement('div', null, ...renderZone(content));
  return renderToStaticMarkup(rootElement);
}

/**
 * Generate a full HTML document from Puck template data.
 * Renders the Puck component tree to a static HTML string,
 * then wraps it in a complete HTML document with styles.
 */
export async function generateHtml(
  templateData: Data,
  options: HtmlGeneratorOptions = {},
): Promise<string> {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { serverPuckConfig } = await import('@/lib/puck/server-config');

  const { title = 'Report', cssStyles = '' } = options;

  const bodyHtml = renderPuckData(templateData, serverPuckConfig, createElement, renderToStaticMarkup);

  const fonts = collectGoogleFonts(templateData);
  const fontLinks = fonts.map(f => `<link rel="stylesheet" href="${escapeHtml(googleFontUrl(f))}" />`).join('\n  ');

  return buildHtmlDocument(bodyHtml, title, cssStyles, fontLinks);
}

/**
 * Generate a full HTML document from multiple Puck template pages.
 * Each page is rendered and separated by CSS page breaks.
 */
export async function generateMultiPageHtml(
  pages: Data[],
  options: HtmlGeneratorOptions = {},
): Promise<string> {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { serverPuckConfig } = await import('@/lib/puck/server-config');

  const { title = 'Report', cssStyles = '' } = options;

  const bodyParts: string[] = [];
  for (let i = 0; i < pages.length; i++) {
    const pageHtml = renderPuckData(pages[i], serverPuckConfig, createElement, renderToStaticMarkup);
    bodyParts.push(pageHtml);
  }

  // Join pages with page-break divs (not after the last page)
  const bodyHtml = bodyParts
    .map((html, i) => {
      if (i < bodyParts.length - 1) {
        return `<div style="page-break-after: always;">${html}</div>`;
      }
      return `<div>${html}</div>`;
    })
    .join('\n');

  // Collect Google Fonts from all pages
  const allFonts = new Set<string>();
  for (const page of pages) {
    for (const f of collectGoogleFonts(page)) allFonts.add(f);
  }
  const fontLinks = Array.from(allFonts).map(f => `<link rel="stylesheet" href="${escapeHtml(googleFontUrl(f))}" />`).join('\n  ');

  return buildHtmlDocument(bodyHtml, title, cssStyles, fontLinks);
}

/**
 * Collect unique Google Font family names from TextBlock components in a Puck data tree.
 * Walks content and zones recursively.
 */
function collectGoogleFonts(data: Data): string[] {
  const fonts = new Set<string>();

  type ComponentItem = { type: string; props: Record<string, unknown> };

  function walk(items: ComponentItem[]) {
    for (const item of items) {
      if (item.type === 'TextBlock' && item.props) {
        const family = item.props.fontFamily as string | undefined;
        const customFamily = item.props.customFontFamily as string | undefined;
        const resolved = family === 'custom' ? customFamily : family;
        if (resolved) fonts.add(resolved);
      }
    }
  }

  walk((data.content ?? []) as ComponentItem[]);
  if (data.zones) {
    for (const zoneItems of Object.values(data.zones)) {
      walk(zoneItems as ComponentItem[]);
    }
  }
  return Array.from(fonts);
}

/**
 * Build a complete HTML document with styling
 */
function buildHtmlDocument(
  bodyHtml: string,
  title: string,
  cssStyles: string,
  fontLinks: string = '',
): string {
  return `<!DOCTYPE html>
<html lang="en" class="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${fontLinks}
  <style>
    /* CSS custom properties for theming (F-5.5) */
    :root {
      --primary-color: #1a1a1a;
      --muted-foreground: #6b7280;
      --border-color: #e5e7eb;
      --background: #ffffff;
    }
    /* Reset & base styles */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #1a1a1a; background-color: #ffffff; }
    img { max-width: 100%; height: auto; }
    /* Tables: use border-collapse: separate for reliable page break behavior (F-7.1) */
    table { border-collapse: separate; border-spacing: 0; width: 100%; }
    /* Tailwind-like utilities used by report components */
    .p-2 { padding: 0.5rem; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .m-4 { margin: 1rem; }
    .my-4 { margin-top: 1rem; margin-bottom: 1rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mt-2 { margin-top: 0.5rem; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .justify-center { justify-content: center; }
    .gap-2 { gap: 0.5rem; }
    .gap-4 { gap: 1rem; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .text-lg { font-size: 1.125rem; }
    .text-xl { font-size: 1.25rem; }
    .text-2xl { font-size: 1.5rem; }
    .text-3xl { font-size: 1.875rem; }
    .text-4xl { font-size: 2.25rem; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    .font-normal { font-weight: 400; }
    .border { border: 1px solid #e5e7eb; }
    .border-t { border-top: 1px solid #e5e7eb; }
    .border-b { border-bottom: 1px solid #e5e7eb; }
    .border-t-2 { border-top: 2px solid #e5e7eb; }
    .border-dashed { border-style: dashed; }
    .border-gray-200 { border-color: #e5e7eb; }
    .border-gray-300 { border-color: #d1d5db; }
    .rounded { border-radius: 0.25rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .bg-white { background-color: #ffffff; }
    .bg-gray-50 { background-color: #f9fafb; }
    .bg-gray-100 { background-color: #f3f4f6; }
    .text-gray-400 { color: #9ca3af; }
    .text-gray-500 { color: #6b7280; }
    .text-gray-600 { color: #4b5563; }
    .text-gray-700 { color: #374151; }
    .text-gray-900 { color: #111827; }
    .text-muted-foreground { color: #6b7280; }
    .overflow-x-auto { overflow-x: auto; }
    .w-full { width: 100%; }
    .min-w-0 { min-width: 0; }
    .tracking-tight { letter-spacing: -0.025em; }
    /* Print & page break styles — applied universally for PDF/print compatibility */
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; page-break-after: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    .avoid-break { page-break-inside: avoid; }
    .break-before { page-break-before: always; }
    .break-after { page-break-after: always; }
    h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
    p { orphans: 2; widows: 2; }
    /* Ensure overflow is visible for page-level containers so content flows to next page (F-7.5) */
    body > div { overflow: visible; }
    /* Recharts: ensure SVG charts render visibly in print (F-4.4) */
    .recharts-wrapper { overflow: visible !important; }
    .recharts-surface { overflow: visible !important; }
    ${sanitizeCss(cssStyles)}
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

/**
 * Escape HTML special characters to prevent XSS in title
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize CSS to prevent style tag injection.
 * Strips </style> sequences that could break out of the style block.
 */
function sanitizeCss(css: string): string {
  return css.replace(/<\/style\s*>/gi, '');
}
