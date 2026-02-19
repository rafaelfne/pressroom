import { describe, it, expect } from 'vitest';
import {
  deepCloneWithNewIds,
  collectComponentsWithZones,
  findSelectedIndices,
  type ClipboardPayload,
} from '@/lib/puck/clipboard';
import type { ComponentData, Data } from '@puckeditor/core';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeItem(type: string, id: string, extra: Record<string, unknown> = {}): ComponentData {
  return { type, props: { id, ...extra } };
}

function makeData(
  content: ComponentData[],
  zones?: Record<string, ComponentData[]>,
): Data {
  return { content, root: {}, zones };
}

// ─── deepCloneWithNewIds ─────────────────────────────────────────────────────

describe('deepCloneWithNewIds', () => {
  it('produces new IDs for all cloned items', () => {
    const items = [makeItem('TextBlock', 'text-1'), makeItem('HeadingBlock', 'head-1')];
    const result = deepCloneWithNewIds(items, {});

    expect(result.items).toHaveLength(2);
    expect(result.items[0].props.id).not.toBe('text-1');
    expect(result.items[1].props.id).not.toBe('head-1');
  });

  it('preserves component types', () => {
    const items = [makeItem('TextBlock', 'text-1')];
    const result = deepCloneWithNewIds(items, {});

    expect(result.items[0].type).toBe('TextBlock');
  });

  it('preserves non-id props', () => {
    const items = [makeItem('TextBlock', 'text-1', { content: 'Hello', fontSize: 14 })];
    const result = deepCloneWithNewIds(items, {});

    expect(result.items[0].props.content).toBe('Hello');
    expect(result.items[0].props.fontSize).toBe(14);
  });

  it('produces unique IDs (no duplicates in one clone operation)', () => {
    const items = Array.from({ length: 20 }, (_, i) => makeItem('TextBlock', `t-${i}`));
    const result = deepCloneWithNewIds(items, {});

    const ids = result.items.map((item) => item.props.id);
    expect(new Set(ids).size).toBe(20);
  });

  it('remaps zone keys from old parent IDs to new parent IDs', () => {
    const items = [makeItem('Container', 'c-1')];
    const zones = { 'c-1:content': [makeItem('TextBlock', 'inner-1')] };
    const result = deepCloneWithNewIds(items, zones);

    const newParentId = result.items[0].props.id;
    expect(newParentId).not.toBe('c-1');

    // The zone key should use the new parent ID
    const zoneKeys = Object.keys(result.zones);
    expect(zoneKeys).toHaveLength(1);
    expect(zoneKeys[0]).toContain(newParentId);
    expect(zoneKeys[0]).not.toContain('c-1');
  });

  it('remaps IDs inside zone items too', () => {
    const items = [makeItem('Container', 'c-1')];
    const zones = { 'c-1:content': [makeItem('TextBlock', 'inner-1')] };
    const result = deepCloneWithNewIds(items, zones);

    const zoneKey = Object.keys(result.zones)[0];
    const innerItems = result.zones[zoneKey];
    expect(innerItems).toHaveLength(1);
    expect(innerItems[0].props.id).not.toBe('inner-1');
  });

  it('handles empty items and zones gracefully', () => {
    const result = deepCloneWithNewIds([], {});
    expect(result.items).toHaveLength(0);
    expect(Object.keys(result.zones)).toHaveLength(0);
  });

  it('does not mutate original items', () => {
    const items = [makeItem('TextBlock', 'text-1')];
    const original = JSON.parse(JSON.stringify(items));
    deepCloneWithNewIds(items, {});
    expect(items).toEqual(original);
  });

  it('does not mutate original zones', () => {
    const zones = { 'c-1:content': [makeItem('TextBlock', 'inner-1')] };
    const original = JSON.parse(JSON.stringify(zones));
    deepCloneWithNewIds([], zones);
    expect(zones).toEqual(original);
  });
});

