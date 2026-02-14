import { describe, it, expect } from 'vitest';
import { templateUpdateSchema } from '@/lib/validation/template-schemas';

describe('templateUpdateSchema', () => {
  it('accepts valid update with content', () => {
    const result = templateUpdateSchema.safeParse({
      content: { content: [], root: {} },
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
});
