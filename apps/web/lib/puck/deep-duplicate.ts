import type { Data, ComponentData } from '@puckeditor/core';

/**
 * Generates a new unique ID for a component.
 */
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Find all zone keys that belong to a component (based on component ID prefix).
 */
function findComponentZones(zones: Record<string, ComponentData[]>, componentId: string): string[] {
  return Object.keys(zones).filter((key) => key.startsWith(`${componentId}-`));
}

/**
 * Deep clone a component and all its children in zones, generating new IDs.
 * Returns the cloned component, the new zones to add, and zone keys to NOT copy from original.
 */
function deepCloneComponent(
  component: ComponentData,
  zones: Record<string, ComponentData[]>,
  idMap: Map<string, string> = new Map()
): {
  clonedComponent: ComponentData;
  newZones: Record<string, ComponentData[]>;
} {
  const oldId = component.props.id as string;
  const newId = generateId();
  idMap.set(oldId, newId);

  // Clone the component with new ID
  const clonedComponent: ComponentData = {
    type: component.type,
    props: {
      ...JSON.parse(JSON.stringify(component.props)),
      id: newId,
    },
  };

  const newZones: Record<string, ComponentData[]> = {};

  // Find and clone all zones that belong to this component
  const componentZones = findComponentZones(zones, oldId);

  for (const zoneKey of componentZones) {
    // Create new zone key with new component ID
    const zoneSuffix = zoneKey.slice(oldId.length); // e.g., "-content" or "-column-0"
    const newZoneKey = `${newId}${zoneSuffix}`;

    // Clone all children in this zone
    const children = zones[zoneKey] || [];
    const clonedChildren: ComponentData[] = [];

    for (const child of children) {
      const { clonedComponent: clonedChild, newZones: childZones } = deepCloneComponent(
        child,
        zones,
        idMap
      );
      clonedChildren.push(clonedChild);
      Object.assign(newZones, childZones);
    }

    newZones[newZoneKey] = clonedChildren;
  }

  return { clonedComponent, newZones };
}

/**
 * Find the index of a component in the content array or a zone.
 */
function findComponentLocation(
  data: Data,
  componentId: string
): { zone: string | null; index: number } | null {
  // Check root content
  const rootIndex = data.content.findIndex((c) => c.props.id === componentId);
  if (rootIndex !== -1) {
    return { zone: null, index: rootIndex };
  }

  // Check zones
  if (data.zones) {
    for (const [zoneKey, components] of Object.entries(data.zones)) {
      const zoneIndex = components.findIndex((c) => c.props.id === componentId);
      if (zoneIndex !== -1) {
        return { zone: zoneKey, index: zoneIndex };
      }
    }
  }

  return null;
}

export type DuplicateResult = {
  type: 'setData';
  data: Data;
};

/**
 * Creates a deep duplicate of a component including all children in zones.
 * Returns the action to dispatch to Puck.
 */
export function createDeepDuplicate(
  data: Data,
  componentId: string
): DuplicateResult | null {
  // Find the component to duplicate
  let componentToDuplicate: ComponentData | null = null;

  // Check root content
  componentToDuplicate = data.content.find((c) => c.props.id === componentId) || null;

  // Check zones
  if (!componentToDuplicate && data.zones) {
    for (const components of Object.values(data.zones)) {
      const found = components.find((c) => c.props.id === componentId);
      if (found) {
        componentToDuplicate = found;
        break;
      }
    }
  }

  if (!componentToDuplicate) {
    return null;
  }

  // Find where the component is located
  const location = findComponentLocation(data, componentId);
  if (!location) {
    return null;
  }

  // Deep clone the component and its zones
  const { clonedComponent, newZones } = deepCloneComponent(
    componentToDuplicate,
    data.zones || {}
  );

  // Create new data with the duplicated component
  let newContent = [...data.content];
  let newDataZones = { ...(data.zones || {}) };

  if (location.zone === null) {
    // Component is in root content - insert after the original
    newContent = [
      ...newContent.slice(0, location.index + 1),
      clonedComponent,
      ...newContent.slice(location.index + 1),
    ];
  } else {
    // Component is in a zone - insert after the original in that zone
    const zoneContent = [...(newDataZones[location.zone] || [])];
    newDataZones[location.zone] = [
      ...zoneContent.slice(0, location.index + 1),
      clonedComponent,
      ...zoneContent.slice(location.index + 1),
    ];
  }

  // Add the cloned zones
  newDataZones = { ...newDataZones, ...newZones };

  return {
    type: 'setData',
    data: {
      ...data,
      content: newContent,
      zones: newDataZones,
    },
  };
}