// ─── collectComponentsWithZones ──────────────────────────────────────────────

describe('collectComponentsWithZones', () => {
  it('collects selected top-level items', () => {
    const data = makeData([
      makeItem('TextBlock', 'a'),
      makeItem('HeadingBlock', 'b'),
      makeItem('Spacer', 'c'),
    ]);

    const result = collectComponentsWithZones(data, new Set(['a', 'c']));
    expect(result.items).toHaveLength(2);
    expect(result.items.map((i) => i.props.id)).toEqual(['a', 'c']);
  });

  it('preserves content order when collecting', () => {
    const data = makeData([
      makeItem('TextBlock', 'a'),
      makeItem('HeadingBlock', 'b'),
      makeItem('Spacer', 'c'),
    ]);

    const result = collectComponentsWithZones(data, new Set(['c', 'a']));
    // Should follow content order (a before c), not selection order
    expect(result.items[0].props.id).toBe('a');
    expect(result.items[1].props.id).toBe('c');
  });

  it('collects zones owned by selected components', () => {
    const data = makeData(
      [makeItem('Container', 'container-1'), makeItem('TextBlock', 'text-1')],
      {
        'container-1:content': [makeItem('TextBlock', 'inner-1')],
        'text-1:zone': [makeItem('Spacer', 'sp-1')],
      },
    );

    const result = collectComponentsWithZones(data, new Set(['container-1']));
    expect(result.items).toHaveLength(1);
    expect(result.zones).toHaveProperty('container-1:content');
    expect(result.zones['container-1:content']).toHaveLength(1);
    // Should NOT include zones of non-selected components
    expect(result.zones).not.toHaveProperty('text-1:zone');
  });

  it('recursively collects nested zones', () => {
    const data = makeData(
      [makeItem('Container', 'outer')],
      {
        'outer:content': [makeItem('Container', 'mid')],
        'mid:content': [makeItem('TextBlock', 'deep')],
      },
    );

    const result = collectComponentsWithZones(data, new Set(['outer']));
    expect(result.zones).toHaveProperty('outer:content');
    expect(result.zones).toHaveProperty('mid:content');
  });

  it('returns empty when no items match', () => {
    const data = makeData([makeItem('TextBlock', 'a')]);
    const result = collectComponentsWithZones(data, new Set(['nonexistent']));
    expect(result.items).toHaveLength(0);
    expect(Object.keys(result.zones)).toHaveLength(0);
  });

  it('handles data with no zones', () => {
    const data = makeData([makeItem('TextBlock', 'a')]);
    const result = collectComponentsWithZones(data, new Set(['a']));
    expect(result.items).toHaveLength(1);
    expect(Object.keys(result.zones)).toHaveLength(0);
  });
});

// ─── findSelectedIndices ─────────────────────────────────────────────────────

describe('findSelectedIndices', () => {
  const content = [
    makeItem('TextBlock', 'a'),
    makeItem('HeadingBlock', 'b'),
    makeItem('Spacer', 'c'),
    makeItem('Divider', 'd'),
  ];

  it('returns indices of selected items in ascending order', () => {
    const result = findSelectedIndices(content, new Set(['d', 'a']));
    expect(result).toEqual([0, 3]);
  });

  it('returns empty array when nothing selected', () => {
    const result = findSelectedIndices(content, new Set());
    expect(result).toEqual([]);
  });

  it('returns empty array when no matches found', () => {
    const result = findSelectedIndices(content, new Set(['nonexistent']));
    expect(result).toEqual([]);
  });

  it('handles all items selected', () => {
    const result = findSelectedIndices(content, new Set(['a', 'b', 'c', 'd']));
    expect(result).toEqual([0, 1, 2, 3]);
  });

  it('handles single item selected', () => {
    const result = findSelectedIndices(content, new Set(['c']));
    expect(result).toEqual([2]);
  });
});
