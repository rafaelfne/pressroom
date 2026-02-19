import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MultiSelectProvider, useMultiSelect } from '@/lib/puck/multi-select-context';
import type { ComponentData, Data } from '@puckeditor/core';
import type React from 'react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeItem(type: string, id: string): ComponentData {
  return { type, props: { id } };
}

function makeData(content: ComponentData[]): Data {
  return { content, root: {} };
}

function renderMultiSelect() {
  return renderHook(() => useMultiSelect(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <MultiSelectProvider>{children}</MultiSelectProvider>
    ),
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('MultiSelectProvider + useMultiSelect', () => {
  describe('initial state', () => {
    it('starts with empty selection', () => {
      const { result } = renderMultiSelect();
      expect(result.current.selectedIds.size).toBe(0);
      expect(result.current.isMultiSelectActive).toBe(false);
      expect(result.current.hasClipboard).toBe(false);
    });
  });

  describe('toggleSelect', () => {
    it('adds an item to selection', () => {
      const { result } = renderMultiSelect();

      act(() => result.current.toggleSelect('a'));
      expect(result.current.selectedIds.has('a')).toBe(true);
      expect(result.current.selectedIds.size).toBe(1);
    });

    it('removes an already-selected item', () => {
      const { result } = renderMultiSelect();

      act(() => result.current.toggleSelect('a'));
      act(() => result.current.toggleSelect('a'));
      expect(result.current.selectedIds.has('a')).toBe(false);
      expect(result.current.selectedIds.size).toBe(0);
    });

    it('enables isMultiSelectActive when 2+ items selected', () => {
      const { result } = renderMultiSelect();

      act(() => result.current.toggleSelect('a'));
      expect(result.current.isMultiSelectActive).toBe(false);

      act(() => result.current.toggleSelect('b'));
      expect(result.current.isMultiSelectActive).toBe(true);
    });
  });

  describe('selectRange', () => {
    const content = [
      makeItem('TextBlock', 'a'),
      makeItem('HeadingBlock', 'b'),
      makeItem('Spacer', 'c'),
      makeItem('Divider', 'd'),
    ];

    it('selects a range from the last selected to the target', () => {
      const { result } = renderMultiSelect();

      // First toggle to set the anchor
      act(() => result.current.toggleSelect('a'));

      // Then shift-click on 'c'
      act(() => result.current.selectRange('c', content));

      expect(result.current.selectedIds.has('a')).toBe(true);
      expect(result.current.selectedIds.has('b')).toBe(true);
      expect(result.current.selectedIds.has('c')).toBe(true);
      expect(result.current.selectedIds.has('d')).toBe(false);
    });

    it('handles range when no anchor exists', () => {
      const { result } = renderMultiSelect();

      act(() => result.current.selectRange('c', content));
      // Should just select the target
      expect(result.current.selectedIds.size).toBe(1);
      expect(result.current.selectedIds.has('c')).toBe(true);
    });
  });

  describe('clearSelection', () => {
    it('clears all selected items', () => {
      const { result } = renderMultiSelect();

      act(() => result.current.toggleSelect('a'));
      act(() => result.current.toggleSelect('b'));
      expect(result.current.selectedIds.size).toBe(2);

      act(() => result.current.clearSelection());
      expect(result.current.selectedIds.size).toBe(0);
    });
  });

  describe('isSelected', () => {
    it('returns true for selected items', () => {
      const { result } = renderMultiSelect();

      act(() => result.current.toggleSelect('a'));
      expect(result.current.isSelected('a')).toBe(true);
      expect(result.current.isSelected('b')).toBe(false);
    });
  });

  describe('selectAll', () => {
    it('selects all items in content', () => {
      const { result } = renderMultiSelect();
      const content = [makeItem('TextBlock', 'a'), makeItem('HeadingBlock', 'b')];

      act(() => result.current.selectAll(content));
      expect(result.current.selectedIds.size).toBe(2);
      expect(result.current.selectedIds.has('a')).toBe(true);
      expect(result.current.selectedIds.has('b')).toBe(true);
    });
  });

  describe('copy', () => {
    it('sets hasClipboard to true after copying', () => {
      const { result } = renderMultiSelect();
      const data = makeData([makeItem('TextBlock', 'a')]);

      act(() => result.current.toggleSelect('a'));
      act(() => result.current.copy(data));

      expect(result.current.hasClipboard).toBe(true);
    });

    it('does nothing when no items are selected', () => {
      const { result } = renderMultiSelect();
      const data = makeData([makeItem('TextBlock', 'a')]);

      act(() => result.current.copy(data));
      expect(result.current.hasClipboard).toBe(false);
    });
  });

  describe('cut', () => {
    it('moves items to clipboard and clears selection', () => {
      const dispatch = vi.fn();
      const { result } = renderMultiSelect();
      const data = makeData([makeItem('TextBlock', 'a'), makeItem('HeadingBlock', 'b')]);

      act(() => result.current.toggleSelect('a'));
      act(() => result.current.cut(dispatch, data));

      expect(result.current.hasClipboard).toBe(true);
      expect(result.current.selectedIds.size).toBe(0);
      expect(dispatch).toHaveBeenCalledOnce();
    });
  });

  describe('paste', () => {
    it('dispatches setData after copy+paste', () => {
      const dispatch = vi.fn();
      const { result } = renderMultiSelect();
      const data = makeData([makeItem('TextBlock', 'a')]);

      // Copy first
      act(() => result.current.toggleSelect('a'));
      act(() => result.current.copy(data));

      // Then paste
      act(() => result.current.paste(dispatch, data));

      expect(dispatch).toHaveBeenCalledOnce();
      const call = dispatch.mock.calls[0][0];
      expect(call.type).toBe('setData');
      // Should have 2 items now (original + pasted)
      expect(call.data.content).toHaveLength(2);
    });

    it('does nothing when clipboard is empty', () => {
      const dispatch = vi.fn();
      const { result } = renderMultiSelect();
      const data = makeData([makeItem('TextBlock', 'a')]);

      act(() => result.current.paste(dispatch, data));
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('deleteSelected', () => {
    it('removes selected items and clears selection', () => {
      const dispatch = vi.fn();
      const { result } = renderMultiSelect();
      const data = makeData([
        makeItem('TextBlock', 'a'),
        makeItem('HeadingBlock', 'b'),
      ]);

      act(() => result.current.toggleSelect('a'));
      act(() => result.current.deleteSelected(dispatch, data));

      expect(dispatch).toHaveBeenCalledOnce();
      expect(result.current.selectedIds.size).toBe(0);

      const call = dispatch.mock.calls[0][0];
      expect(call.data.content).toHaveLength(1);
      expect(call.data.content[0].props.id).toBe('b');
    });

    it('does nothing when nothing is selected', () => {
      const dispatch = vi.fn();
      const { result } = renderMultiSelect();
      const data = makeData([makeItem('TextBlock', 'a')]);

      act(() => result.current.deleteSelected(dispatch, data));
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('useMultiSelect outside provider', () => {
    it('throws when used outside MultiSelectProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useMultiSelect());
      }).toThrow('useMultiSelect must be used within a MultiSelectProvider');

      consoleSpy.mockRestore();
    });
  });
});
