import { describe, it, expect } from 'vitest';
import { DEFAULT_SAMPLE_DATA } from '@/lib/templates/default-sample-data';

describe('DEFAULT_SAMPLE_DATA', () => {
  it('contains company information', () => {
    expect(DEFAULT_SAMPLE_DATA).toHaveProperty('company');
    const company = DEFAULT_SAMPLE_DATA.company as Record<string, unknown>;
    expect(company.name).toBe('Acme Corp');
    expect(company.address).toBeDefined();
    expect(company.email).toBeDefined();
  });

  it('contains report metadata', () => {
    expect(DEFAULT_SAMPLE_DATA).toHaveProperty('report');
    const report = DEFAULT_SAMPLE_DATA.report as Record<string, unknown>;
    expect(report.title).toBeDefined();
    expect(report.date).toBeDefined();
    expect(report.author).toBeDefined();
  });

  it('contains items array', () => {
    expect(DEFAULT_SAMPLE_DATA).toHaveProperty('items');
    expect(Array.isArray(DEFAULT_SAMPLE_DATA.items)).toBe(true);
    const items = DEFAULT_SAMPLE_DATA.items as Array<Record<string, unknown>>;
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty('name');
    expect(items[0]).toHaveProperty('quantity');
    expect(items[0]).toHaveProperty('price');
  });

  it('contains summary', () => {
    expect(DEFAULT_SAMPLE_DATA).toHaveProperty('summary');
    const summary = DEFAULT_SAMPLE_DATA.summary as Record<string, unknown>;
    expect(summary.total).toBeDefined();
    expect(summary.count).toBeDefined();
  });

  it('is JSON-serializable', () => {
    const serialized = JSON.stringify(DEFAULT_SAMPLE_DATA);
    const deserialized = JSON.parse(serialized) as Record<string, unknown>;
    expect(deserialized).toEqual(DEFAULT_SAMPLE_DATA);
  });
});
