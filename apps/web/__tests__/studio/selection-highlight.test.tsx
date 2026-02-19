import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { SelectionHighlight } from '@/components/studio/selection-highlight';
import {
  MultiSelectProvider,
  MultiSelectContext,
  multiSelectReducer,
  type MultiSelectState,
} from '@/contexts/multi-select-context';
import React, { useContext, useEffect, useRef } from 'react';

afterEach(() => {
  cleanup();
});

/**
 * Helper component that dispatches actions to set up the desired selection state.
 * Uses a ref to ensure dispatch is only called once to prevent infinite re-render loops.
 */
function SetupSelection({ ids }: { ids: string[] }) {
  const context = useContext(MultiSelectContext);
  const dispatched = useRef(false);

  useEffect(() => {
    if (context && ids.length > 0 && !dispatched.current) {
      dispatched.current = true;
      context.dispatch({ type: 'SELECT_ALL', allIds: ids });
    }
  });

  return null;
}

describe('SelectionHighlight', () => {
  it('returns null when no items are selected (isMultiSelected = false)', () => {
    const { container } = render(
      <MultiSelectProvider>
        <SelectionHighlight />
      </MultiSelectProvider>,
    );

    const styleElements = container.querySelectorAll('style');
    expect(styleElements.length).toBe(0);
  });

  it('returns null when only one item is selected (isMultiSelected = false)', () => {
    const { container } = render(
      <MultiSelectProvider>
        <SetupSelection ids={['single-id']} />
        <SelectionHighlight />
      </MultiSelectProvider>,
    );

    const styleElements = container.querySelectorAll('style');
    expect(styleElements.length).toBe(0);
  });

  it('renders style element when 2+ items are selected', () => {
    const { container } = render(
      <MultiSelectProvider>
        <SetupSelection ids={['id1', 'id2']} />
        <SelectionHighlight />
      </MultiSelectProvider>,
    );

    const styleElements = container.querySelectorAll('style');
    expect(styleElements.length).toBe(1);

    const styleContent = styleElements[0].textContent || '';
    expect(styleContent).toContain('[data-puck-component="id1"]');
    expect(styleContent).toContain('[data-puck-component="id2"]');
    expect(styleContent).toContain('outline');
  });

  it('includes all selected IDs in the style selector', () => {
    const { container } = render(
      <MultiSelectProvider>
        <SetupSelection ids={['a', 'b', 'c']} />
        <SelectionHighlight />
      </MultiSelectProvider>,
    );

    const styleContent = container.querySelector('style')?.textContent || '';
    expect(styleContent).toContain('[data-puck-component="a"]');
    expect(styleContent).toContain('[data-puck-component="b"]');
    expect(styleContent).toContain('[data-puck-component="c"]');
  });
});

describe('multiSelectReducer - selection highlight integration', () => {
  function createInitialState(overrides?: Partial<MultiSelectState>): MultiSelectState {
    return {
      selectedIds: new Set<string>(),
      clipboard: null,
      marquee: null,
      mode: 'idle',
      ...overrides,
    };
  }

  it('SELECT_ALL with multiple IDs sets isMultiSelected condition', () => {
    const state = createInitialState();
    const newState = multiSelectReducer(state, {
      type: 'SELECT_ALL',
      allIds: ['id1', 'id2', 'id3'],
    });

    expect(newState.selectedIds.size).toBe(3);
    expect(newState.selectedIds.size > 1).toBe(true);
  });

  it('TOGGLE_SELECTION from multi to single clears multi highlight condition', () => {
    const state = createInitialState({
      selectedIds: new Set(['id1', 'id2']),
    });

    const newState = multiSelectReducer(state, {
      type: 'TOGGLE_SELECTION',
      id: 'id1',
    });

    expect(newState.selectedIds.size).toBe(1);
    expect(newState.selectedIds.size > 1).toBe(false);
  });

  it('CLEAR_SELECTION removes all, disabling highlight', () => {
    const state = createInitialState({
      selectedIds: new Set(['id1', 'id2', 'id3']),
    });

    const newState = multiSelectReducer(state, { type: 'CLEAR_SELECTION' });

    expect(newState.selectedIds.size).toBe(0);
  });
});
