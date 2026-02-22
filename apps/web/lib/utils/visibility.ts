import type { Data } from '@puckeditor/core';
import { resolveBindings } from '@/lib/binding';
import {
  evaluateCondition,
  resolveStylableValue,
  type VisibilityCondition,
  type ConditionOperator,
  type StyleCondition,
  type StyleToken,
} from '@/lib/types/style-system';

/**
 * Parse a visibility condition JSON string into a VisibilityCondition object.
 * Returns null if the string is empty or invalid JSON.
 */
function parseVisibilityCondition(conditionJson: string): VisibilityCondition | null {
  if (!conditionJson || conditionJson.trim() === '') {
    return null;
  }

  try {
    const parsed = JSON.parse(conditionJson) as Record<string, unknown>;
    if (
      typeof parsed.expression === 'string' &&
      typeof parsed.operator === 'string'
    ) {
      return parsed as unknown as VisibilityCondition;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Evaluate a visibility condition JSON string against data context.
 *
 * @returns true if visible (condition met or no condition), false if hidden
 */
export function evaluateVisibilityCondition(
  conditionJson: string,
  data: Record<string, unknown>,
): boolean {
  const condition = parseVisibilityCondition(conditionJson);
  if (!condition) {
    // No valid condition means always visible
    return true;
  }

  // Resolve the expression (e.g. "{{data.show}}") against the data context
  const resolvedValue = resolveBindings(condition.expression, data);

  // Evaluate the condition
  return evaluateCondition(
    resolvedValue,
    condition.operator as ConditionOperator,
    condition.value,
  );
}

type ComponentItem = { type: string; props: Record<string, unknown> };

/**
 * Strip invisible components from a Puck Data tree based on visibility conditions.
 * Walks content and zones, removing items whose visibilityCondition evaluates to hidden.
 *
 * Used in the server rendering pipeline (PDF/HTML) where components cannot self-hide
 * because hooks are unavailable.
 */
export function stripInvisibleComponents(
  data: Data,
  contextData: Record<string, unknown>,
): Data {
  const content = (data.content ?? []) as ComponentItem[];
  const filteredContent = filterItems(content, contextData);

  const result: Record<string, unknown> = {
    ...data,
    content: filteredContent,
  };

  if (data.zones) {
    const zones: Record<string, ComponentItem[]> = {};
    for (const [key, items] of Object.entries(data.zones)) {
      zones[key] = filterItems(items as ComponentItem[], contextData);
    }
    result.zones = zones;
  }

  return result as Data;
}

/**
 * Filter a list of component items, removing those with hidden visibility conditions.
 * Also recursively cleans up orphaned zones for removed container components.
 */
function filterItems(
  items: ComponentItem[],
  data: Record<string, unknown>,
): ComponentItem[] {
  return items.filter((item) => {
    const conditionJson = item.props?.visibilityCondition as string | undefined;
    if (!conditionJson) return true;
    return evaluateVisibilityCondition(conditionJson, data);
  });
}

// ============================================================================
// Style Condition Evaluation
// ============================================================================

/**
 * Parse a style conditions JSON string into an array of StyleCondition objects.
 * Returns an empty array if the string is empty or invalid.
 */
function parseStyleConditions(conditionsJson: string): StyleCondition[] {
  if (!conditionsJson || conditionsJson.trim() === '') {
    return [];
  }

  try {
    const parsed = JSON.parse(conditionsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c: unknown) =>
        typeof c === 'object' &&
        c !== null &&
        typeof (c as Record<string, unknown>).targetProperty === 'string' &&
        typeof (c as Record<string, unknown>).expression === 'string' &&
        typeof (c as Record<string, unknown>).operator === 'string',
    ) as StyleCondition[];
  } catch {
    return [];
  }
}

/**
 * Evaluate style conditions against data context and return CSS property overrides.
 *
 * @param conditionsJson - JSON string containing an array of StyleCondition objects
 * @param data - Data context for expression resolution
 * @param tokens - Style tokens for resolving StylableValue references
 * @returns Map of CSS property name → resolved CSS value
 */
export function evaluateStyleConditions(
  conditionsJson: string,
  data: Record<string, unknown>,
  tokens: StyleToken[] = [],
): Record<string, string> {
  const conditions = parseStyleConditions(conditionsJson);
  if (conditions.length === 0) return {};

  const overrides: Record<string, string> = {};

  for (const condition of conditions) {
    const resolvedValue = resolveBindings(condition.expression, data);
    const conditionMet = evaluateCondition(
      resolvedValue,
      condition.operator as ConditionOperator,
      condition.value,
    );

    const stylableValue = conditionMet
      ? condition.trueValue
      : condition.falseValue;

    if (stylableValue) {
      const resolved = resolveStylableValue(stylableValue, tokens);
      if (resolved !== undefined) {
        overrides[condition.targetProperty] = resolved;
      }
    }
  }

  return overrides;
}

/**
 * Pre-process a Puck Data tree to resolve style conditions.
 * For each component with a `styleConditions` prop, evaluates the conditions
 * and applies the resulting overrides to the component's props.
 *
 * Used in the server rendering pipeline where hooks are unavailable.
 */
export function resolveStyleConditionsInData(
  data: Data,
  contextData: Record<string, unknown>,
  tokens: StyleToken[] = [],
): Data {
  const content = (data.content ?? []) as ComponentItem[];
  const resolvedContent = resolveStyleConditionsInItems(content, contextData, tokens);

  const result: Record<string, unknown> = {
    ...data,
    content: resolvedContent,
  };

  if (data.zones) {
    const zones: Record<string, ComponentItem[]> = {};
    for (const [key, items] of Object.entries(data.zones)) {
      zones[key] = resolveStyleConditionsInItems(items as ComponentItem[], contextData, tokens);
    }
    result.zones = zones;
  }

  return result as Data;
}

/**
 * Apply style condition overrides to a list of component items.
 */
function resolveStyleConditionsInItems(
  items: ComponentItem[],
  data: Record<string, unknown>,
  tokens: StyleToken[],
): ComponentItem[] {
  return items.map((item) => {
    const conditionsJson = item.props?.styleConditions as string | undefined;
    if (!conditionsJson) return item;

    const overrides = evaluateStyleConditions(conditionsJson, data, tokens);
    if (Object.keys(overrides).length === 0) return item;

    return {
      ...item,
      props: {
        ...item.props,
        ...overrides,
      },
    };
  });
}
