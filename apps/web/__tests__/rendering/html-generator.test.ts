import { describe, it, expect } from 'vitest';
import { generateHtml } from '@/lib/rendering/html-generator';
import type { Data } from '@puckeditor/core';

describe('generateHtml', () => {
  it('generates valid HTML document structure', async () => {
    const templateData: Data = {
      content: [],
      root: {},
    };

    const html = await generateHtml(templateData);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<head>');
    expect(html).toContain('<body>');
    expect(html).toContain('</html>');
  });

  it('uses default title when not provided', async () => {
    const templateData: Data = {
      content: [],
      root: {},
    };

    const html = await generateHtml(templateData);

    expect(html).toContain('<title>Report</title>');
  });

  it('uses custom title when provided', async () => {
    const templateData: Data = {
      content: [],
      root: {},
    };

    const html = await generateHtml(templateData, { title: 'Sales Report' });

    expect(html).toContain('<title>Sales Report</title>');
  });

  it('escapes HTML in title', async () => {
    const templateData: Data = {
      content: [],
      root: {},
    };

    const html = await generateHtml(templateData, { title: '<script>alert("XSS")</script>' });

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('includes base CSS styles', async () => {
    const templateData: Data = {
      content: [],
      root: {},
    };

    const html = await generateHtml(templateData);

    expect(html).toContain('<style>');
    expect(html).toContain('box-sizing: border-box');
    expect(html).toContain('.p-4');
    expect(html).toContain('.text-center');
    expect(html).toContain('.font-bold');
  });

  it('includes custom CSS when provided', async () => {
    const templateData: Data = {
      content: [],
      root: {},
    };

    const customCss = '.custom-class { color: red; }';
    const html = await generateHtml(templateData, { cssStyles: customCss });

    expect(html).toContain(customCss);
  });

  it('renders TextBlock component', async () => {
    const templateData: Data = {
      content: [
        {
          type: 'TextBlock',
          props: {
            id: 'text-1',
            text: 'Hello World',
            fontSize: 'base',
            fontWeight: 'normal',
            alignment: 'left',
          },
        },
      ],
      root: {},
    };

    const html = await generateHtml(templateData);

    expect(html).toContain('Hello World');
  });

  it('renders HeadingBlock component', async () => {
    const templateData: Data = {
      content: [
        {
          type: 'HeadingBlock',
          props: {
            id: 'heading-1',
            text: 'Main Title',
            level: 'h1',
            alignment: 'center',
          },
        },
      ],
      root: {},
    };

    const html = await generateHtml(templateData);

    expect(html).toContain('Main Title');
  });

  it('renders multiple components', async () => {
    const templateData: Data = {
      content: [
        {
          type: 'HeadingBlock',
          props: {
            id: 'heading-1',
            text: 'Title',
            level: 'h1',
            alignment: 'center',
          },
        },
        {
          type: 'TextBlock',
          props: {
            id: 'text-1',
            text: 'Content',
            fontSize: 'base',
            fontWeight: 'normal',
            alignment: 'left',
          },
        },
      ],
      root: {},
    };

    const html = await generateHtml(templateData);

    expect(html).toContain('Title');
    expect(html).toContain('Content');
  });

  it('escapes special characters in HTML', async () => {
    const templateData: Data = {
      content: [],
      root: {},
    };

    const title = "Test & <html> \"quotes\" 'apostrophes'";
    const html = await generateHtml(templateData, { title });

    expect(html).toContain('&amp;');
    expect(html).toContain('&lt;');
    expect(html).toContain('&gt;');
    expect(html).toContain('&quot;');
    expect(html).toContain('&#039;');
  });

  it('includes UTF-8 charset', async () => {
    const templateData: Data = {
      content: [],
      root: {},
    };

    const html = await generateHtml(templateData);

    expect(html).toContain('<meta charset="UTF-8">');
  });

  it('includes viewport meta tag', async () => {
    const templateData: Data = {
      content: [],
      root: {},
    };

    const html = await generateHtml(templateData);

    expect(html).toContain('<meta name="viewport"');
  });

  it('handles empty content array', async () => {
    const templateData: Data = {
      content: [],
      root: {},
    };

    const html = await generateHtml(templateData);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<body>');
  });

  it('handles Spacer component', async () => {
    const templateData: Data = {
      content: [
        {
          type: 'Spacer',
          props: {
            id: 'spacer-1',
            height: 32,
          },
        },
      ],
      root: {},
    };

    const html = await generateHtml(templateData);

    expect(html).toContain('<!DOCTYPE html>');
  });

  it('handles Divider component', async () => {
    const templateData: Data = {
      content: [
        {
          type: 'Divider',
          props: {
            id: 'divider-1',
            style: 'solid',
          },
        },
      ],
      root: {},
    };

    const html = await generateHtml(templateData);

    expect(html).toContain('<!DOCTYPE html>');
  });
});
