// ============================================================================
// Types
// ============================================================================

export interface StylableValue {
  mode: 'inline' | 'token';
  inline?: string;
  token?: string;
}

export interface SpacingValue {
  mode: 'all' | 'individual';
  all?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

export type ConditionOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'empty'
  | 'notEmpty'
  | 'truthy'
  | 'falsy';

export interface VisibilityCondition {
  expression: string;
  operator: ConditionOperator;
  value?: string | number | boolean;
}

export interface StyleCondition {
  targetProperty: string;
  expression: string;
  operator: ConditionOperator;
  value?: string | number;
  trueValue: StylableValue;
  falseValue?: StylableValue;
}

export interface InheritedStyles {
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: string;
}

export type TokenCategory =
  | 'color'
  | 'typography'
  | 'spacing'
  | 'background'
  | 'border';

export interface StyleToken {
  id: string;
  name: string;
  label: string;
  category: TokenCategory;
  cssProperty: string;
  value: string;
  sortOrder: number;
}

export interface StyleGuide {
  id: string;
  name: string;
  organizationId: string;
  isDefault: boolean;
  tokens: StyleToken[];
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Resolves a StylableValue to a CSS string value.
 * When value is a string, return it directly.
 * When it's a StylableValue with mode "token", find the matching token.
 * When mode is "inline", return the inline value.
 */
export function resolveStylableValue(
  value: StylableValue | string | undefined,
  tokens?: StyleToken[]
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  // If value is a plain string, return it directly
  if (typeof value === 'string') {
    return value;
  }

  // Handle StylableValue object
  if (value.mode === 'inline') {
    return value.inline;
  }

  if (value.mode === 'token' && value.token && tokens) {
    const token = tokens.find((t) => t.name === value.token);
    return token?.value;
  }

  return undefined;
}

/**
 * Resolves a SpacingValue to a CSS spacing string.
 * When mode is "all", return the `all` value.
 * When mode is "individual", return a CSS shorthand like "8px 12px 16px 12px".
 */
export function resolveSpacing(
  spacing: SpacingValue | string | undefined
): string | undefined {
  if (spacing === undefined) {
    return undefined;
  }

  // If spacing is a plain string, return it directly
  if (typeof spacing === 'string') {
    return spacing;
  }

  // Handle SpacingValue object
  if (spacing.mode === 'all') {
    return spacing.all;
  }

  if (spacing.mode === 'individual') {
    const top = spacing.top || '0';
    const right = spacing.right || '0';
    const bottom = spacing.bottom || '0';
    const left = spacing.left || '0';

    // Return CSS shorthand: top right bottom left
    return `${top} ${right} ${bottom} ${left}`;
  }

  return undefined;
}

/**
 * Evaluates a condition based on operator and values.
 * Returns true if the condition is met, false otherwise.
 */
export function evaluateCondition(
  resolvedValue: unknown,
  operator: ConditionOperator,
  compareValue?: string | number | boolean
): boolean {
  switch (operator) {
    case 'eq':
      return resolvedValue === compareValue;

    case 'neq':
      return resolvedValue !== compareValue;

    case 'gt':
      if (typeof resolvedValue === 'number' && typeof compareValue === 'number') {
        return resolvedValue > compareValue;
      }
      return false;

    case 'lt':
      if (typeof resolvedValue === 'number' && typeof compareValue === 'number') {
        return resolvedValue < compareValue;
      }
      return false;

    case 'gte':
      if (typeof resolvedValue === 'number' && typeof compareValue === 'number') {
        return resolvedValue >= compareValue;
      }
      return false;

    case 'lte':
      if (typeof resolvedValue === 'number' && typeof compareValue === 'number') {
        return resolvedValue <= compareValue;
      }
      return false;

    case 'empty':
      if (resolvedValue === null || resolvedValue === undefined) {
        return true;
      }
      if (typeof resolvedValue === 'string') {
        return resolvedValue.trim() === '';
      }
      if (Array.isArray(resolvedValue)) {
        return resolvedValue.length === 0;
      }
      return false;

    case 'notEmpty':
      if (resolvedValue === null || resolvedValue === undefined) {
        return false;
      }
      if (typeof resolvedValue === 'string') {
        return resolvedValue.trim() !== '';
      }
      if (Array.isArray(resolvedValue)) {
        return resolvedValue.length > 0;
      }
      return true;

    case 'truthy':
      return Boolean(resolvedValue);

    case 'falsy':
      return !Boolean(resolvedValue);

    default:
      return false;
  }
}
