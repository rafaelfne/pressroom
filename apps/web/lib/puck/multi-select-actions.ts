import type { ComponentData, Data } from '@puckeditor/core';
import {
  deepCloneWithNewIds,
  collectComponentsWithZones,
  findSelectedIndices,
  type ClipboardPayload,
} from './clipboard';

type PuckDispatch = (action: Record<string, unknown>) => void;

/**
 * Remove multiple components from the data tree in a single atomic operation.
 * Removes both the content items and any zones they own.
 */
export function batchRemove(
  dispatch: PuckDispatch,
  data: Data,
  selectedIds: Set<string>,
): void {
  if (selectedIds.size === 0) return;

  // Filter out selected items from content
  const newContent = data.content.filter(
    (item) => !selectedIds.has(item.props.id),
  );

  // Remove zones owned by selected items
  const newZones: Record<string, ComponentData[]> = {};
  if (data.zones) {
    for (const [zoneKey, zoneItems] of Object.entries(data.zones)) {
      // Check if any selected item owns this zone
      const isOwnedBySelected = Array.from(selectedIds).some((id) =>
        zoneKey.startsWith(`${id}:`),
      );
      if (!isOwnedBySelected) {
        // Also filter selected items from within zones (shouldn't happen for top-level select, but safe)
        newZones[zoneKey] = zoneItems.filter(
          (item) => !selectedIds.has(item.props.id),
        );
      }
    }
  }

  dispatch({
    type: 'setData',
    data: { ...data, content: newContent, zones: newZones },
    recordHistory: true,
  });
}

/**
 * Paste components from the clipboard into the data tree at the given position.
 * Deep-clones items with new IDs to avoid conflicts.
 */
export function batchPaste(
  dispatch: PuckDispatch,
  data: Data,
  clipboard: ClipboardPayload,
  insertAfterIndex: number,
): void {
  if (clipboard.items.length === 0) return;

  // Clone with new IDs
  const cloned = deepCloneWithNewIds(clipboard.items, clipboard.zones);

  // Insert cloned items into content
  const newContent = [...data.content];
  const insertAt = Math.min(insertAfterIndex + 1, newContent.length);
  newContent.splice(insertAt, 0, ...cloned.items);

  // Merge cloned zones
  const newZones = { ...(data.zones ?? {}) };
  for (const [zoneKey, zoneItems] of Object.entries(cloned.zones)) {
    newZones[zoneKey] = zoneItems;
  }

  dispatch({
    type: 'setData',
    data: { ...data, content: newContent, zones: newZones },
    recordHistory: true,
  });
}

/**
 * Copy selected components (with their zone data) from the current data.
 * Returns the clipboard payload without modifying the data tree.
 */
export function copySelected(
  data: Data,
  selectedIds: Set<string>,
): ClipboardPayload {
  return collectComponentsWithZones(data, selectedIds);
}

/**
 * Cut selected components: copy them to clipboard, then remove from data.
 */
export function cutSelected(
  dispatch: PuckDispatch,
  data: Data,
  selectedIds: Set<string>,
): ClipboardPayload {
  const clipboard = copySelected(data, selectedIds);
  batchRemove(dispatch, data, selectedIds);
  return clipboard;
}

/**
 * Determine the best insert index for pasting.
 * If components are selected, paste after the last selected one.
 * Otherwise, paste at the end of content.
 */
export function getPasteInsertIndex(
  content: ComponentData[],
  selectedIds: Set<string>,
): number {
  if (selectedIds.size === 0) {
    return content.length - 1;
  }
  const indices = findSelectedIndices(content, selectedIds);
  return indices.length > 0 ? indices[indices.length - 1] : content.length - 1;
}

/**
 * Select all top-level component IDs from the content array.
 */
export function selectAllIds(content: ComponentData[]): Set<string> {
  return new Set(content.map((item) => item.props.id));
}
