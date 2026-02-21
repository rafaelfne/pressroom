import { describe, it, expect } from 'vitest';
import {
  styleTokenSchema,
  styleGuideCreateSchema,
  styleGuideUpdateSchema,
} from '@/lib/validation/style-guide-schemas';

describe('styleTokenSchema', () => {
  it('validates a valid token', () => {
    const result = styleTokenSchema.safeParse({
      name: 'primary-color',
      label: 'Primary Color',
      category: 'color',
      cssProperty: 'color',
      value: '#0066cc',
      sortOrder: 1,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = styleTokenSchema.safeParse({
      name: '',
      label: 'Primary Color',
      category: 'color',
      cssProperty: 'color',
      value: '#0066cc',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-kebab-case name', () => {
    const result = styleTokenSchema.safeParse({
      name: 'Text Primary',
      label: 'Primary Text',
      category: 'color',
      cssProperty: 'color',
      value: '#0066cc',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing label', () => {
    const result = styleTokenSchema.safeParse({
      name: 'primary-color',
      category: 'color',
      cssProperty: 'color',
      value: '#0066cc',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid category', () => {
    const result = styleTokenSchema.safeParse({
      name: 'primary-color',
      label: 'Primary Color',
      category: 'invalid-category',
      cssProperty: 'color',
      value: '#0066cc',
    });
    expect(result.success).toBe(false);
  });

  it('defaults sortOrder to 0', () => {
    const result = styleTokenSchema.safeParse({
      name: 'primary-color',
      label: 'Primary Color',
      category: 'color',
      cssProperty: 'color',
      value: '#0066cc',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sortOrder).toBe(0);
    }
  });
});

describe('styleGuideCreateSchema', () => {
  it('validates a complete create request', () => {
    const result = styleGuideCreateSchema.safeParse({
      name: 'My Style Guide',
      organizationId: 'org-123',
      isDefault: true,
      tokens: [
        {
          name: 'primary-color',
          label: 'Primary Color',
          category: 'color',
          cssProperty: 'color',
          value: '#0066cc',
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = styleGuideCreateSchema.safeParse({
      organizationId: 'org-123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing organizationId', () => {
    const result = styleGuideCreateSchema.safeParse({
      name: 'My Style Guide',
    });
    expect(result.success).toBe(false);
  });

  it('accepts request without tokens', () => {
    const result = styleGuideCreateSchema.safeParse({
      name: 'My Style Guide',
      organizationId: 'org-123',
    });
    expect(result.success).toBe(true);
  });

  it('defaults isDefault to false', () => {
    const result = styleGuideCreateSchema.safeParse({
      name: 'My Style Guide',
      organizationId: 'org-123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isDefault).toBe(false);
    }
  });
});

describe('styleGuideUpdateSchema', () => {
  it('validates with all fields', () => {
    const result = styleGuideUpdateSchema.safeParse({
      name: 'Updated Style Guide',
      isDefault: true,
      tokens: [
        {
          name: 'secondary-color',
          label: 'Secondary Color',
          category: 'color',
          cssProperty: 'color',
          value: '#ff6600',
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('validates with only name', () => {
    const result = styleGuideUpdateSchema.safeParse({
      name: 'Updated Name',
    });
    expect(result.success).toBe(true);
  });

  it('validates with empty object (all optional)', () => {
    const result = styleGuideUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects empty string name', () => {
    const result = styleGuideUpdateSchema.safeParse({
      name: '',
    });
    expect(result.success).toBe(false);
  });
});
