/**
 * Data Binding Engine
 * 
 * Public API for resolving bindings in template objects.
 * Recursively walks template, finds {{...}} expressions, and resolves them against data.
 */

import { parse } from './expression-parser';
import { resolveExpression } from './resolver';

/**
 * Maximum recursion depth for resolving nested objects/arrays.
 * Prevents stack overflow from deeply nested template structures or circular references (F-10.5).
 * 50 is chosen because Puck template data rarely nests beyond 20 levels, and this
 * provides generous headroom while still protecting against pathological inputs.
 */
const MAX_RESOLVE_DEPTH = 50;

/**
 * Resolve bindings in a template object
 * 
 * @param template - Template object (usually Puck JSON structure)
 * @param data - Data object to resolve bindings against
 * @returns Resolved template with bindings replaced
 */
export function resolveBindings(
  template: unknown,
  data: Record<string, unknown>,
): unknown {
  return resolveValue(template, data, 0, new WeakSet());
}

/**
 * Recursively resolve a value.
 * Tracks visited objects and depth to prevent circular references and stack overflow (F-10.5).
 */
function resolveValue(
  value: unknown,
  data: Record<string, unknown>,
  depth: number,
  visited: WeakSet<object>,
): unknown {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Handle strings (may contain expressions)
  if (typeof value === 'string') {
    return resolveString(value, data);
  }

  // Guard against deep nesting and circular references
  if (depth >= MAX_RESOLVE_DEPTH) {
    return value;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (visited.has(value)) return value;
    visited.add(value);
    return value.map((item) => resolveValue(item, data, depth + 1, visited));
  }

  // Handle objects
  if (typeof value === 'object') {
    if (visited.has(value)) return value;
    visited.add(value);
    const resolved: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      resolved[key] = resolveValue(val, data, depth + 1, visited);
    }
    return resolved;
  }

  // Primitives (numbers, booleans) pass through
  return value;
}

/**
 * Resolve a string value
 * 
 * If string is entirely one expression (e.g. "{{items}}"), return the raw resolved value.
 * If string contains mixed text + expressions, return concatenated string.
 */
function resolveString(str: string, data: Record<string, unknown>): unknown {
  const nodes = parse(str);

  // If no nodes, return empty string
  if (nodes.length === 0) {
    return '';
  }

  // If single expression node, return raw value
  if (nodes.length === 1 && nodes[0].type === 'expression') {
    const resolved = resolveExpression(nodes[0].expression, data);
    if (resolved !== undefined) {
      return resolved;
    }
    // Fallback to original expression text
    return str;
  }

  // Mixed content or multiple nodes - concatenate as string
  let result = '';
  for (const node of nodes) {
    if (node.type === 'literal') {
      result += node.value;
    } else {
      const resolved = resolveExpression(node.expression, data);
      if (resolved !== undefined) {
        result += String(resolved);
      } else {
        // Fallback to original expression text from the AST node
        result += node.original;
      }
    }
  }

  return result;
}
