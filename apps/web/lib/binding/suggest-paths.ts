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
 * Pipe-specific suggestion shown when typing after | inside {{ }}
 * Uses the actual pipe syntax (colon-separated args) that the parser expects.
 */
export type PipeSuggestion = {
  /** Pipe function name (e.g. "currency", "date", "percent") */
  name: string;
  /** Display signature in pipe syntax (e.g. "currency:'BRL'") */
  signature: string;
  /** Human-readable description */
  description: string;
  /** Text to insert when selected (e.g. "currency:'BRL'") */
  insertText: string;
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
      signature: "formatDate(value, 'YYYY-MM-DD'|'MM/DD/YYYY'|'DD/MM/YYYY'|'MMM/yy'|'MM/yyyy')",
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
    {
      name: 'currency',
      signature: "currency(value, 'BRL'|'USD'|'EUR'|'GBP')",
      description: 'Format as currency (pipe-friendly, default BRL)',
    },
    {
      name: 'percent',
      signature: 'percent(value, decimals)',
      description: 'Format as percentage (value × 100)',
    },
    {
      name: 'abs',
      signature: 'abs(value)',
      description: 'Absolute value',
    },
    {
      name: 'date',
      signature: "date(value, 'DD/MM/YYYY'|'MMM/yy'|'MM/yyyy')",
      description: 'Format date (pipe-friendly, default DD/MM/YYYY)',
    },
    {
      name: 'number',
      signature: 'number(value, decimals)',
      description: 'Format number (pipe-friendly)',
    },
    {
      name: 'cpf',
      signature: 'cpf(value)',
      description: 'Format Brazilian CPF (XXX.XXX.XXX-XX)',
    },
    {
      name: 'sign',
      signature: 'sign(value)',
      description: 'Preserve sign for formatting (pass-through numeric)',
    },
    {
      name: 'ifEmpty',
      signature: "ifEmpty(value, 'fallback')",
      description: 'Fallback for null/undefined/empty values',
    },
    {
      name: 'multiply',
      signature: 'multiply(value, factor)',
      description: 'Multiply value by factor',
    },
  ];
}

/**
 * Get pipe-specific suggestions for use after | in binding expressions.
 * These use the pipe syntax (name:arg) that the expression parser expects,
 * NOT the function-call syntax (name(arg)).
 *
 * @returns Array of pipe suggestions with insert text
 */
export function getPipeSuggestions(): PipeSuggestion[] {
  return [
    {
      name: 'currency',
      signature: "currency:'BRL'",
      description: 'Format as currency (BRL, USD, EUR, GBP)',
      insertText: "currency:'BRL'",
    },
    {
      name: 'date',
      signature: "date:'DD/MM/YYYY'",
      description: 'Format date (DD/MM/YYYY, MMM/yy, YYYY-MM-DD)',
      insertText: "date:'DD/MM/YYYY'",
    },
    {
      name: 'number',
      signature: 'number:2',
      description: 'Format number with decimal precision',
      insertText: 'number:2',
    },
    {
      name: 'percent',
      signature: 'percent:2',
      description: 'Format as percentage (value × 100)',
      insertText: 'percent:2',
    },
    {
      name: 'uppercase',
      signature: 'uppercase',
      description: 'Convert to uppercase',
      insertText: 'uppercase',
    },
    {
      name: 'lowercase',
      signature: 'lowercase',
      description: 'Convert to lowercase',
      insertText: 'lowercase',
    },
    {
      name: 'sign',
      signature: 'sign',
      description: 'Add +/- sign prefix to number',
      insertText: 'sign',
    },
    {
      name: 'abs',
      signature: 'abs',
      description: 'Absolute value',
      insertText: 'abs',
    },
    {
      name: 'cpf',
      signature: 'cpf',
      description: 'Format Brazilian CPF (XXX.XXX.XXX-XX)',
      insertText: 'cpf',
    },
    {
      name: 'ifEmpty',
      signature: "ifEmpty:'N/A'",
      description: 'Fallback for null/undefined/empty values',
      insertText: "ifEmpty:'N/A'",
    },
    {
      name: 'multiply',
      signature: 'multiply:100',
      description: 'Multiply value by factor',
      insertText: 'multiply:100',
    },
    {
      name: 'formatCurrency',
      signature: "formatCurrency:'BRL'",
      description: 'Format as currency (alias)',
      insertText: "formatCurrency:'BRL'",
    },
    {
      name: 'formatDate',
      signature: "formatDate:'DD/MM/YYYY'",
      description: 'Format date (alias)',
      insertText: "formatDate:'DD/MM/YYYY'",
    },
    {
      name: 'formatNumber',
      signature: 'formatNumber:2',
      description: 'Format number (alias)',
      insertText: 'formatNumber:2',
    },
  ];
}

/**
 * Filter pipe suggestions based on query string
 *
 * @param suggestions - Array of pipe suggestions
 * @param query - Search query (case-insensitive)
 * @returns Filtered pipe suggestions matching the query
 */
export function filterPipeSuggestions(
  suggestions: PipeSuggestion[],
  query: string,
): PipeSuggestion[] {
  if (!query) {
    return suggestions;
  }

  const lowerQuery = query.toLowerCase();
  return suggestions.filter(
    (suggestion) =>
      suggestion.name.toLowerCase().includes(lowerQuery) ||
      suggestion.description.toLowerCase().includes(lowerQuery),
  );
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
