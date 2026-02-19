import { describe, it, expect } from 'vitest';
import type { Data, ComponentData } from '@puckeditor/core';
import {
  removeComponents,
  duplicateComponents,
  extractComponents,
  pasteComponents,
  collectAllIds,
  collectAllIdsDeep,
  isDescendantOf,
  generateComponentId,
  type SerializedComponent,
} from '@/lib/studio/multi-select-operations';

// Test helpers
function makeComponent(id: string, type = 'TextBlock'): ComponentData {
  return { type, props: { id } };
}

function makeData(
  content: ComponentData[],
  zones?: Record<string, ComponentData[]>
): Data {
  return { root: {}, content, zones: zones || {} };
}

describe('multi-select-operations', () => {
  describe('generateComponentId', () => {
    it('generates unique IDs', () => {
      const id1 = generateComponentId();
      const id2 = generateComponentId();
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('generates string IDs', () => {
      const id = generateComponentId();
      expect(typeof id).toBe('string');
    });
  });

  describe('removeComponents', () => {
    it('removes a single component from root content', () => {
      const data = makeData([
        makeComponent('a'),
        makeComponent('b'),
        makeComponent('c'),
      ]);

      const result = removeComponents(data, new Set(['b']));

      expect(result.content).toHaveLength(2);
      expect(result.content.map((c) => c.props.id)).toEqual(['a', 'c']);
    });

    it('removes multiple components from root content', () => {
      const data = makeData([
        makeComponent('a'),
        makeComponent('b'),
        makeComponent('c'),
        makeComponent('d'),
      ]);

      const result = removeComponents(data, new Set(['b', 'd']));

      expect(result.content).toHaveLength(2);
      expect(result.content.map((c) => c.props.id)).toEqual(['a', 'c']);
    });

    it('removes component from zones', () => {
      const data = makeData(
        [makeComponent('a')],
        {
          'a-slot': [makeComponent('child1'), makeComponent('child2')],
        }
      );

      const result = removeComponents(data, new Set(['child1']));

      expect(result.zones?.['a-slot']).toHaveLength(1);
      expect(result.zones?.['a-slot']?.[0].props.id).toBe('child2');
    });

    it('handles parent+child both selected (only parent removed, not double-removal)', () => {
      const data = makeData(
        [makeComponent('parent'), makeComponent('other')],
        {
          'parent-slot': [makeComponent('child')],
        }
      );

      // Select both parent and child - should only remove parent
      const result = removeComponents(data, new Set(['parent', 'child']));

      // Parent removed from content
      expect(result.content).toHaveLength(1);
      expect(result.content[0].props.id).toBe('other');

      // Parent's zone should be cleaned up entirely
      expect(result.zones?.['parent-slot']).toBeUndefined();
    });

    it('cleans up zones belonging to removed components', () => {
      const data = makeData(
        [makeComponent('a'), makeComponent('b')],
        {
          'a-slot': [makeComponent('a-child')],
          'b-slot': [makeComponent('b-child')],
        }
      );

      const result = removeComponents(data, new Set(['a']));

      // Component 'a' removed
      expect(result.content).toHaveLength(1);
      expect(result.content[0].props.id).toBe('b');

      // Zone 'a-slot' cleaned up
      expect(result.zones?.['a-slot']).toBeUndefined();

      // Zone 'b-slot' preserved
      expect(result.zones?.['b-slot']).toHaveLength(1);
      expect(result.zones?.['b-slot']?.[0].props.id).toBe('b-child');
    });

    it('returns original data when idsToRemove is empty', () => {
      const data = makeData([makeComponent('a'), makeComponent('b')]);

      const result = removeComponents(data, new Set());

      expect(result).toBe(data);
    });

    it('handles empty content gracefully', () => {
      const data = makeData([]);

      const result = removeComponents(data, new Set(['nonexistent']));

      expect(result.content).toHaveLength(0);
    });

    it('cleans up empty zones after removal', () => {
      const data = makeData(
        [makeComponent('a')],
        {
          'a-slot': [makeComponent('child')],
        }
      );

      const result = removeComponents(data, new Set(['child']));

      // Zone should be removed when empty
      expect(result.zones?.['a-slot']).toBeUndefined();
    });
  });

  describe('duplicateComponents', () => {
    it('duplicates a single root component, inserted after original', () => {
      const data = makeData([
        makeComponent('a'),
        makeComponent('b'),
        makeComponent('c'),
      ]);

      const { newData, newIds } = duplicateComponents(data, new Set(['b']));

      expect(newData.content).toHaveLength(4);
      expect(newIds).toHaveLength(1);

      // Check order: a, b, b-copy, c
      expect(newData.content[0].props.id).toBe('a');
      expect(newData.content[1].props.id).toBe('b');
      expect(newData.content[2].props.id).toBe(newIds[0]); // duplicate after original
      expect(newData.content[3].props.id).toBe('c');
    });

    it('duplicates multiple root components', () => {
      const data = makeData([
        makeComponent('a'),
        makeComponent('b'),
        makeComponent('c'),
      ]);

      const { newData, newIds } = duplicateComponents(data, new Set(['a', 'c']));

      expect(newData.content).toHaveLength(5);
      expect(newIds).toHaveLength(2);

      // Check order: a, a-copy, b, c, c-copy
      expect(newData.content[0].props.id).toBe('a');
      expect(newData.content[1].props.id).toBe(newIds[0]); // first duplicate
      expect(newData.content[2].props.id).toBe('b');
      expect(newData.content[3].props.id).toBe('c');
      expect(newData.content[4].props.id).toBe(newIds[1]); // second duplicate
    });

    it('each copy gets a unique ID (different from original)', () => {
      const data = makeData([makeComponent('original')]);

      const { newData, newIds } = duplicateComponents(data, new Set(['original']));

      expect(newIds[0]).not.toBe('original');
      expect(newData.content[0].props.id).toBe('original');
      expect(newData.content[1].props.id).toBe(newIds[0]);
      expect(newData.content[0].props.id).not.toBe(newData.content[1].props.id);
    });

    it('recursively duplicates children in zones with new IDs', () => {
      const data = makeData(
        [makeComponent('parent')],
        {
          'parent-slot': [makeComponent('child1'), makeComponent('child2')],
        }
      );

      const { newData, newIds } = duplicateComponents(data, new Set(['parent']));

      expect(newData.content).toHaveLength(2);
      expect(newIds).toHaveLength(1);

      const duplicateId = newIds[0];

      // Original parent's zone still exists
      expect(newData.zones?.['parent-slot']).toHaveLength(2);
      expect(newData.zones?.['parent-slot']?.[0].props.id).toBe('child1');
      expect(newData.zones?.['parent-slot']?.[1].props.id).toBe('child2');

      // Duplicate parent has its own zone with new child IDs
      expect(newData.zones?.[`${duplicateId}-slot`]).toHaveLength(2);
      const duplicateChild1 = newData.zones?.[`${duplicateId}-slot`]?.[0].props.id as string;
      const duplicateChild2 = newData.zones?.[`${duplicateId}-slot`]?.[1].props.id as string;

      expect(duplicateChild1).not.toBe('child1');
      expect(duplicateChild2).not.toBe('child2');
      expect(duplicateChild1).not.toBe(duplicateChild2);
    });

    it('returns the new IDs of the duplicated components', () => {
      const data = makeData([makeComponent('a'), makeComponent('b')]);

      const { newIds } = duplicateComponents(data, new Set(['a', 'b']));

      expect(newIds).toHaveLength(2);
      expect(newIds[0]).toBeTruthy();
      expect(newIds[1]).toBeTruthy();
      expect(newIds[0]).not.toBe('a');
      expect(newIds[1]).not.toBe('b');
      expect(newIds[0]).not.toBe(newIds[1]);
    });

    it('returns original data when idsToDuplicate is empty', () => {
      const data = makeData([makeComponent('a')]);

      const { newData, newIds } = duplicateComponents(data, new Set());

      expect(newData).toBe(data);
      expect(newIds).toHaveLength(0);
    });
  });

  describe('extractComponents', () => {
    it('extracts components in order from root content', () => {
      const data = makeData([
        makeComponent('a'),
        makeComponent('b'),
        makeComponent('c'),
      ]);

      const result = extractComponents(data, new Set(['b', 'a']));

      expect(result).toHaveLength(2);
      // Should preserve document order (a comes before b)
      expect(result[0].originalId).toBe('a');
      expect(result[1].originalId).toBe('b');
    });

    it('preserves relative order', () => {
      const data = makeData([
        makeComponent('first'),
        makeComponent('second'),
        makeComponent('third'),
        makeComponent('fourth'),
      ]);

      const result = extractComponents(data, new Set(['fourth', 'second']));

      expect(result).toHaveLength(2);
      // Document order: second before fourth
      expect(result[0].originalId).toBe('second');
      expect(result[1].originalId).toBe('fourth');
    });

    it('recursively includes slot children', () => {
      const data = makeData(
        [makeComponent('parent')],
        {
          'parent-slot': [makeComponent('child1'), makeComponent('child2')],
          'child1-nested': [makeComponent('grandchild')],
        }
      );

      const result = extractComponents(data, new Set(['parent']));

      expect(result).toHaveLength(1);
      expect(result[0].originalId).toBe('parent');

      // Check slots
      expect(result[0].slots).toHaveProperty('slot');
      expect(result[0].slots.slot).toHaveLength(2);
      expect(result[0].slots.slot[0].originalId).toBe('child1');
      expect(result[0].slots.slot[1].originalId).toBe('child2');

      // Check nested slots
      expect(result[0].slots.slot[0].slots).toHaveProperty('nested');
      expect(result[0].slots.slot[0].slots.nested).toHaveLength(1);
      expect(result[0].slots.slot[0].slots.nested[0].originalId).toBe('grandchild');
    });

    it('extracts component from a zone', () => {
      const data = makeData(
        [makeComponent('parent')],
        {
          'parent-zone': [makeComponent('child')],
        }
      );

      const result = extractComponents(data, new Set(['child']));

      expect(result).toHaveLength(1);
      expect(result[0].originalId).toBe('child');
    });

    it('returns empty array for empty id set', () => {
      const data = makeData([makeComponent('a'), makeComponent('b')]);

      const result = extractComponents(data, new Set());

      expect(result).toHaveLength(0);
    });

    it('preserves component type and props', () => {
      const data = makeData([
        {
          type: 'CustomComponent',
          props: { id: 'comp1', title: 'Test', value: 42 },
        },
      ]);

      const result = extractComponents(data, new Set(['comp1']));

      expect(result[0].type).toBe('CustomComponent');
      expect(result[0].props.title).toBe('Test');
      expect(result[0].props.value).toBe(42);
    });
  });

  describe('pasteComponents + regenerateIds', () => {
    it('roundtrip: extract → paste = preserves structure', () => {
      const originalData = makeData(
        [makeComponent('parent')],
        {
          'parent-slot': [makeComponent('child')],
        }
      );

      // Extract
      const serialized = extractComponents(originalData, new Set(['parent']));

      // Paste into new data
      const emptyData = makeData([]);
      const { newData } = pasteComponents(emptyData, serialized);

      expect(newData.content).toHaveLength(1);
      expect(newData.content[0].type).toBe('TextBlock');

      // Check zones exist
      const pastedId = newData.content[0].props.id as string;
      expect(newData.zones?.[`${pastedId}-slot`]).toHaveLength(1);
      expect(newData.zones?.[`${pastedId}-slot`]?.[0].type).toBe('TextBlock');
    });

    it('all IDs are regenerated (no original IDs reused)', () => {
      const serialized: SerializedComponent[] = [
        {
          type: 'TextBlock',
          props: { id: 'original-id', text: 'Hello' },
          slots: {
            content: [
              {
                type: 'TextBlock',
                props: { id: 'child-original', text: 'Child' },
                slots: {},
                originalId: 'child-original',
              },
            ],
          },
          originalId: 'original-id',
        },
      ];

      const data = makeData([]);
      const { newData, newIds } = pasteComponents(data, serialized);

      // Root component gets new ID
      expect(newIds[0]).not.toBe('original-id');
      expect(newData.content[0].props.id).toBe(newIds[0]);

      // Child component gets new ID
      const zoneKey = `${newIds[0]}-content`;
      expect(newData.zones?.[zoneKey]).toHaveLength(1);
      expect(newData.zones?.[zoneKey]?.[0].props.id).not.toBe('child-original');
    });

    it('inserts at end of root content by default', () => {
      const data = makeData([makeComponent('existing1'), makeComponent('existing2')]);

      const serialized: SerializedComponent[] = [
        {
          type: 'TextBlock',
          props: { id: 'new' },
          slots: {},
          originalId: 'new',
        },
      ];

      const { newData } = pasteComponents(data, serialized);

      expect(newData.content).toHaveLength(3);
      expect(newData.content[0].props.id).toBe('existing1');
      expect(newData.content[1].props.id).toBe('existing2');
      // Third item is the pasted component
      expect(newData.content[2].type).toBe('TextBlock');
    });

    it('inserts after specified component when afterId is given', () => {
      const data = makeData([
        makeComponent('first'),
        makeComponent('second'),
        makeComponent('third'),
      ]);

      const serialized: SerializedComponent[] = [
        {
          type: 'TextBlock',
          props: { id: 'new' },
          slots: {},
          originalId: 'new',
        },
      ];

      const { newData, newIds } = pasteComponents(data, serialized, undefined, 'first');

      expect(newData.content).toHaveLength(4);
      expect(newData.content[0].props.id).toBe('first');
      expect(newData.content[1].props.id).toBe(newIds[0]); // inserted after 'first'
      expect(newData.content[2].props.id).toBe('second');
      expect(newData.content[3].props.id).toBe('third');
    });

    it('handles empty components array', () => {
      const data = makeData([makeComponent('a')]);

      const { newData, newIds } = pasteComponents(data, []);

      expect(newData).toBe(data);
      expect(newIds).toHaveLength(0);
    });

    it('inserts into specific zone when targetZone is provided', () => {
      const data = makeData(
        [makeComponent('parent')],
        {
          'parent-slot': [makeComponent('existing-child')],
        }
      );

      const serialized: SerializedComponent[] = [
        {
          type: 'TextBlock',
          props: { id: 'new-child' },
          slots: {},
          originalId: 'new-child',
        },
      ];

      const { newData, newIds } = pasteComponents(data, serialized, 'parent-slot');

      // Should append to the zone
      expect(newData.zones?.['parent-slot']).toHaveLength(2);
      expect(newData.zones?.['parent-slot']?.[0].props.id).toBe('existing-child');
      expect(newData.zones?.['parent-slot']?.[1].props.id).toBe(newIds[0]);
    });

    it('inserts into zone after specified component', () => {
      const data = makeData(
        [makeComponent('parent')],
        {
          'parent-slot': [makeComponent('child1'), makeComponent('child2')],
        }
      );

      const serialized: SerializedComponent[] = [
        {
          type: 'TextBlock',
          props: { id: 'new' },
          slots: {},
          originalId: 'new',
        },
      ];

      const { newData, newIds } = pasteComponents(data, serialized, 'parent-slot', 'child1');

      expect(newData.zones?.['parent-slot']).toHaveLength(3);
      expect(newData.zones?.['parent-slot']?.[0].props.id).toBe('child1');
      expect(newData.zones?.['parent-slot']?.[1].props.id).toBe(newIds[0]);
      expect(newData.zones?.['parent-slot']?.[2].props.id).toBe('child2');
    });
  });

  describe('collectAllIds / collectAllIdsDeep', () => {
    it('collectAllIds returns only root-level IDs', () => {
      const data = makeData(
        [makeComponent('a'), makeComponent('b'), makeComponent('c')],
        {
          'a-slot': [makeComponent('child1')],
          'b-slot': [makeComponent('child2')],
        }
      );

      const ids = collectAllIds(data);

      expect(ids).toHaveLength(3);
      expect(ids).toEqual(['a', 'b', 'c']);
    });

    it('collectAllIdsDeep returns ALL IDs including nested zones', () => {
      const data = makeData(
        [makeComponent('root1'), makeComponent('root2')],
        {
          'root1-slot': [makeComponent('child1'), makeComponent('child2')],
          'child1-nested': [makeComponent('grandchild')],
        }
      );

      const ids = collectAllIdsDeep(data);

      expect(ids).toHaveLength(5);
      expect(ids).toContain('root1');
      expect(ids).toContain('root2');
      expect(ids).toContain('child1');
      expect(ids).toContain('child2');
      expect(ids).toContain('grandchild');
    });

    it('collectAllIds handles empty content', () => {
      const data = makeData([]);

      const ids = collectAllIds(data);

      expect(ids).toHaveLength(0);
    });

    it('collectAllIdsDeep handles deeply nested structures', () => {
      const data = makeData(
        [makeComponent('level0')],
        {
          'level0-slot': [makeComponent('level1')],
          'level1-slot': [makeComponent('level2')],
          'level2-slot': [makeComponent('level3')],
        }
      );

      const ids = collectAllIdsDeep(data);

      expect(ids).toHaveLength(4);
      expect(ids).toContain('level0');
      expect(ids).toContain('level1');
      expect(ids).toContain('level2');
      expect(ids).toContain('level3');
    });
  });

  describe('isDescendantOf', () => {
    it('returns true for direct child', () => {
      const data = makeData(
        [makeComponent('parent'), makeComponent('other')],
        {
          'parent-slot': [makeComponent('child')],
        }
      );

      const result = isDescendantOf(data, 'child', 'parent');

      expect(result).toBe(true);
    });

    it('returns true for deep nested child', () => {
      const data = makeData(
        [makeComponent('grandparent')],
        {
          'grandparent-slot': [makeComponent('parent')],
          'parent-slot': [makeComponent('child')],
          'child-slot': [makeComponent('grandchild')],
        }
      );

      expect(isDescendantOf(data, 'parent', 'grandparent')).toBe(true);
      expect(isDescendantOf(data, 'child', 'grandparent')).toBe(true);
      expect(isDescendantOf(data, 'grandchild', 'grandparent')).toBe(true);
      expect(isDescendantOf(data, 'grandchild', 'parent')).toBe(true);
    });

    it('returns false for unrelated components', () => {
      const data = makeData(
        [makeComponent('a'), makeComponent('b')],
        {
          'a-slot': [makeComponent('a-child')],
          'b-slot': [makeComponent('b-child')],
        }
      );

      expect(isDescendantOf(data, 'a-child', 'b')).toBe(false);
      expect(isDescendantOf(data, 'b-child', 'a')).toBe(false);
      expect(isDescendantOf(data, 'a', 'b')).toBe(false);
    });

    it('returns false for parent-of relationship (reversed)', () => {
      const data = makeData(
        [makeComponent('parent')],
        {
          'parent-slot': [makeComponent('child')],
        }
      );

      // Asking if parent is descendant of child (reversed)
      const result = isDescendantOf(data, 'parent', 'child');

      expect(result).toBe(false);
    });

    it('returns false when component does not exist', () => {
      const data = makeData([makeComponent('a')]);

      expect(isDescendantOf(data, 'nonexistent', 'a')).toBe(false);
      expect(isDescendantOf(data, 'a', 'nonexistent')).toBe(false);
    });

    it('returns false for self-reference', () => {
      const data = makeData([makeComponent('a')]);

      expect(isDescendantOf(data, 'a', 'a')).toBe(false);
    });
  });

  describe('integration tests', () => {
    it('complex workflow: duplicate parent with children, then remove original', () => {
      const data = makeData(
        [makeComponent('parent'), makeComponent('sibling')],
        {
          'parent-slot': [makeComponent('child1'), makeComponent('child2')],
        }
      );

      // Duplicate parent
      const { newData: afterDuplicate, newIds } = duplicateComponents(
        data,
        new Set(['parent'])
      );

      expect(afterDuplicate.content).toHaveLength(3); // parent, duplicate, sibling
      expect(newIds).toHaveLength(1);

      // Remove original parent
      const afterRemove = removeComponents(afterDuplicate, new Set(['parent']));

      expect(afterRemove.content).toHaveLength(2); // duplicate, sibling
      expect(afterRemove.content.map((c) => c.props.id)).toContain(newIds[0]);
      expect(afterRemove.content.map((c) => c.props.id)).toContain('sibling');

      // Original parent's zone should be gone
      expect(afterRemove.zones?.['parent-slot']).toBeUndefined();

      // Duplicate's zone should still exist
      expect(afterRemove.zones?.[`${newIds[0]}-slot`]).toHaveLength(2);
    });

    it('complex workflow: extract, regenerate, and paste', () => {
      const sourceData = makeData(
        [makeComponent('component-a'), makeComponent('component-b')],
        {
          'component-a-slot': [makeComponent('child')],
        }
      );

      // Extract component-a
      const serialized = extractComponents(sourceData, new Set(['component-a']));

      expect(serialized).toHaveLength(1);
      expect(serialized[0].originalId).toBe('component-a');

      // Paste into target document
      const targetData = makeData([makeComponent('existing')]);
      const { newData, newIds } = pasteComponents(targetData, serialized);

      expect(newData.content).toHaveLength(2);
      expect(newIds[0]).not.toBe('component-a'); // ID regenerated
      expect(newData.zones?.[`${newIds[0]}-slot`]).toHaveLength(1);

      // Child should also have new ID
      const childId = newData.zones?.[`${newIds[0]}-slot`]?.[0].props.id as string;
      expect(childId).not.toBe('child');
    });
  });
});
