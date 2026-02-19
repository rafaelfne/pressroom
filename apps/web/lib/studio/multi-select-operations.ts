import type { Data, ComponentData } from '@puckeditor/core';

/**
 * Serialized component structure for clipboard operations.
 * Preserves component type, props, nested slots, and original ID.
 */
export interface SerializedComponent {
  type: string;
  props: Record<string, unknown>;
  slots: Record<string, SerializedComponent[]>;
  originalId: string;
}

/**
 * Pressroom clipboard format for cross-page/cross-template paste operations.
 * Includes version and source metadata for validation.
 */
export interface PressroomClipboard {
  version: 1;
  source: {
    templateId: string;
    pageId: string;
    pageName: string;
  };
  components: SerializedComponent[];
  copiedAt: string;
}

/**
 * Generates a unique component ID.
 * Uses crypto.randomUUID if available, otherwise falls back to timestamp+random.
 */
export function generateComponentId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Finds all zone keys that belong to a specific component.
 * Zone keys follow the pattern `{componentId}-{zoneName}`.
 */
function findComponentZones(zones: Record<string, ComponentData[]>, componentId: string): string[] {
  return Object.keys(zones).filter((key) => key.startsWith(`${componentId}-`));
}



/**
 * Recursively checks if childId is a descendant of parentId in the data tree.
 * Searches through all zones to find nested relationships.
 */
