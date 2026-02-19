'use client';

import { Copy, Trash2 } from 'lucide-react';
import type { createUsePuck } from '@puckeditor/core';
import { createDeepDuplicate } from '@/lib/puck/deep-duplicate';

export interface CustomActionBarProps {
  usePuck: ReturnType<typeof createUsePuck>;
}

/**
 * Custom action bar that replaces Puck's default.
 * Provides deep duplicate (including children in zones) and delete actions.
 */
export function CustomActionBar({ usePuck }: CustomActionBarProps) {
  const selectedItem = usePuck((s) => s.selectedItem);
  const appState = usePuck((s) => s.appState);
  const dispatch = usePuck((s) => s.dispatch);

  if (!selectedItem) {
    return null;
  }

  const componentId = selectedItem.props.id as string;

  // Get index and zone from itemSelector in UI state
  const itemSelector = appState.ui.itemSelector;
  const index = itemSelector?.index ?? 0;
  const zone = itemSelector?.zone ?? null;

  const handleDuplicate = () => {
    const result = createDeepDuplicate(appState.data, componentId);
    if (result) {
      dispatch(result);
    }
  };

  const handleDelete = () => {
    // Type assertion needed because Puck types expect string but null/undefined is valid for root
    dispatch({
      type: 'remove',
      index,
      zone: zone as string,
    });
  };

  return (
    <div
      className="flex items-center gap-1 rounded-md bg-white shadow-md border border-gray-200 p-1"
      data-testid="custom-action-bar"
    >
      <button
        type="button"
        onClick={handleDuplicate}
        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
        title="Duplicate (with children)"
        data-testid="action-duplicate"
      >
        <Copy className="w-4 h-4 text-gray-600" />
      </button>
      <button
        type="button"
        onClick={handleDelete}
        className="p-1.5 rounded hover:bg-red-50 transition-colors"
        title="Delete"
        data-testid="action-delete"
      >
        <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
      </button>
    </div>
  );
}
