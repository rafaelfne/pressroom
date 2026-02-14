/**
 * Resolver
 * 
 * Resolves AST nodes against a data object with sandboxing.
 * Blocks access to __proto__, prototype, constructor.
 */

import type { Expression, PathSegment, FunctionArg } from './expression-parser';
import { getFunction } from './functions';

// Blocked property names for sandboxing
const BLOCKED_PROPERTIES = new Set(['__proto__', 'prototype', 'constructor']);

/**
 * Resolve an expression against a data object
 */
export function resolveExpression(
  expression: Expression,
  data: Record<string, unknown>,
): unknown {
  if (expression.type === 'path') {
    return resolvePath(expression.segments, data);
  }

  if (expression.type === 'function') {
    return resolveFunction(expression.name, expression.args, data);
  }

  return undefined;
}

/**
 * Resolve a path expression
 */
function resolvePath(
  segments: PathSegment[],
  data: Record<string, unknown>,
): unknown {
  let current: unknown = data;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (segment.type === 'property') {
      // Block dangerous properties
      if (BLOCKED_PROPERTIES.has(segment.name)) {
        return undefined;
      }

      // Navigate to property
      if (typeof current === 'object' && current !== null) {
        current = (current as Record<string, unknown>)[segment.name];
      } else {
        return undefined;
      }
    } else if (segment.type === 'index') {
      // Array access
      if (Array.isArray(current)) {
        current = current[segment.value];
      } else {
        return undefined;
      }
    }
  }

  return current;
}

/**
 * Resolve a function call
 */
function resolveFunction(
  name: string,
  args: FunctionArg[],
  data: Record<string, unknown>,
): unknown {
  const fn = getFunction(name);
  if (!fn) {
    return undefined;
  }

  // Resolve arguments
  const resolvedArgs = args.map((arg) => resolveArg(arg, data));

  try {
    return fn(...resolvedArgs);
  } catch {
    // If function throws, return undefined
    return undefined;
  }
}

/**
 * Resolve a function argument
 */
function resolveArg(arg: FunctionArg, data: Record<string, unknown>): unknown {
  if (arg.type === 'string') {
    return arg.value;
  }

  if (arg.type === 'number') {
    return arg.value;
  }

  if (arg.type === 'path') {
    return resolvePath(arg.segments, data);
  }

  return undefined;
}
