import { describe, it, expect } from 'vitest';
import {
  templateCreateSchema,
  templateUpdateSchema,
  templateListQuerySchema,
} from '@/lib/validation/template-schemas';

describe('templateCreateSchema', () => {
  it('accepts valid create with name only', () => {
    const result = templateCreateSchema.safeParse({ name: 'My Template' });
    expect(result.success).toBe(true);
  });

  it('accepts valid create with all fields', () => {
    const result = templateCreateSchema.safeParse({
      name: 'My Template',
      description: 'A test template',
      templateData: { content: [], root: {} },
      sampleData: { key: 'value' },
      pageConfig: { width: 800, height: 600, orientation: 'portrait' },
      tags: ['report', 'monthly'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = templateCreateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = templateCreateSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid templateData structure', () => {
    const result = templateCreateSchema.safeParse({
      name: 'Test',
      templateData: { invalid: true },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid pageConfig orientation', () => {
    const result = templateCreateSchema.safeParse({
      name: 'Test',
      pageConfig: { orientation: 'diagonal' },
    });
    expect(result.success).toBe(false);
  });
});

describe('templateUpdateSchema', () => {
  it('accepts valid update with templateData', () => {
    const result = templateUpdateSchema.safeParse({
      templateData: { content: [], root: {} },
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid update with name only', () => {
    const result = templateUpdateSchema.safeParse({
      name: 'My Template',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name string', () => {
    const result = templateUpdateSchema.safeParse({
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty object (all optional)', () => {
    const result = templateUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts update with tags', () => {
    const result = templateUpdateSchema.safeParse({
      tags: ['report', 'monthly'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts update with sampleData', () => {
    const result = templateUpdateSchema.safeParse({
      sampleData: { items: [1, 2, 3] },
    });
    expect(result.success).toBe(true);
  });

  it('accepts update with pageConfig', () => {
    const result = templateUpdateSchema.safeParse({
      pageConfig: { orientation: 'landscape', margin: { top: 10 } },
    });
    expect(result.success).toBe(true);
  });
});

describe('templateListQuerySchema', () => {
  it('provides defaults for empty query', () => {
    const result = templateListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortBy).toBe('updatedAt');
      expect(result.data.sortOrder).toBe('desc');
    }
  });

  it('accepts valid query params', () => {
    const result = templateListQuerySchema.safeParse({
      page: '2',
      limit: '10',
      search: 'report',
      tags: 'monthly,financial',
      sortBy: 'name',
      sortOrder: 'asc',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
      expect(result.data.search).toBe('report');
      expect(result.data.tags).toBe('monthly,financial');
    }
  });

  it('coerces string numbers to numbers', () => {
    const result = templateListQuerySchema.safeParse({
      page: '3',
      limit: '50',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it('rejects limit over 100', () => {
    const result = templateListQuerySchema.safeParse({
      limit: '200',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid sortBy', () => {
    const result = templateListQuerySchema.safeParse({
      sortBy: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-positive page', () => {
    const result = templateListQuerySchema.safeParse({
      page: '0',
    });
    expect(result.success).toBe(false);
  });
});
