import type { Config } from '@puckeditor/core';

/**
 * Type-safe helper to get all component names registered in a Puck config.
 */
export function getComponentNames<T extends Config>(config: T): string[] {
  return Object.keys(config.components);
}

/**
 * Type-safe helper to get components for a specific category.
 */
export function getComponentsByCategory<T extends Config>(
  config: T,
  category: string,
): string[] {
  const cat = config.categories?.[category];
  if (!cat) return [];
  return cat.components ?? [];
}
