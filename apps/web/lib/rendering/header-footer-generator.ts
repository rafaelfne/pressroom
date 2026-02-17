/**
 * Header/Footer Template Generator for Puppeteer PDF Rendering
 *
 * Generates self-contained HTML templates with inline styles for Puppeteer's
 * headerTemplate and footerTemplate options. These templates run in a separate
 * rendering context with limited CSS support, so all styles must be inline.
 *
 * @module lib/rendering/header-footer-generator
 */

import { resolveBindings } from '../binding';
import { pxToMm } from '../types/page-config';
import type {
  HeaderConfig,
  FooterConfig,
  ZoneContent,
  BorderConfig,
  PageNumberFormat,
} from '../types/header-footer-config';

/**
 * Escapes HTML special characters to prevent XSS/injection attacks.
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

/**
 * Generates HTML for a page number zone using Puppeteer's special CSS classes.
 */
function generatePageNumberHtml(format: PageNumberFormat): string {
  // The format strings use literal { and } which are not HTML special chars,
  // so we operate on the raw format string directly.
  let html = format as string;
  html = html.replace(/\{page\}/g, '<span class="pageNumber"></span>');
  html = html.replace(/\{total\}/g, '<span class="totalPages"></span>');
  return html;
}

/**
 * Generates HTML for a single zone content.
 */
function generateZoneHtml(
  content: ZoneContent,
  data: Record<string, unknown> = {},
): string {
  switch (content.type) {
    case 'empty':
      return '';

    case 'text': {
      // Resolve bindings in text content before passing to Puppeteer
      const resolved = resolveBindings(content.value, data);
      const escapedText = escapeHtml(String(resolved));

      const styles: string[] = [];
      if (content.fontSize) {
        styles.push(`font-size: ${content.fontSize}pt`);
      }
      if (content.fontWeight) {
        styles.push(`font-weight: ${content.fontWeight}`);
      }
      if (content.color) {
        styles.push(`color: ${escapeHtml(content.color)}`);
      }

      const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
      return `<span${styleAttr}>${escapedText}</span>`;
    }

    case 'image': {
      // Resolve bindings in image src
      const resolvedSrc = String(resolveBindings(content.src, data));
      const escapedSrc = escapeHtml(resolvedSrc);
      const altText = content.alt ? escapeHtml(content.alt) : '';

      const styles: string[] = ['display: inline-block', 'vertical-align: middle'];
      if (content.height) {
        styles.push(`height: ${content.height}mm`);
      }

      return `<img src="${escapedSrc}" alt="${altText}" style="${styles.join('; ')}" />`;
    }

    case 'pageNumber': {
      const styles: string[] = [];
      if (content.fontSize) {
        styles.push(`font-size: ${content.fontSize}pt`);
      }
      if (content.fontWeight) {
        styles.push(`font-weight: ${content.fontWeight}`);
      }
      if (content.color) {
        styles.push(`color: ${escapeHtml(content.color)}`);
      }

      const pageNumberHtml = generatePageNumberHtml(content.format);
      const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
      return `<span${styleAttr}>${pageNumberHtml}</span>`;
    }

    default:
      return '';
  }
}

/**
 * Generates inline border CSS string for a given border config and position.
 */
function generateBorderStyle(
  border: BorderConfig | undefined,
  position: 'top' | 'bottom',
): string {
  if (!border || !border.enabled) {
    return '';
  }
  const thickness = border.thickness ?? 1;
  const color = border.color ?? '#e5e7eb';
  return `border-${position}: ${thickness}px solid ${escapeHtml(color)}`;
}

/**
 * Builds the three-column table HTML shared by header and footer generators.
 */
function buildTemplateHtml(
  zones: { left: ZoneContent; center: ZoneContent; right: ZoneContent },
  options: {
    height: number;
    backgroundColor?: string;
    borderStyle: string;
  },
  data: Record<string, unknown>,
): string {
  const leftHtml = generateZoneHtml(zones.left, data);
  const centerHtml = generateZoneHtml(zones.center, data);
  const rightHtml = generateZoneHtml(zones.right, data);

  const wrapperStyles: string[] = [
    'width: 100%',
    'font-size: 10pt',
    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'padding: 0 15mm',
    'box-sizing: border-box',
    '-webkit-print-color-adjust: exact',
    'print-color-adjust: exact',
  ];

  if (options.height) {
    wrapperStyles.push(`height: ${pxToMm(options.height).toFixed(2)}mm`);
  }

  if (options.backgroundColor) {
    wrapperStyles.push(`background-color: ${escapeHtml(options.backgroundColor)}`);
  }

  if (options.borderStyle) {
    wrapperStyles.push(options.borderStyle);
  }

  const tableStyle = 'width: 100%; border-collapse: collapse; table-layout: fixed';
  const cellStyle = 'padding: 4px 0; vertical-align: middle; width: 33.33%; overflow: hidden';

  return `<div style="${wrapperStyles.join('; ')}">` +
    `<table style="${tableStyle}">` +
    `<tr>` +
    `<td style="${cellStyle}; text-align: left;">${leftHtml}</td>` +
    `<td style="${cellStyle}; text-align: center;">${centerHtml}</td>` +
    `<td style="${cellStyle}; text-align: right;">${rightHtml}</td>` +
    `</tr>` +
    `</table>` +
    `</div>`;
}

/**
 * Generates Puppeteer-compatible HTML template for a header.
 *
 * The generated HTML is self-contained with inline styles and uses
 * Puppeteer's special CSS classes for page numbers (.pageNumber, .totalPages).
 * Bindings in text zones are resolved before generating HTML, since Puppeteer's
 * headerTemplate cannot access the page's JavaScript context.
 */
export function generateHeaderHtml(
  config: HeaderConfig,
  data: Record<string, unknown> = {},
): string {
  if (!config.enabled) {
    return '<span></span>';
  }

  return buildTemplateHtml(config.zones, {
    height: config.height,
    backgroundColor: config.backgroundColor,
    borderStyle: generateBorderStyle(config.bottomBorder, 'bottom'),
  }, data);
}

/**
 * Generates Puppeteer-compatible HTML template for a footer.
 *
 * The generated HTML is self-contained with inline styles and uses
 * Puppeteer's special CSS classes for page numbers (.pageNumber, .totalPages).
 * Bindings in text zones are resolved before generating HTML, since Puppeteer's
 * footerTemplate cannot access the page's JavaScript context.
 */
export function generateFooterHtml(
  config: FooterConfig,
  data: Record<string, unknown> = {},
): string {
  if (!config.enabled) {
    return '<span></span>';
  }

  return buildTemplateHtml(config.zones, {
    height: config.height,
    backgroundColor: config.backgroundColor,
    borderStyle: generateBorderStyle(config.topBorder, 'top'),
  }, data);
}
