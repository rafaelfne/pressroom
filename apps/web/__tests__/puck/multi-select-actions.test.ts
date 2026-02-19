import { describe, it, expect, vi } from 'vitest';
import {
  batchRemove,
  batchPaste,
  copySelected,
  cutSelected,
  getPasteInsertIndex,
  selectAllIds,
} from '@/lib/puck/multi-select-actions';
import type { ComponentData, Data } from '@puckeditor/core';
import type { ClipboardPayload } from '@/lib/puck/clipboard';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeItem(type: string, id: string): ComponentData {
  return { type, props: { id } };
}

function makeData(
  content: ComponentData[],
  zones?: Record<string, ComponentData[]>,
): Data {
  return { content, root: {}, zones };
}

function createDispatchSpy() {
  return vi.fn();
}

// ─── batchRemove ─────────────────────────────────────────────────────────────

describe('batchRemove', () => {
  it('removes selected items from content', () => {
    const dispatch = createDispatchSpy();
    const data = makeData([
      makeItem('TextBlock', 'a'),
      makeItem('HeadingBlock', 'b'),
      makeItem('Spacer', 'c'),
    ]);

    batchRemove(dispatch, data, new Set(['a', 'c']));

    expect(dispatch).toHaveBeenCalledOnce();
    const call = dispatch.mock.calls[0][0];
    expect(call.type).toBe('setData');
    expect(call.data.content).toHaveLength(1);
    expect(call.data.content[0].props.id).toBe('b');
    expect(call.recordHistory).toBe(true);
  });

  it('removes zones owned by selected items', () => {
    const dispatch = createDispatchSpy();
    const data = makeData(
      [makeItem('Container', 'c-1'), makeItem('TextBlock', 'a')],
      {
        'c-1:content': [makeItem('TextBlock', 'inner')],
        'a:zone': [makeItem('Spacer', 'sp')],
      },
    );

    batchRemove(dispatch, data, new Set(['c-1']));

    const call = dispatch.mock.calls[0][0];
    expect(call.data.content).toHaveLength(1);
    expect(call.data.content[0].props.id).toBe('a');
    // c-1's zone should be removed
    expect(call.data.zones).not.toHaveProperty('c-1:content');
    // a's zone should remain
    expect(call.data.zones).toHaveProperty('a:zone');
  });

  it('does not dispatch when selection is empty', () => {
    const dispatch = createDispatchSpy();
    const data = makeData([makeItem('TextBlock', 'a')]);

    batchRemove(dispatch, data, new Set());
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('handles data with no zones', () => {
    const dispatch = createDispatchSpy();
    const data = makeData([makeItem('TextBlock', 'a')]);

    batchRemove(dispatch, data, new Set(['a']));

    const call = dispatch.mock.calls[0][0];
    expect(call.data.content).toHaveLength(0);
  });
});

// ─── batchPaste ──────────────────────────────────────────────────────────────

describe('batchPaste', () => {
  it('inserts cloned items at the correct position', () => {
    const dispatch = createDispatchSpy();
    const data = makeData([
      makeItem('TextBlock', 'a'),
      makeItem('HeadingBlock', 'b'),
    ]);
    const clipboard: ClipboardPayload = {
      items: [makeItem('Spacer', 'sp-1')],
      zones: {},
    };

    batchPaste(dispatch, data, clipboard, 0); // insert after index 0

    const call = dispatch.mock.calls[0][0];
    expect(call.type).toBe('setData');
    expect(call.data.content).toHaveLength(3);
    // Original first item
    expect(call.data.content[0].props.id).toBe('a');
    // Pasted item should be at index 1 (after index 0) — with new ID
    expect(call.data.content[1].props.id).not.toBe('sp-1');
    expect(call.data.content[1].type).toBe('Spacer');
    // Original second item
    expect(call.data.content[2].props.id).toBe('b');
  });

  it('generates new IDs for pasted items (deep clone)', () => {
    const dispatch = createDispatchSpy();
    const data = makeData([]);
    const clipboard: ClipboardPayload = {
      items: [makeItem('TextBlock', 'original-id')],
      zones: {},
    };

    batchPaste(dispatch, data, clipboard, -1);

    const call = dispatch.mock.calls[0][0];
    expect(call.data.content[0].props.id).not.toBe('original-id');
  });

  it('merges cloned zones into data', () => {
    const dispatch = createDispatchSpy();
    const data = makeData([], { 'existing:zone': [makeItem('Divider', 'd')] });
    const clipboard: ClipboardPayload = {
      items: [makeItem('Container', 'c-1')],
      zones: { 'c-1:content': [makeItem('TextBlock', 'inner')] },
    };

    batchPaste(dispatch, data, clipboard, -1);

    const call = dispatch.mock.calls[0][0];
    // Should have the existing zone + the new cloned zone
    expect(Object.keys(call.data.zones).length).toBeGreaterThanOrEqual(2);
    // Existing zone should be preserved
    expect(call.data.zones).toHaveProperty('existing:zone');
  });

  it('does not dispatch when clipboard has no items', () => {
    const dispatch = createDispatchSpy();
    const data = makeData([makeItem('TextBlock', 'a')]);
    const clipboard: ClipboardPayload = { items: [], zones: {} };

    batchPaste(dispatch, data, clipboard, 0);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('appends at end when insertAfterIndex exceeds content length', () => {
    const dispatch = createDispatchSpy();
    const data = makeData([makeItem('TextBlock', 'a')]);
    const clipboard: ClipboardPayload = {
      items: [makeItem('Spacer', 'sp')],
      zones: {},
    };

    batchPaste(dispatch, data, clipboard, 999);

    const call = dispatch.mock.calls[0][0];
    expect(call.data.content).toHaveLength(2);
    // Original should still be first
    expect(call.data.content[0].props.id).toBe('a');
  });
});

// ─── copySelected ────────────────────────────────────────────────────────────

describe('copySelected', () => {
  it('returns clipboard payload with selected items', () => {
    const data = makeData([
      makeItem('TextBlock', 'a'),
      makeItem('HeadingBlock', 'b'),
    ]);

    const result = copySelected(data, new Set(['a']));
    expect(result.items).toHaveLength(1);
    expect(result.items[0].props.id).toBe('a');
  });
});

// ─── cutSelected ─────────────────────────────────────────────────────────────

describe('cutSelected', () => {
  it('returns clipboard and removes items from data', () => {
    const dispatch = createDispatchSpy();
    const data = makeData([
      makeItem('TextBlock', 'a'),
      makeItem('HeadingBlock', 'b'),
    ]);

    const result = cutSelected(dispatch, data, new Set(['a']));

    // Returns clipboard
    expect(result.items).toHaveLength(1);
    expect(result.items[0].props.id).toBe('a');

    // Dispatch should have been called to remove
    expect(dispatch).toHaveBeenCalledOnce();
    const call = dispatch.mock.calls[0][0];
    expect(call.data.content).toHaveLength(1);
    expect(call.data.content[0].props.id).toBe('b');
  });
});

// ─── getPasteInsertIndex ─────────────────────────────────────────────────────

describe('getPasteInsertIndex', () => {
  const content = [
    makeItem('TextBlock', 'a'),
    makeItem('HeadingBlock', 'b'),
    makeItem('Spacer', 'c'),
  ];

  it('returns last selected index when items are selected', () => {
    const result = getPasteInsertIndex(content, new Set(['a', 'c']));
    expect(result).toBe(2); // index of 'c'
  });

  it('returns end of content when nothing is selected', () => {
    const result = getPasteInsertIndex(content, new Set());
    expect(result).toBe(2); // content.length - 1
  });

  it('returns correct index for single selection', () => {
    const result = getPasteInsertIndex(content, new Set(['b']));
    expect(result).toBe(1);
  });
});

// ─── selectAllIds ────────────────────────────────────────────────────────────

describe('selectAllIds', () => {
  it('returns all component IDs as a Set', () => {
    const content = [
      makeItem('TextBlock', 'a'),
      makeItem('HeadingBlock', 'b'),
      makeItem('Spacer', 'c'),
    ];

    const result = selectAllIds(content);
    expect(result).toEqual(new Set(['a', 'b', 'c']));
  });

  it('returns empty set for empty content', () => {
    const result = selectAllIds([]);
    expect(result).toEqual(new Set());
  });
});
