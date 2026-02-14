import { describe, it, expect } from 'vitest';
import { getComponentNames, getComponentsByCategory } from '@/lib/puck/registry';
import { puckConfig } from '@/lib/puck/config';

describe('registry helpers', () => {
  it('getComponentNames returns all component names', () => {
    const names = getComponentNames(puckConfig);
    expect(names).toContain('TextBlock');
    expect(names).toContain('Spacer');
    expect(names).toHaveLength(2);
  });

  it('getComponentsByCategory returns components for a valid category', () => {
    const layoutComponents = getComponentsByCategory(puckConfig, 'layout');
    expect(layoutComponents).toContain('Spacer');
  });

  it('getComponentsByCategory returns empty array for unknown category', () => {
    const result = getComponentsByCategory(puckConfig, 'nonexistent');
    expect(result).toEqual([]);
  });
});
