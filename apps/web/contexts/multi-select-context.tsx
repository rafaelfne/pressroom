'use client';

import React, { createContext, useReducer, useCallback, useMemo } from 'react';
import type { PressroomClipboard } from '@/lib/studio/multi-select-operations';

/**
 * Marquee selection state - tracks the drag rectangle coordinates
 * and whether this is an additive selection (Shift key held)
 */
export interface MarqueeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  additive: boolean;
}

/**
 * Multi-selection state shape
 * - selectedIds: Set of currently selected component IDs
 * - clipboard: Copied/cut components ready for paste
 * - marquee: Active marquee selection state (null when not marquee-selecting)
 * - mode: Current interaction mode
 */
export interface MultiSelectState {
  selectedIds: Set<string>;
  clipboard: PressroomClipboard | null;
  marquee: MarqueeState | null;
  mode: 'idle' | 'marquee' | 'dragging';
}

/**
 * Multi-selection actions
 * Follows FSA (Flux Standard Action) pattern with type + payload
 */
export type MultiSelectAction =
  | { type: 'SELECT_ONE'; id: string }
  | { type: 'TOGGLE_SELECTION'; id: string }
  | { type: 'SELECT_MULTIPLE'; ids: string[] }
  | { type: 'SELECT_ALL'; allIds: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_CLIPBOARD'; clipboard: PressroomClipboard }
  | { type: 'CLEAR_CLIPBOARD' }
  | { type: 'START_MARQUEE'; x: number; y: number; additive: boolean }
  | { type: 'UPDATE_MARQUEE'; x: number; y: number }
  | { type: 'END_MARQUEE'; intersectedIds: string[] }
  | { type: 'CANCEL_MARQUEE' };

/**
 * Reducer function for multi-selection state management
 * Handles all selection operations, clipboard, and marquee interactions
 */
export function multiSelectReducer(
  state: MultiSelectState,
  action: MultiSelectAction
): MultiSelectState {
  switch (action.type) {
    case 'SELECT_ONE': {
      // Clear all selections and select only this component
      const newSet = new Set<string>();
      newSet.add(action.id);
      return {
        ...state,
        selectedIds: newSet,
        mode: 'idle',
      };
    }

    case 'TOGGLE_SELECTION': {
      // Toggle selection state of a single component
      const newSet = new Set(state.selectedIds);
      if (newSet.has(action.id)) {
        newSet.delete(action.id);
      } else {
        newSet.add(action.id);
      }
      return {
        ...state,
        selectedIds: newSet,
        mode: 'idle',
      };
    }

    case 'SELECT_MULTIPLE': {
      // Replace selection with provided IDs
      return {
        ...state,
        selectedIds: new Set(action.ids),
        mode: 'idle',
      };
    }

    case 'SELECT_ALL': {
      // Select all components in the current context
      return {
        ...state,
        selectedIds: new Set(action.allIds),
        mode: 'idle',
      };
    }

    case 'CLEAR_SELECTION': {
      // Deselect everything
      return {
        ...state,
        selectedIds: new Set(),
        mode: 'idle',
      };
    }

    case 'SET_CLIPBOARD': {
      // Store clipboard data (doesn't affect selection)
      return {
        ...state,
        clipboard: action.clipboard,
      };
    }

    case 'CLEAR_CLIPBOARD': {
      // Clear clipboard
      return {
        ...state,
        clipboard: null,
      };
    }

    case 'START_MARQUEE': {
      // Begin marquee selection
      // If not additive (Shift not held), clear existing selection
      return {
        ...state,
        selectedIds: action.additive ? state.selectedIds : new Set(),
        marquee: {
          startX: action.x,
          startY: action.y,
          currentX: action.x,
          currentY: action.y,
          additive: action.additive,
        },
        mode: 'marquee',
      };
    }

    case 'UPDATE_MARQUEE': {
      // Update marquee rectangle as mouse moves
      if (!state.marquee) {
        return state;
      }
      return {
        ...state,
        marquee: {
          ...state.marquee,
          currentX: action.x,
          currentY: action.y,
        },
      };
    }

    case 'END_MARQUEE': {
      // Complete marquee selection with intersected component IDs
      if (!state.marquee) {
        return state;
      }

      const newSet = state.marquee.additive
        ? new Set([...state.selectedIds, ...action.intersectedIds])
        : new Set(action.intersectedIds);

      return {
        ...state,
        selectedIds: newSet,
        marquee: null,
        mode: 'idle',
      };
    }

    case 'CANCEL_MARQUEE': {
      // Cancel marquee selection without changing selection
      return {
        ...state,
        marquee: null,
        mode: 'idle',
      };
    }

    default: {
      // Exhaustive check - TypeScript will error if we miss a case
      const _exhaustive: never = action;
      return state;
    }
  }
}

/**
 * Context value exposed to consumers
 * Includes state, dispatch, and convenience methods/getters
 */
export interface MultiSelectContextValue {
  state: MultiSelectState;
  dispatch: React.Dispatch<MultiSelectAction>;
  selectedCount: number;
  hasSelection: boolean;
  isMultiSelected: boolean;
  isSelected: (id: string) => boolean;
}

/**
 * Multi-selection context
 * Provides state and actions for component multi-selection in Puck editor
 */
export const MultiSelectContext = createContext<MultiSelectContextValue | null>(null);

/**
 * Initial state for the multi-selection system
 */
const initialState: MultiSelectState = {
  selectedIds: new Set(),
  clipboard: null,
  marquee: null,
  mode: 'idle',
};

/**
 * MultiSelectProvider
 * Wraps the Puck editor to provide multi-selection state management
 * parallel to Puck's internal state
 */
export function MultiSelectProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(multiSelectReducer, initialState);

  // Memoized convenience values
  const selectedCount = state.selectedIds.size;
  const hasSelection = selectedCount > 0;
  const isMultiSelected = selectedCount > 1;

  // Memoized selection checker callback
  const isSelected = useCallback(
    (id: string): boolean => {
      return state.selectedIds.has(id);
    },
    [state.selectedIds]
  );

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<MultiSelectContextValue>(
    () => ({
      state,
      dispatch,
      selectedCount,
      hasSelection,
      isMultiSelected,
      isSelected,
    }),
    [state, dispatch, selectedCount, hasSelection, isMultiSelected, isSelected]
  );

  return (
    <MultiSelectContext.Provider value={contextValue}>
      {children}
    </MultiSelectContext.Provider>
  );
}
