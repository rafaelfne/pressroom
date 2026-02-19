import { describe, it, expect } from 'vitest';
import {
  multiSelectReducer,
  type MultiSelectState,
} from '@/contexts/multi-select-context';
import type { PressroomClipboard } from '@/lib/studio/multi-select-operations';

function createInitialState(overrides?: Partial<MultiSelectState>): MultiSelectState {
  return {
    selectedIds: new Set<string>(),
    clipboard: null,
    marquee: null,
    mode: 'idle',
    ...overrides,
  };
}

describe('multiSelectReducer', () => {
  describe('Selection actions', () => {
    it('SELECT_ONE: clears previous selection, selects only the given id, mode = idle', () => {
      const initialState = createInitialState({
        selectedIds: new Set(['id1', 'id2', 'id3']),
        mode: 'marquee',
      });

      const newState = multiSelectReducer(initialState, {
        type: 'SELECT_ONE',
        id: 'new-id',
      });

      expect(newState.selectedIds).toEqual(new Set(['new-id']));
      expect(newState.selectedIds.size).toBe(1);
      expect(newState.mode).toBe('idle');
    });

    it('TOGGLE_SELECTION: adds unselected id to selection', () => {
      const initialState = createInitialState({
        selectedIds: new Set(['id1', 'id2']),
      });

      const newState = multiSelectReducer(initialState, {
        type: 'TOGGLE_SELECTION',
        id: 'id3',
      });

      expect(newState.selectedIds).toEqual(new Set(['id1', 'id2', 'id3']));
      expect(newState.selectedIds.has('id3')).toBe(true);
    });

    it('TOGGLE_SELECTION: removes already selected id from selection', () => {
      const initialState = createInitialState({
        selectedIds: new Set(['id1', 'id2', 'id3']),
      });

      const newState = multiSelectReducer(initialState, {
        type: 'TOGGLE_SELECTION',
        id: 'id2',
      });

      expect(newState.selectedIds).toEqual(new Set(['id1', 'id3']));
      expect(newState.selectedIds.has('id2')).toBe(false);
    });

    it('SELECT_MULTIPLE: replaces selection with given ids', () => {
      const initialState = createInitialState({
        selectedIds: new Set(['old1', 'old2']),
      });

      const newState = multiSelectReducer(initialState, {
        type: 'SELECT_MULTIPLE',
        ids: ['new1', 'new2', 'new3'],
      });

      expect(newState.selectedIds).toEqual(new Set(['new1', 'new2', 'new3']));
      expect(newState.selectedIds.size).toBe(3);
    });

    it('SELECT_ALL: replaces selection with all given ids', () => {
      const initialState = createInitialState({
        selectedIds: new Set(['id1']),
      });

      const newState = multiSelectReducer(initialState, {
        type: 'SELECT_ALL',
        allIds: ['id1', 'id2', 'id3', 'id4', 'id5'],
      });

      expect(newState.selectedIds).toEqual(new Set(['id1', 'id2', 'id3', 'id4', 'id5']));
      expect(newState.selectedIds.size).toBe(5);
    });

    it('CLEAR_SELECTION: empties selection, mode = idle', () => {
      const initialState = createInitialState({
        selectedIds: new Set(['id1', 'id2', 'id3']),
        mode: 'dragging',
      });

      const newState = multiSelectReducer(initialState, {
        type: 'CLEAR_SELECTION',
      });

      expect(newState.selectedIds).toEqual(new Set());
      expect(newState.selectedIds.size).toBe(0);
      expect(newState.mode).toBe('idle');
    });
  });

  describe('Clipboard actions', () => {
    it('SET_CLIPBOARD: stores clipboard, does not affect selection', () => {
      const initialState = createInitialState({
        selectedIds: new Set(['id1', 'id2']),
      });

      const mockClipboard: PressroomClipboard = {
        version: 1,
        source: {
          templateId: 'template-1',
          pageId: 'page-1',
          pageName: 'Page 1',
        },
        components: [
          {
            type: 'TextBlock',
            props: { id: 'comp-1', text: 'Hello' },
            slots: {},
            originalId: 'comp-1',
          },
        ],
        copiedAt: '2024-01-01T00:00:00.000Z',
      };

      const newState = multiSelectReducer(initialState, {
        type: 'SET_CLIPBOARD',
        clipboard: mockClipboard,
      });

      expect(newState.clipboard).toEqual(mockClipboard);
      expect(newState.selectedIds).toEqual(new Set(['id1', 'id2']));
    });

    it('CLEAR_CLIPBOARD: clears clipboard', () => {
      const mockClipboard: PressroomClipboard = {
        version: 1,
        source: {
          templateId: 'template-1',
          pageId: 'page-1',
          pageName: 'Page 1',
        },
        components: [
          {
            type: 'TextBlock',
            props: { id: 'comp-1', text: 'Hello' },
            slots: {},
            originalId: 'comp-1',
          },
        ],
        copiedAt: '2024-01-01T00:00:00.000Z',
      };

      const initialState = createInitialState({
        clipboard: mockClipboard,
      });

      const newState = multiSelectReducer(initialState, {
        type: 'CLEAR_CLIPBOARD',
      });

      expect(newState.clipboard).toBeNull();
    });
  });

  describe('Marquee actions', () => {
    it('START_MARQUEE (not additive): clears selection, sets marquee state, mode = marquee', () => {
      const initialState = createInitialState({
        selectedIds: new Set(['id1', 'id2']),
        mode: 'idle',
      });

      const newState = multiSelectReducer(initialState, {
        type: 'START_MARQUEE',
        x: 100,
        y: 200,
        additive: false,
      });

      expect(newState.selectedIds).toEqual(new Set());
      expect(newState.marquee).toEqual({
        startX: 100,
        startY: 200,
        currentX: 100,
        currentY: 200,
        additive: false,
      });
      expect(newState.mode).toBe('marquee');
    });

    it('START_MARQUEE (additive): preserves existing selection, sets marquee state', () => {
      const initialState = createInitialState({
        selectedIds: new Set(['id1', 'id2']),
        mode: 'idle',
      });

      const newState = multiSelectReducer(initialState, {
        type: 'START_MARQUEE',
        x: 150,
        y: 250,
        additive: true,
      });

      expect(newState.selectedIds).toEqual(new Set(['id1', 'id2']));
      expect(newState.marquee).toEqual({
        startX: 150,
        startY: 250,
        currentX: 150,
        currentY: 250,
        additive: true,
      });
      expect(newState.mode).toBe('marquee');
    });

    it('UPDATE_MARQUEE: updates currentX/currentY', () => {
      const initialState = createInitialState({
        marquee: {
          startX: 100,
          startY: 200,
          currentX: 100,
          currentY: 200,
          additive: false,
        },
        mode: 'marquee',
      });

      const newState = multiSelectReducer(initialState, {
        type: 'UPDATE_MARQUEE',
        x: 300,
        y: 400,
      });

      expect(newState.marquee).toEqual({
        startX: 100,
        startY: 200,
        currentX: 300,
        currentY: 400,
        additive: false,
      });
    });

    it('UPDATE_MARQUEE: returns unchanged state when no marquee active', () => {
      const initialState = createInitialState({
        marquee: null,
      });

      const newState = multiSelectReducer(initialState, {
        type: 'UPDATE_MARQUEE',
        x: 300,
        y: 400,
      });

      expect(newState).toBe(initialState);
      expect(newState.marquee).toBeNull();
    });

    it('END_MARQUEE (not additive): replaces selection with intersected ids', () => {
      const initialState = createInitialState({
        selectedIds: new Set(['old1', 'old2']),
        marquee: {
          startX: 100,
          startY: 200,
          currentX: 300,
          currentY: 400,
          additive: false,
        },
        mode: 'marquee',
      });

      const newState = multiSelectReducer(initialState, {
        type: 'END_MARQUEE',
        intersectedIds: ['new1', 'new2', 'new3'],
      });

      expect(newState.selectedIds).toEqual(new Set(['new1', 'new2', 'new3']));
      expect(newState.marquee).toBeNull();
      expect(newState.mode).toBe('idle');
    });

    it('END_MARQUEE (additive): merges with existing selection', () => {
      const initialState = createInitialState({
        selectedIds: new Set(['id1', 'id2']),
        marquee: {
          startX: 100,
          startY: 200,
          currentX: 300,
          currentY: 400,
          additive: true,
        },
        mode: 'marquee',
      });

      const newState = multiSelectReducer(initialState, {
        type: 'END_MARQUEE',
        intersectedIds: ['id2', 'id3', 'id4'],
      });

      expect(newState.selectedIds).toEqual(new Set(['id1', 'id2', 'id3', 'id4']));
      expect(newState.marquee).toBeNull();
      expect(newState.mode).toBe('idle');
    });

    it('END_MARQUEE: returns unchanged state when no marquee active', () => {
      const initialState = createInitialState({
        selectedIds: new Set(['id1']),
        marquee: null,
      });

      const newState = multiSelectReducer(initialState, {
        type: 'END_MARQUEE',
        intersectedIds: ['id2', 'id3'],
      });

      expect(newState).toBe(initialState);
      expect(newState.selectedIds).toEqual(new Set(['id1']));
      expect(newState.marquee).toBeNull();
    });

    it('CANCEL_MARQUEE: clears marquee, mode = idle', () => {
      const initialState = createInitialState({
        marquee: {
          startX: 100,
          startY: 200,
          currentX: 300,
          currentY: 400,
          additive: false,
        },
        mode: 'marquee',
      });

      const newState = multiSelectReducer(initialState, {
        type: 'CANCEL_MARQUEE',
      });

      expect(newState.marquee).toBeNull();
      expect(newState.mode).toBe('idle');
    });
  });
});
