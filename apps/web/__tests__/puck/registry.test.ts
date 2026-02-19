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
    expect(names).toContain('DataTable');
    expect(names).toContain('ChartBlock');
    expect(names).toContain('Container');
    expect(names).toContain('GridRow');
    expect(names).toContain('GridColumn');
    expect(names).toContain('Section');
    expect(names).toHaveLength(12);
  });

  it('getComponentsByCategory returns components for a valid category', () => {
    const layoutComponents = getComponentsByCategory(puckConfig, 'layout');
    expect(layoutComponents).toContain('Container');
    expect(layoutComponents).toContain('GridRow');
    expect(layoutComponents).toContain('GridColumn');
    expect(layoutComponents).toContain('Section');
    expect(layoutComponents).toContain('Spacer');
    expect(layoutComponents).toContain('Divider');
    expect(layoutComponents).toContain('PageBreak');
  });

  it('getComponentsByCategory returns empty array for unknown category', () => {
    const result = getComponentsByCategory(puckConfig, 'nonexistent');
    expect(result).toEqual([]);
  });
});
