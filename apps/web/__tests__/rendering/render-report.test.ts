import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Data } from '@puckeditor/core';

// Mock dependencies
vi.mock('@/lib/binding', () => ({
  resolveBindings: vi.fn((template) => template),
}));

vi.mock('@/lib/rendering/html-generator', () => ({
  generateHtml: vi.fn(() => Promise.resolve('<html><body>Test</body></html>')),
  generateMultiPageHtml: vi.fn(() => Promise.resolve('<html><body>Multi-page Test</body></html>')),
}));

vi.mock('@/lib/rendering/pdf-renderer', () => ({
  renderPdf: vi.fn(() => Promise.resolve(Buffer.from('mock-pdf'))),
}));

import { resolveBindings } from '@/lib/binding';
import { generateHtml, generateMultiPageHtml } from '@/lib/rendering/html-generator';
import { renderPdf } from '@/lib/rendering/pdf-renderer';
import { renderReport, type TemplatePage } from '@/lib/rendering/render-report';

describe('renderReport', () => {
  const mockTemplateData: Data = {
    content: [
      {
        type: 'TextBlock',
        props: {
          id: 'text-1',
          text: '{{message}}',
          fontSize: 'base',
          fontWeight: 'normal',
          alignment: 'left',
        },
      },
    ],
    root: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PDF rendering', () => {
    it('calls all pipeline steps in order', async () => {
      const data = { message: 'Hello' };
      const result = await renderReport({
        templateData: mockTemplateData,
        data,
        format: 'pdf',
      });

      expect(resolveBindings).toHaveBeenCalledWith(mockTemplateData, data);
      expect(generateHtml).toHaveBeenCalledWith(mockTemplateData, {
        title: 'Report',
        cssStyles: '',
      });
      expect(renderPdf).toHaveBeenCalledWith('<html><body>Test</body></html>', {});
      expect(result.content).toBeInstanceOf(Buffer);
      expect(result.contentType).toBe('application/pdf');
    });

    it('uses default format of pdf', async () => {
      const result = await renderReport({
        templateData: mockTemplateData,
      });

      expect(renderPdf).toHaveBeenCalled();
      expect(result.contentType).toBe('application/pdf');
    });

    it('passes custom title to HTML generator', async () => {
      await renderReport({
        templateData: mockTemplateData,
        title: 'Sales Report',
      });

      expect(generateHtml).toHaveBeenCalledWith(mockTemplateData, {
        title: 'Sales Report',
        cssStyles: '',
      });
    });

    it('passes custom CSS to HTML generator', async () => {
      const customCss = '.custom { color: red; }';
      await renderReport({
        templateData: mockTemplateData,
        cssStyles: customCss,
      });

      expect(generateHtml).toHaveBeenCalledWith(mockTemplateData, {
        title: 'Report',
        cssStyles: customCss,
      });
    });

    it('passes pageConfig to PDF renderer', async () => {
      const pageConfig = {
        format: 'A3' as const,
        orientation: 'landscape' as const,
        margin: {
          top: '10mm',
        },
      };

      await renderReport({
        templateData: mockTemplateData,
        pageConfig,
      });

      expect(renderPdf).toHaveBeenCalledWith('<html><body>Test</body></html>', pageConfig);
    });

    it('resolves bindings with provided data', async () => {
      const data = {
        name: 'John',
        items: [1, 2, 3],
      };

      await renderReport({
        templateData: mockTemplateData,
        data,
      });

      expect(resolveBindings).toHaveBeenCalledWith(mockTemplateData, data);
    });

    it('resolves bindings with empty data when not provided', async () => {
      await renderReport({
        templateData: mockTemplateData,
      });

      expect(resolveBindings).toHaveBeenCalledWith(mockTemplateData, {});
    });
  });

  describe('HTML rendering', () => {
    it('returns HTML directly without PDF conversion', async () => {
      const result = await renderReport({
        templateData: mockTemplateData,
        format: 'html',
      });

      expect(resolveBindings).toHaveBeenCalled();
      expect(generateHtml).toHaveBeenCalled();
      expect(renderPdf).not.toHaveBeenCalled();
      expect(result.content).toBe('<html><body>Test</body></html>');
      expect(result.contentType).toBe('text/html');
    });

    it('applies data bindings for HTML format', async () => {
      const data = { message: 'Hello' };
      await renderReport({
        templateData: mockTemplateData,
        data,
        format: 'html',
      });

      expect(resolveBindings).toHaveBeenCalledWith(mockTemplateData, data);
    });

    it('respects custom title for HTML format', async () => {
      await renderReport({
        templateData: mockTemplateData,
        format: 'html',
        title: 'Custom Title',
      });

      expect(generateHtml).toHaveBeenCalledWith(mockTemplateData, {
        title: 'Custom Title',
        cssStyles: '',
      });
    });
  });

  describe('binding resolution integration', () => {
    it('passes resolved template to HTML generator', async () => {
      const resolvedTemplate: Data = {
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

      vi.mocked(resolveBindings).mockReturnValue(resolvedTemplate);

      await renderReport({
        templateData: mockTemplateData,
        data: { message: 'Hello World' },
      });

      expect(generateHtml).toHaveBeenCalledWith(resolvedTemplate, expect.any(Object));
    });
  });

  describe('error handling', () => {
    it('propagates binding resolution errors', async () => {
      vi.mocked(resolveBindings).mockImplementation(() => {
        throw new Error('Binding error');
      });

      await expect(
        renderReport({
          templateData: mockTemplateData,
        }),
      ).rejects.toThrow('Binding error');
    });

    it('propagates HTML generation errors', async () => {
      // Reset binding mock to not throw
      vi.mocked(resolveBindings).mockImplementation((template) => template);
      
      vi.mocked(generateHtml).mockRejectedValue(new Error('HTML generation error'));

      await expect(
        renderReport({
          templateData: mockTemplateData,
        }),
      ).rejects.toThrow('HTML generation error');
    });

    it('propagates PDF rendering errors', async () => {
      // Reset mocks to not throw
      vi.mocked(resolveBindings).mockImplementation((template) => template);
      vi.mocked(generateHtml).mockResolvedValue('<html><body>Test</body></html>');
      
      vi.mocked(renderPdf).mockRejectedValue(new Error('PDF rendering error'));

      await expect(
        renderReport({
          templateData: mockTemplateData,
          format: 'pdf',
        }),
      ).rejects.toThrow('PDF rendering error');
    });

    it('throws error when neither templateData nor pages provided', async () => {
      await expect(
        renderReport({
          format: 'pdf',
        }),
      ).rejects.toThrow('Either templateData or pages must be provided');
    });
  });

  describe('multi-page rendering', () => {
    const mockPages: TemplatePage[] = [
      {
        id: 'page-1',
        name: 'Cover Page',
        content: {
          content: [
            {
              type: 'TextBlock',
              props: {
                id: 'text-1',
                text: 'Cover',
                fontSize: 'base',
                fontWeight: 'normal',
                alignment: 'left',
              },
            },
          ],
          root: {},
        },
      },
      {
        id: 'page-2',
        name: 'Details',
        content: {
          content: [
            {
              type: 'TextBlock',
              props: {
                id: 'text-2',
                text: '{{details}}',
                fontSize: 'base',
                fontWeight: 'normal',
                alignment: 'left',
              },
            },
          ],
          root: {},
        },
      },
    ];

    beforeEach(() => {
      vi.mocked(resolveBindings).mockImplementation((template) => template);
      vi.mocked(renderPdf).mockResolvedValue(Buffer.from('mock-pdf'));
      vi.mocked(generateMultiPageHtml).mockResolvedValue('<html><body>Multi-page Test</body></html>');
    });

    it('renders multiple pages to PDF', async () => {
      const result = await renderReport({
        pages: mockPages,
        data: { details: 'Page content' },
        format: 'pdf',
      });

      expect(resolveBindings).toHaveBeenCalledTimes(2);
      expect(generateMultiPageHtml).toHaveBeenCalledWith(
        expect.any(Array),
        {
          title: 'Report',
          cssStyles: '',
        }
      );
      expect(renderPdf).toHaveBeenCalledWith('<html><body>Multi-page Test</body></html>', {});
      expect(result.content).toBeInstanceOf(Buffer);
      expect(result.contentType).toBe('application/pdf');
    });

    it('renders multiple pages to HTML', async () => {
      const result = await renderReport({
        pages: mockPages,
        format: 'html',
      });

      expect(resolveBindings).toHaveBeenCalledTimes(2);
      expect(generateMultiPageHtml).toHaveBeenCalled();
      expect(renderPdf).not.toHaveBeenCalled();
      expect(result.content).toBe('<html><body>Multi-page Test</body></html>');
      expect(result.contentType).toBe('text/html');
    });

    it('resolves bindings for each page', async () => {
      const data = { details: 'Page content' };
      await renderReport({
        pages: mockPages,
        data,
      });

      expect(resolveBindings).toHaveBeenCalledWith(mockPages[0].content, data);
      expect(resolveBindings).toHaveBeenCalledWith(mockPages[1].content, data);
    });

    it('passes custom title and CSS for multi-page rendering', async () => {
      const customCss = '.page { margin: 20px; }';
      await renderReport({
        pages: mockPages,
        title: 'Multi-page Report',
        cssStyles: customCss,
      });

      expect(generateMultiPageHtml).toHaveBeenCalledWith(
        expect.any(Array),
        {
          title: 'Multi-page Report',
          cssStyles: customCss,
        }
      );
    });

    it('handles empty pages array by falling back to error', async () => {
      await expect(
        renderReport({
          pages: [],
        }),
      ).rejects.toThrow('Either templateData or pages must be provided');
    });

    it('uses single-page rendering when templateData provided alongside pages', async () => {
      // When both are provided, pages takes precedence
      await renderReport({
        templateData: mockTemplateData,
        pages: mockPages,
      });

      expect(generateMultiPageHtml).toHaveBeenCalled();
      expect(generateHtml).not.toHaveBeenCalled();
    });
  });
});
