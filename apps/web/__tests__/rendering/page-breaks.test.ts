import { describe, it, expect } from 'vitest';
import { generateHtml } from '@/lib/rendering/html-generator';
import type { Data } from '@puckeditor/core';

describe('page break CSS in rendered HTML', () => {
  it('includes print media query styles', async () => {
    const templateData: Data = { content: [], root: {} };
    const html = await generateHtml(templateData);

    expect(html).toContain('table { page-break-inside: auto; }');
    expect(html).toContain('tr { page-break-inside: avoid;');
    expect(html).toContain('thead { display: table-header-group; }');
    expect(html).toContain('tfoot { display: table-footer-group; }');
  });

  it('includes utility classes for page break control', async () => {
    const templateData: Data = { content: [], root: {} };
    const html = await generateHtml(templateData);

    expect(html).toContain('.avoid-break { page-break-inside: avoid; }');
    expect(html).toContain('.break-before { page-break-before: always; }');
    expect(html).toContain('.break-after { page-break-after: always; }');
  });

  it('includes orphan and widow control', async () => {
    const templateData: Data = { content: [], root: {} };
    const html = await generateHtml(templateData);

    expect(html).toContain('orphans: 2');
    expect(html).toContain('widows: 2');
  });

  it('includes heading page-break-after: avoid', async () => {
    const templateData: Data = { content: [], root: {} };
    const html = await generateHtml(templateData);

    expect(html).toContain('h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }');
  });
});
