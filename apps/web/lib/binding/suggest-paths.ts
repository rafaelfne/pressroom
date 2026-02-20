/**
 * Suggest Paths
 * 
 * Parse sample data recursively to build path suggestions for binding autocomplete.
 * Blocks access to __proto__, prototype, constructor (consistent with resolver.ts).
 * 
 * @example
 * ```ts
 * const data = {
 *   customer: { name: 'John', email: 'john@example.com' },
 *   items: [{ name: 'Product A', price: 29.99 }],
 *   total: 29.99,
 * };
 * 
 * const pathSuggestions = generatePathSuggestions(data);
 * // Returns:
 * // [
 * //   { path: 'customer', type: 'object', depth: 1 },
 * //   { path: 'customer.name', type: 'string', depth: 2 },
 * //   { path: 'customer.email', type: 'string', depth: 2 },
 * //   { path: 'items', type: 'array[1]', depth: 1 },
 * //   { path: 'items[0]', type: 'object', depth: 2 },
 * //   { path: 'items[0].name', type: 'string', depth: 3 },
 * //   { path: 'items[0].price', type: 'number', depth: 3 },
 * //   { path: 'total', type: 'number', depth: 1 },
 * // ]
 * 
 * const filtered = filterSuggestions(pathSuggestions, 'customer');
 * // Returns suggestions containing 'customer' in path
 * 
 * const functionSuggestions = getFunctionSuggestions();
 * // Returns array of all 7 built-in functions
 * 
 * const filteredFns = filterFunctionSuggestions(functionSuggestions, 'format');
 * // Returns formatCurrency, formatDate, formatNumber
 * ```
 */

// Blocked property names for sandboxing
const BLOCKED_PROPERTIES = new Set(['__proto__', 'prototype', 'constructor']);

/**
 * Path suggestion with type information
 */
export type PathSuggestion = {
  path: string;
  type: string;
  depth: number;
};

/**
 * Function suggestion with signature and description
 */
export type FunctionSuggestion = {
  name: string;
  signature: string;
  description: string;
};

/**
 * Generate path suggestions by recursively walking data structure
 * 
 * @param data - Sample data object to analyze
 * @param maxDepth - Maximum depth to traverse (default: 10)
 * @returns Array of path suggestions with type information
 */
export function generatePathSuggestions(
  data: unknown,
  maxDepth: number = 10,
): PathSuggestion[] {
  const suggestions: PathSuggestion[] = [];
  const visited = new WeakSet<object>();

  function traverse(
    value: unknown,
    currentPath: string,
    currentDepth: number,
  ): void {
    // Stop at max depth
    if (currentDepth > maxDepth) {
      return;
    }

    // Handle null/undefined
    if (value === null || value === undefined) {
      if (currentPath) {
        suggestions.push({
          path: currentPath,
          type: 'null',
          depth: currentDepth,
        });
      }
      return;
    }

    // Handle primitives
    if (typeof value === 'string') {
      if (currentPath) {
        suggestions.push({
          path: currentPath,
          type: 'string',
          depth: currentDepth,
        });
      }
      return;
    }

    if (typeof value === 'number') {
      if (currentPath) {
        suggestions.push({
          path: currentPath,
          type: 'number',
          depth: currentDepth,
        });
      }
      return;
    }

    if (typeof value === 'boolean') {
      if (currentPath) {
        suggestions.push({
          path: currentPath,
          type: 'boolean',
          depth: currentDepth,
        });
      }
      return;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (currentPath) {
        suggestions.push({
          path: currentPath,
          type: `array[${value.length}]`,
          depth: currentDepth,
        });
      }

      // Explore first element to suggest item paths
      if (value.length > 0 && value[0] !== null && value[0] !== undefined) {
        const firstElement = value[0];
        const itemPath = currentPath ? `${currentPath}[0]` : '[0]';
        traverse(firstElement, itemPath, currentDepth + 1);
      }
      return;
    }

    // Handle objects
    if (typeof value === 'object') {
      // Prevent circular references
      if (visited.has(value)) {
        return;
      }
      visited.add(value);

      // Add object suggestion
      if (currentPath) {
        suggestions.push({
          path: currentPath,
          type: 'object',
          depth: currentDepth,
        });
      }

      // Traverse properties
      const obj = value as Record<string, unknown>;
      for (const key of Object.keys(obj)) {
        // Block dangerous properties
        if (BLOCKED_PROPERTIES.has(key)) {
          continue;
        }

        const propertyPath = currentPath ? `${currentPath}.${key}` : key;
        traverse(obj[key], propertyPath, currentDepth + 1);
      }
    }
  }

  traverse(data, '', 0);
  return suggestions;
}

/**
 * Filter path suggestions based on query string
 * 
 * @param suggestions - Array of path suggestions
 * @param query - Search query (case-insensitive)
 * @returns Filtered suggestions matching the query
 */
export function filterSuggestions(
  suggestions: PathSuggestion[],
  query: string,
): PathSuggestion[] {
  if (!query) {
    return suggestions;
  }

  const lowerQuery = query.toLowerCase();
  return suggestions.filter((suggestion) =>
    suggestion.path.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get static list of function suggestions
 * Based on built-in functions from ./functions.ts
 * 
 * @returns Array of function suggestions
 */
export function getFunctionSuggestions(): FunctionSuggestion[] {
  return [
    {
      name: 'formatCurrency',
      signature: "formatCurrency(value, 'BRL'|'USD'|'EUR'|'GBP')",
      description: 'Format number as currency',
    },
    {
      name: 'formatDate',
      signature: "formatDate(value, 'YYYY-MM-DD'|'MM/DD/YYYY'|'DD/MM/YYYY')",
      description: 'Format date with pattern',
    },
    {
      name: 'formatNumber',
      signature: 'formatNumber(value, decimals)',
      description: 'Format number with decimal precision',
    },
    {
      name: 'if',
      signature: 'if(condition, thenValue, elseValue)',
      description: 'Conditional expression',
    },
    {
      name: 'uppercase',
      signature: 'uppercase(value)',
      description: 'Convert to uppercase',
    },
    {
      name: 'lowercase',
      signature: 'lowercase(value)',
      description: 'Convert to lowercase',
    },
    {
      name: 'join',
      signature: 'join(array, separator)',
      description: 'Join array elements',
    },
  ];
}

/**
 * Filter function suggestions based on query string
 * 
 * @param suggestions - Array of function suggestions
 * @param query - Search query (case-insensitive)
 * @returns Filtered function suggestions matching the query
 */
export function filterFunctionSuggestions(
  suggestions: FunctionSuggestion[],
  query: string,
): FunctionSuggestion[] {
  if (!query) {
    return suggestions;
  }

  const lowerQuery = query.toLowerCase();
  return suggestions.filter(
    (suggestion) =>
      suggestion.name.toLowerCase().includes(lowerQuery) ||
      suggestion.description.toLowerCase().includes(lowerQuery)
  );
}