export function isDescendantOf(data: Data, childId: string, parentId: string): boolean {
  const parentZones = findComponentZones(data.zones || {}, parentId);
  
  for (const zoneKey of parentZones) {
    const children = data.zones?.[zoneKey] || [];
    
    for (const child of children) {
      const childComponentId = child.props.id as string;
      
      // Direct child match
      if (childComponentId === childId) {
        return true;
      }
      
      // Recursive search in child's descendants
      if (isDescendantOf(data, childId, childComponentId)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Filters out IDs that are descendants of other IDs in the set.
 * This prevents double-removal when both parent and child are selected.
 */
function filterDescendants(data: Data, ids: Set<string>): Set<string> {
  const filtered = new Set<string>();
  
  for (const id of ids) {
    let isDescendant = false;
    
    for (const otherId of ids) {
      if (id !== otherId && isDescendantOf(data, id, otherId)) {
        isDescendant = true;
        break;
      }
    }
    
    if (!isDescendant) {
      filtered.add(id);
    }
  }
  
  return filtered;
}

/**
 * Removes multiple components by ID from the data tree.
 * Handles hierarchy: if parent and child both selected, removing parent already removes child.
 * Returns a new Data object (immutable operation).
 */
export function removeComponents(data: Data, idsToRemove: Set<string>): Data {
  if (idsToRemove.size === 0) {
    return data;
  }
  
  // Filter out descendants to avoid double-removal
  const filteredIds = filterDescendants(data, idsToRemove);
  
  // Remove from root content
  const newContent = (data.content || []).filter(
    (comp) => !filteredIds.has(comp.props.id as string)
  );
  
  // Remove from zones and clean up zones belonging to removed components
  const newZones: Record<string, ComponentData[]> = {};
  
  for (const [zoneKey, components] of Object.entries(data.zones || {})) {
    // Check if this zone belongs to a removed component
    const zoneOwnerId = zoneKey.split('-')[0];
    if (filteredIds.has(zoneOwnerId)) {
      // Skip this zone entirely (component and all its zones removed)
      continue;
    }
    
    // Filter components in this zone
    const filteredComponents = components.filter(
      (comp) => !filteredIds.has(comp.props.id as string)
    );
    
    // Only keep zone if it has components
    if (filteredComponents.length > 0) {
      newZones[zoneKey] = filteredComponents;
    }
  }
  
  return {
    ...data,
    content: newContent,
    zones: newZones,
  };
}

/**
 * Deep clones a component with new IDs for all nested components.
 * Returns the cloned component and all new zones.
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
  const newId = generateComponentId();
  idMap.set(oldId, newId);
  
  // Deep clone props
  const clonedComponent: ComponentData = {
    type: component.type,
    props: { ...JSON.parse(JSON.stringify(component.props)), id: newId },
  };
  
  const newZones: Record<string, ComponentData[]> = {};
  const componentZones = findComponentZones(zones, oldId);
  
  for (const zoneKey of componentZones) {
    const zoneSuffix = zoneKey.slice(oldId.length);
    const newZoneKey = `${newId}${zoneSuffix}`;
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
 * Duplicates multiple components by ID.
 * Each copy gets a new unique ID (recursively for nested children).
 * Copies are inserted immediately AFTER the original in the same zone.
 * Returns new data AND the list of new root-level IDs (for switching selection to copies).
 */
export function duplicateComponents(
  data: Data,
  idsToDuplicate: Set<string>
): { newData: Data; newIds: string[] } {
  if (idsToDuplicate.size === 0) {
    return { newData: data, newIds: [] };
  }
  
  const newIds: string[] = [];
  const newContent: ComponentData[] = [];
  const allNewZones: Record<string, ComponentData[]> = { ...data.zones };
  
  // Duplicate components in root content
  for (const component of data.content || []) {
    const componentId = component.props.id as string;
    newContent.push(component);
    
    if (idsToDuplicate.has(componentId)) {
      const { clonedComponent, newZones } = deepCloneComponent(
        component,
        data.zones || {},
        new Map()
      );
      newContent.push(clonedComponent);
      newIds.push(clonedComponent.props.id as string);
      Object.assign(allNewZones, newZones);
    }
  }
  
  // Duplicate components in zones
  const finalZones: Record<string, ComponentData[]> = {};
  
  for (const [zoneKey, components] of Object.entries(allNewZones)) {
    const zoneComponents: ComponentData[] = [];
    
    for (const component of components) {
      const componentId = component.props.id as string;
      zoneComponents.push(component);
      
      if (idsToDuplicate.has(componentId)) {
        const { clonedComponent, newZones } = deepCloneComponent(
          component,
          allNewZones,
          new Map()
        );
        zoneComponents.push(clonedComponent);
        // Note: new zones from nested duplication are added below
        Object.assign(allNewZones, newZones);
      }
    }
    
    finalZones[zoneKey] = zoneComponents;
  }
  
  // Merge any new zones created during zone duplication
  for (const [zoneKey, components] of Object.entries(allNewZones)) {
    if (!finalZones[zoneKey]) {
      finalZones[zoneKey] = components;
    }
  }
  
  return {
    newData: {
      ...data,
      content: newContent,
      zones: finalZones,
    },
    newIds,
  };
}

/**
 * Serializes a component and its nested zones for clipboard operations.
 * Recursively extracts all slots/zones belonging to the component.
 */
function serializeComponent(
  component: ComponentData,
  zones: Record<string, ComponentData[]>
): SerializedComponent {
  const componentId = component.props.id as string;
  const slots: Record<string, SerializedComponent[]> = {};
  
  // Find all zones belonging to this component
  const componentZones = findComponentZones(zones, componentId);
  
  for (const zoneKey of componentZones) {
    const zoneSuffix = zoneKey.slice(componentId.length + 1); // Remove "id-" prefix
    const children = zones[zoneKey] || [];
    
    slots[zoneSuffix] = children.map((child) => serializeComponent(child, zones));
  }
  
  return {
    type: component.type,
    props: JSON.parse(JSON.stringify(component.props)),
    slots,
    originalId: componentId,
  };
}

/**
 * Extracts and serializes components by ID for clipboard operations.
 * Preserves relative order (same sequence as in the page).
 * Returns SerializedComponent[] ready for clipboard or cross-page paste.
 */
export function extractComponents(data: Data, ids: Set<string>): SerializedComponent[] {
  if (ids.size === 0) {
    return [];
  }
  
  const serialized: SerializedComponent[] = [];
  
  // Extract from root content (preserves order)
  for (const component of data.content || []) {
    const componentId = component.props.id as string;
    
    if (ids.has(componentId)) {
      serialized.push(serializeComponent(component, data.zones || {}));
    }
  }
  
  // Also check zones for any missed components
  for (const components of Object.values(data.zones || {})) {
    for (const component of components) {
      const componentId = component.props.id as string;
      
      if (ids.has(componentId) && !serialized.some((s) => s.originalId === componentId)) {
        serialized.push(serializeComponent(component, data.zones || {}));
      }
    }
  }
  
  return serialized;
}

/**
 * Regenerates IDs for a serialized component and all its nested slots.
 * Returns the component as ComponentData and any zones that need to be added to data.zones.
 */
export function regenerateIds(component: SerializedComponent): {
  component: ComponentData;
  zones: Record<string, ComponentData[]>;
} {
  const newId = generateComponentId();
  const zones: Record<string, ComponentData[]> = {};
  
  // Process nested slots
  for (const [slotName, slotComponents] of Object.entries(component.slots)) {
    const zoneKey = `${newId}-${slotName}`;
    const zoneComponents: ComponentData[] = [];
    
    for (const slotComponent of slotComponents) {
      const { component: regeneratedComponent, zones: childZones } =
        regenerateIds(slotComponent);
      zoneComponents.push(regeneratedComponent);
      Object.assign(zones, childZones);
    }
    
    zones[zoneKey] = zoneComponents;
  }
  
  const newComponent: ComponentData = {
    type: component.type,
    props: {
      ...component.props,
      id: newId,
    },
  };
  
  return { component: newComponent, zones };
}

/**
 * Pastes serialized components into the data tree.
 * Regenerates ALL IDs recursively (never reuse original IDs).
 * If targetZone is not provided, defaults to root content.
 * If afterId is provided, inserts AFTER that component; otherwise inserts at end.
 * Returns new data + list of new root-level IDs.
 */
export function pasteComponents(
  data: Data,
  components: SerializedComponent[],
  targetZone?: string,
  afterId?: string
): { newData: Data; newIds: string[] } {
  if (components.length === 0) {
    return { newData: data, newIds: [] };
  }
  
  const newIds: string[] = [];
  const allNewZones: Record<string, ComponentData[]> = { ...data.zones };
  
  // Regenerate IDs for all components being pasted
  const regeneratedComponents: ComponentData[] = [];
  
  for (const serializedComp of components) {
    const { component, zones } = regenerateIds(serializedComp);
    regeneratedComponents.push(component);
    newIds.push(component.props.id as string);
    Object.assign(allNewZones, zones);
  }
  
  // Insert into target location
  if (!targetZone || targetZone === 'root') {
    // Insert into root content
    const newContent = [...(data.content || [])];
    
    if (afterId) {
      const afterIndex = newContent.findIndex((comp) => comp.props.id === afterId);
      if (afterIndex !== -1) {
        newContent.splice(afterIndex + 1, 0, ...regeneratedComponents);
      } else {
        // afterId not found, append to end
        newContent.push(...regeneratedComponents);
      }
    } else {
      // No afterId, append to end
      newContent.push(...regeneratedComponents);
    }
    
    return {
      newData: {
        ...data,
        content: newContent,
        zones: allNewZones,
      },
      newIds,
    };
  } else {
    // Insert into specific zone
    const zoneComponents = [...(allNewZones[targetZone] || [])];
    
    if (afterId) {
      const afterIndex = zoneComponents.findIndex((comp) => comp.props.id === afterId);
      if (afterIndex !== -1) {
        zoneComponents.splice(afterIndex + 1, 0, ...regeneratedComponents);
      } else {
        // afterId not found, append to end
        zoneComponents.push(...regeneratedComponents);
      }
    } else {
      // No afterId, append to end
      zoneComponents.push(...regeneratedComponents);
    }
    
    allNewZones[targetZone] = zoneComponents;
    
    return {
      newData: {
        ...data,
        zones: allNewZones,
      },
      newIds,
    };
  }
}

/**
 * Returns all component IDs in the root content (first level only).
 */
export function collectAllIds(data: Data): string[] {
  return (data.content || []).map((comp) => comp.props.id as string);
}

/**
 * Returns ALL component IDs including nested ones in zones.
 * Recursively traverses the entire component tree.
 */
export function collectAllIdsDeep(data: Data): string[] {
  const ids = new Set<string>();
  
  // Collect from root content
  for (const component of data.content || []) {
    ids.add(component.props.id as string);
  }
  
  // Collect from all zones recursively
  function collectFromZones(zones: Record<string, ComponentData[]>): void {
    for (const components of Object.values(zones)) {
      for (const component of components) {
        const componentId = component.props.id as string;
        ids.add(componentId);
        
        // Recursively collect from child zones
        const childZones = findComponentZones(zones, componentId);
        if (childZones.length > 0) {
          const childZonesObj: Record<string, ComponentData[]> = {};
          for (const zoneKey of childZones) {
            childZonesObj[zoneKey] = zones[zoneKey];
          }
          collectFromZones(childZonesObj);
        }
      }
    }
  }
  
  if (data.zones) {
    collectFromZones(data.zones);
  }
  
  return Array.from(ids);
}
