import { describe, it, expect } from 'vitest';
import { renderRequestSchema } from '@/lib/validation/render-schemas';

describe('renderRequestSchema', () => {
  it('accepts valid request with templateId', () => {
    const result = renderRequestSchema.safeParse({
      templateId: 'tpl-123',
      data: { key: 'value' },
      format: 'pdf',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid request with templateData', () => {
    const result = renderRequestSchema.safeParse({
      templateData: {
        content: [],
        root: {},
      },
      format: 'html',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid request with both templateId and templateData', () => {
    const result = renderRequestSchema.safeParse({
      templateId: 'tpl-123',
      templateData: {
        content: [],
        root: {},
      },
    });
    expect(result.success).toBe(true);
  });

  it('provides default format of pdf', () => {
    const result = renderRequestSchema.safeParse({
      templateId: 'tpl-123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.format).toBe('pdf');
    }
  });

  it('rejects when neither templateId nor templateData provided', () => {
    const result = renderRequestSchema.safeParse({
      data: { key: 'value' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Either templateId, templateData, or pages');
    }
  });

  it('accepts valid pageConfig with format', () => {
    const result = renderRequestSchema.safeParse({
      templateId: 'tpl-123',
      pageConfig: {
        format: 'A4',
        orientation: 'landscape',
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid pageConfig with custom dimensions', () => {
    const result = renderRequestSchema.safeParse({
      templateId: 'tpl-123',
      pageConfig: {
        width: '800px',
        height: '600px',
        margin: {
          top: '10mm',
          bottom: '10mm',
        },
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid pageConfig with header/footer', () => {
    const result = renderRequestSchema.safeParse({
      templateId: 'tpl-123',
      pageConfig: {
        displayHeaderFooter: true,
        headerTemplate: '<div>Header</div>',
        footerTemplate: '<div>Footer</div>',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid format enum', () => {
    const result = renderRequestSchema.safeParse({
      templateId: 'tpl-123',
      format: 'docx',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid page format enum', () => {
    const result = renderRequestSchema.safeParse({
      templateId: 'tpl-123',
      pageConfig: {
        format: 'B5',
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid orientation enum', () => {
    const result = renderRequestSchema.safeParse({
      templateId: 'tpl-123',
      pageConfig: {
        orientation: 'diagonal',
      },
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty data object', () => {
    const result = renderRequestSchema.safeParse({
      templateId: 'tpl-123',
      data: {},
    });
    expect(result.success).toBe(true);
  });

  it('accepts complex data object', () => {
    const result = renderRequestSchema.safeParse({
      templateId: 'tpl-123',
      data: {
        items: [1, 2, 3],
        nested: { key: 'value' },
        array: ['a', 'b'],
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts templateData with zones', () => {
    const result = renderRequestSchema.safeParse({
      templateData: {
        content: [],
        root: {},
        zones: {
          header: [],
          footer: [],
        },
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid templateData structure', () => {
    const result = renderRequestSchema.safeParse({
      templateData: {
        invalid: true,
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty templateId string', () => {
    const result = renderRequestSchema.safeParse({
      templateId: '',
    });
    expect(result.success).toBe(false);
  });

  describe('pages field validation', () => {
    it('accepts valid pages array', () => {
      const result = renderRequestSchema.safeParse({
        pages: [
          {
            id: 'page-1',
            name: 'Cover',
            content: {
              content: [],
              root: {},
            },
          },
          {
            id: 'page-2',
            name: 'Details',
            content: {
              content: [],
              root: {},
            },
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('accepts pages with zones', () => {
      const result = renderRequestSchema.safeParse({
        pages: [
          {
            id: 'page-1',
            name: 'Page 1',
            content: {
              content: [],
              root: {},
              zones: {
                header: [],
                footer: [],
              },
            },
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty pages array', () => {
      const result = renderRequestSchema.safeParse({
        pages: [],
      });
      expect(result.success).toBe(false);
    });

    it('rejects pages with missing id', () => {
      const result = renderRequestSchema.safeParse({
        pages: [
          {
            name: 'Page 1',
            content: {
              content: [],
              root: {},
            },
          },
        ],
      });
      expect(result.success).toBe(false);
    });

    it('rejects pages with empty id', () => {
      const result = renderRequestSchema.safeParse({
        pages: [
          {
            id: '',
            name: 'Page 1',
            content: {
              content: [],
              root: {},
            },
          },
        ],
      });
      expect(result.success).toBe(false);
    });

    it('rejects pages with missing name', () => {
      const result = renderRequestSchema.safeParse({
        pages: [
          {
            id: 'page-1',
            content: {
              content: [],
              root: {},
            },
          },
        ],
      });
      expect(result.success).toBe(false);
    });

    it('rejects pages with invalid content structure', () => {
      const result = renderRequestSchema.safeParse({
        pages: [
          {
            id: 'page-1',
            name: 'Page 1',
            content: {
              invalid: true,
            },
          },
        ],
      });
      expect(result.success).toBe(false);
    });

    it('accepts pages with data field', () => {
      const result = renderRequestSchema.safeParse({
        pages: [
          {
            id: 'page-1',
            name: 'Page 1',
            content: {
              content: [],
              root: {},
            },
          },
        ],
        data: {
          name: 'John',
          items: [1, 2, 3],
        },
      });
      expect(result.success).toBe(true);
    });
  });
});
