'use client';

import { useContext } from 'react';
import {
  MultiSelectContext,
  type MultiSelectContextValue,
} from '@/contexts/multi-select-context';

/**
 * Hook to access multi-selection state and actions
 *
 * Must be used within a MultiSelectProvider.
 * Provides access to:
 * - Current selection state
 * - Dispatch function for actions
 * - Convenience methods (isSelected, hasSelection, etc.)
 *
 * @throws Error if used outside MultiSelectProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state, dispatch, isSelected, selectedCount } = useMultiSelect();
 *
 *   const handleClick = (id: string) => {
 *     dispatch({ type: 'TOGGLE_SELECTION', id });
 *   };
 *
 *   return <div>Selected: {selectedCount}</div>;
 * }
 * ```
 */
export function useMultiSelect(): MultiSelectContextValue {
  const context = useContext(MultiSelectContext);

  if (!context) {
    throw new Error('useMultiSelect must be used within a MultiSelectProvider');
  }

  return context;
}
