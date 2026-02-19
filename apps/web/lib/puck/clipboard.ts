import type { ComponentData, Data } from '@puckeditor/core';

/** Serialized clipboard payload for component copy/paste */
export type ClipboardPayload = {
  /** Copied component data (top-level items) */
  items: ComponentData[];
  /** Zone data associated with copied components (keyed by zone compound) */
  zones: Record<string, ComponentData[]>;
};

/**
 * Generate a unique component ID using crypto.randomUUID when available,
 * falling back to timestamp-based IDs.
 */
let idCounter = 0;
function generateComponentId(): string {
  idCounter++;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().slice(0, 8);
  }
  return `${Date.now()}-${idCounter}`;
}

/**
 * Build a mapping from old component IDs to new unique IDs.
 * Walks through items and all zone data recursively.
 */
function buildIdMap(
  items: ComponentData[],
  zones: Record<string, ComponentData[]>,
): Map<string, string> {
  const idMap = new Map<string, string>();

  function mapItem(item: ComponentData) {
    const oldId = item.props.id;
    if (oldId && !idMap.has(oldId)) {
      idMap.set(oldId, `${item.type}-${generateComponentId()}`);
    }
  }

  // Map top-level items
  for (const item of items) {
    mapItem(item);
  }

  // Map items inside zones
  for (const zoneItems of Object.values(zones)) {
    for (const item of zoneItems) {
      mapItem(item);
    }
  }

  return idMap;
}

/**
 * Deep-clone a set of components and their associated zones with new unique IDs.
 * Handles nested containers/grids by remapping zone keys (e.g., "oldId:zoneName" → "newId:zoneName").
 */
export function deepCloneWithNewIds(
  items: ComponentData[],
  zones: Record<string, ComponentData[]>,
): ClipboardPayload {
  // Deep clone first
  const clonedItems: ComponentData[] = JSON.parse(JSON.stringify(items));
  const clonedZones: Record<string, ComponentData[]> = JSON.parse(JSON.stringify(zones));

  // Build map of all old IDs → new IDs
  const idMap = buildIdMap(clonedItems, clonedZones);

  // Remap IDs in items
  function remapItem(item: ComponentData): ComponentData {
    const oldId = item.props.id;
    const newId = idMap.get(oldId) ?? oldId;
    return {
      ...item,
      props: { ...item.props, id: newId },
    };
  }

  // Remap top-level items
  const newItems = clonedItems.map(remapItem);

  // Remap zones: both keys and items inside them
  const newZones: Record<string, ComponentData[]> = {};
  for (const [zoneKey, zoneItems] of Object.entries(clonedZones)) {
    // Zone keys are "parentId:zoneName" — remap parentId
    const colonIndex = zoneKey.indexOf(':');
    let newKey = zoneKey;
    if (colonIndex !== -1) {
      const parentId = zoneKey.slice(0, colonIndex);
      const zoneName = zoneKey.slice(colonIndex + 1);
      const newParentId = idMap.get(parentId) ?? parentId;

      // Zone name often includes the parentId too (e.g., "parentId-content")
      // Remap it as well
      let newZoneName = zoneName;
      for (const [oldId, newId] of idMap.entries()) {
        newZoneName = newZoneName.replaceAll(oldId, newId);
      }
      newKey = `${newParentId}:${newZoneName}`;
    }
    newZones[newKey] = zoneItems.map(remapItem);
  }

  return { items: newItems, zones: newZones };
}

/**
 * Collect component data and associated zone data for given component IDs.
 * Walks the zone tree recursively to capture nested content (e.g., Container children).
 */
export function collectComponentsWithZones(
  data: Data,
  componentIds: Set<string>,
): ClipboardPayload {
  const items: ComponentData[] = [];
  const zones: Record<string, ComponentData[]> = {};

  // Collect items from the main content zone
  for (const item of data.content) {
    if (componentIds.has(item.props.id)) {
      items.push(item);
      // Recursively collect zones owned by this item
      collectZonesForItem(data, item.props.id, zones);
    }
  }

  return { items, zones };
}

/**
 * Recursively collect all zone data owned by a component.
 */
function collectZonesForItem(
  data: Data,
  itemId: string,
  collected: Record<string, ComponentData[]>,
): void {
  if (!data.zones) return;

  for (const [zoneKey, zoneItems] of Object.entries(data.zones)) {
    // Zone keys start with the parent component ID: "parentId:zoneName"
    if (zoneKey.startsWith(`${itemId}:`)) {
      collected[zoneKey] = [...zoneItems];
      // Recursively collect zones for children in this zone
      for (const child of zoneItems) {
        collectZonesForItem(data, child.props.id, collected);
      }
    }
  }
}

/**
 * Find the indices where selected components appear in the content array.
 * Returns sorted indices in ascending order.
 */
export function findSelectedIndices(
  content: ComponentData[],
  selectedIds: Set<string>,
): number[] {
  const indices: number[] = [];
  for (let i = 0; i < content.length; i++) {
    if (selectedIds.has(content[i].props.id)) {
      indices.push(i);
    }
  }
  return indices.sort((a, b) => a - b);
}
