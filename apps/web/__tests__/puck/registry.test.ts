import { describe, it, expect } from 'vitest';
import { getComponentNames, getComponentsByCategory } from '@/lib/puck/registry';
import { puckConfig } from '@/lib/puck/config';

describe('registry helpers', () => {
  it('getComponentNames returns all component names', () => {
    const names = getComponentNames(puckConfig);
    expect(names).toContain('TextBlock');
    expect(names).toContain('HeadingBlock');
    expect(names).toContain('ImageBlock');
    expect(names).toContain('Spacer');
    expect(names).toContain('Divider');
    expect(names).toContain('PageBreak');
    expect(names).toContain('ReportHeader');
    expect(names).toContain('ReportFooter');
    expect(names).toHaveLength(8);
  });

  it('getComponentsByCategory returns components for a valid category', () => {
    const layoutComponents = getComponentsByCategory(puckConfig, 'layout');
    expect(layoutComponents).toContain('Spacer');
    expect(layoutComponents).toContain('Divider');
    expect(layoutComponents).toContain('PageBreak');
  });

  it('getComponentsByCategory returns empty array for unknown category', () => {
    const result = getComponentsByCategory(puckConfig, 'nonexistent');
    expect(result).toEqual([]);
  });
});
