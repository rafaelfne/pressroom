import { describe, it, expect } from 'vitest';
import {
  evaluateVisibilityCondition,
  stripInvisibleComponents,
  evaluateStyleConditions,
  resolveStyleConditionsInData,
} from '@/lib/utils/visibility';
import type { Data } from '@puckeditor/core';
import type { StyleToken } from '@/lib/types/style-system';

describe('evaluateVisibilityCondition', () => {
  it('returns true for empty condition string', () => {
    expect(evaluateVisibilityCondition('', {})).toBe(true);
  });

  it('returns true for whitespace-only condition string', () => {
    expect(evaluateVisibilityCondition('   ', {})).toBe(true);
  });

  it('returns true for invalid JSON', () => {
    expect(evaluateVisibilityCondition('not-json', {})).toBe(true);
  });

  it('returns true for JSON missing required fields', () => {
    expect(evaluateVisibilityCondition('{"foo":"bar"}', {})).toBe(true);
  });

  it('evaluates truthy operator correctly', () => {
    const condition = JSON.stringify({ expression: '{{show}}', operator: 'truthy' });
    expect(evaluateVisibilityCondition(condition, { show: true })).toBe(true);
    expect(evaluateVisibilityCondition(condition, { show: false })).toBe(false);
    expect(evaluateVisibilityCondition(condition, { show: 0 })).toBe(false);
    expect(evaluateVisibilityCondition(condition, { show: 'yes' })).toBe(true);
  });

  it('evaluates falsy operator correctly', () => {
    const condition = JSON.stringify({ expression: '{{show}}', operator: 'falsy' });
    expect(evaluateVisibilityCondition(condition, { show: false })).toBe(true);
    expect(evaluateVisibilityCondition(condition, { show: true })).toBe(false);
  });

  it('evaluates eq operator correctly', () => {
    const condition = JSON.stringify({ expression: '{{status}}', operator: 'eq', value: 'active' });
    expect(evaluateVisibilityCondition(condition, { status: 'active' })).toBe(true);
    expect(evaluateVisibilityCondition(condition, { status: 'inactive' })).toBe(false);
  });

  it('evaluates neq operator correctly', () => {
    const condition = JSON.stringify({ expression: '{{status}}', operator: 'neq', value: 'draft' });
    expect(evaluateVisibilityCondition(condition, { status: 'published' })).toBe(true);
    expect(evaluateVisibilityCondition(condition, { status: 'draft' })).toBe(false);
  });

  it('evaluates gt operator correctly', () => {
    const condition = JSON.stringify({ expression: '{{count}}', operator: 'gt', value: 5 });
    expect(evaluateVisibilityCondition(condition, { count: 10 })).toBe(true);
    expect(evaluateVisibilityCondition(condition, { count: 3 })).toBe(false);
  });

  it('evaluates gte operator correctly', () => {
    const condition = JSON.stringify({ expression: '{{count}}', operator: 'gte', value: 5 });
    expect(evaluateVisibilityCondition(condition, { count: 5 })).toBe(true);
    expect(evaluateVisibilityCondition(condition, { count: 4 })).toBe(false);
  });

  it('evaluates lt operator correctly', () => {
    const condition = JSON.stringify({ expression: '{{count}}', operator: 'lt', value: 5 });
    expect(evaluateVisibilityCondition(condition, { count: 3 })).toBe(true);
    expect(evaluateVisibilityCondition(condition, { count: 5 })).toBe(false);
  });

  it('evaluates lte operator correctly', () => {
    const condition = JSON.stringify({ expression: '{{count}}', operator: 'lte', value: 5 });
    expect(evaluateVisibilityCondition(condition, { count: 5 })).toBe(true);
    expect(evaluateVisibilityCondition(condition, { count: 6 })).toBe(false);
  });

  it('evaluates empty operator correctly', () => {
    const condition = JSON.stringify({ expression: '{{name}}', operator: 'empty' });
    expect(evaluateVisibilityCondition(condition, { name: '' })).toBe(true);
    expect(evaluateVisibilityCondition(condition, { name: 'John' })).toBe(false);
    // When property is missing, binding engine returns unresolved expression string
    // which is a non-empty string, so empty evaluates to false
    expect(evaluateVisibilityCondition(condition, { name: null })).toBe(true);
  });

  it('evaluates notEmpty operator correctly', () => {
    const condition = JSON.stringify({ expression: '{{name}}', operator: 'notEmpty' });
    expect(evaluateVisibilityCondition(condition, { name: 'John' })).toBe(true);
    expect(evaluateVisibilityCondition(condition, { name: '' })).toBe(false);
  });

  it('resolves nested data paths', () => {
    const condition = JSON.stringify({ expression: '{{data.user.active}}', operator: 'truthy' });
    expect(evaluateVisibilityCondition(condition, { data: { user: { active: true } } })).toBe(true);
    expect(evaluateVisibilityCondition(condition, { data: { user: { active: false } } })).toBe(false);
  });
});

describe('stripInvisibleComponents', () => {
  const trueCondition = JSON.stringify({ expression: '{{show}}', operator: 'truthy' });
  const falseCondition = JSON.stringify({ expression: '{{show}}', operator: 'falsy' });

  it('keeps components without visibilityCondition', () => {
    const data: Data = {
      root: { props: {} },
      content: [
        { type: 'TextBlock', props: { id: 'text-1', text: 'Hello' } },
      ],
      zones: {},
    };

    const result = stripInvisibleComponents(data, { show: false });
    expect(result.content).toHaveLength(1);
  });

  it('keeps components with empty visibilityCondition', () => {
    const data: Data = {
      root: { props: {} },
      content: [
        { type: 'TextBlock', props: { id: 'text-1', text: 'Hello', visibilityCondition: '' } },
      ],
      zones: {},
    };

    const result = stripInvisibleComponents(data, { show: false });
    expect(result.content).toHaveLength(1);
  });

  it('removes components whose condition evaluates to hidden', () => {
    const data: Data = {
      root: { props: {} },
      content: [
        { type: 'TextBlock', props: { id: 'text-1', text: 'Visible', visibilityCondition: trueCondition } },
        { type: 'TextBlock', props: { id: 'text-2', text: 'Hidden', visibilityCondition: falseCondition } },
      ],
      zones: {},
    };

    const result = stripInvisibleComponents(data, { show: true });
    expect(result.content).toHaveLength(1);
    expect((result.content[0] as { props: { id: string } }).props.id).toBe('text-1');
  });

  it('strips invisible components from zones', () => {
    const data: Data = {
      root: { props: {} },
      content: [
        { type: 'FlexBox', props: { id: 'flex-1' } },
      ],
      zones: {
        'flex-1:flex-1-content': [
          { type: 'TextBlock', props: { id: 'text-1', visibilityCondition: trueCondition } },
          { type: 'TextBlock', props: { id: 'text-2', visibilityCondition: falseCondition } },
        ],
      },
    };

    const result = stripInvisibleComponents(data, { show: true });
    expect(result.zones?.['flex-1:flex-1-content']).toHaveLength(1);
  });

  it('preserves other data properties', () => {
    const data: Data = {
      root: { props: { title: 'My Report' } },
      content: [
        { type: 'TextBlock', props: { id: 'text-1' } },
      ],
      zones: {},
    };

    const result = stripInvisibleComponents(data, {});
    expect(result.root).toEqual(data.root);
  });
});

describe('evaluateStyleConditions', () => {
  it('returns empty object for empty string', () => {
    expect(evaluateStyleConditions('', {})).toEqual({});
  });

  it('returns empty object for invalid JSON', () => {
    expect(evaluateStyleConditions('not-json', {})).toEqual({});
  });

  it('returns empty object for non-array JSON', () => {
    expect(evaluateStyleConditions('{"foo":"bar"}', {})).toEqual({});
  });

  it('applies trueValue when condition is met', () => {
    const conditions = JSON.stringify([{
      targetProperty: 'color',
      expression: '{{status}}',
      operator: 'eq',
      value: 'error',
      trueValue: { mode: 'inline', inline: '#ff0000' },
      falseValue: { mode: 'inline', inline: '#000000' },
    }]);

    const result = evaluateStyleConditions(conditions, { status: 'error' });
    expect(result).toEqual({ color: '#ff0000' });
  });

  it('applies falseValue when condition is not met', () => {
    const conditions = JSON.stringify([{
      targetProperty: 'color',
      expression: '{{status}}',
      operator: 'eq',
      value: 'error',
      trueValue: { mode: 'inline', inline: '#ff0000' },
      falseValue: { mode: 'inline', inline: '#000000' },
    }]);

    const result = evaluateStyleConditions(conditions, { status: 'ok' });
    expect(result).toEqual({ color: '#000000' });
  });

  it('skips condition when no falseValue and condition is not met', () => {
    const conditions = JSON.stringify([{
      targetProperty: 'color',
      expression: '{{status}}',
      operator: 'eq',
      value: 'error',
      trueValue: { mode: 'inline', inline: '#ff0000' },
    }]);

    const result = evaluateStyleConditions(conditions, { status: 'ok' });
    expect(result).toEqual({});
  });

  it('resolves multiple conditions', () => {
    const conditions = JSON.stringify([
      {
        targetProperty: 'color',
        expression: '{{urgent}}',
        operator: 'truthy',
        trueValue: { mode: 'inline', inline: '#ff0000' },
      },
      {
        targetProperty: 'backgroundColor',
        expression: '{{highlighted}}',
        operator: 'truthy',
        trueValue: { mode: 'inline', inline: '#ffff00' },
      },
    ]);

    const result = evaluateStyleConditions(conditions, { urgent: true, highlighted: true });
    expect(result).toEqual({ color: '#ff0000', backgroundColor: '#ffff00' });
  });

  it('resolves token values when tokens are provided', () => {
    const tokens: StyleToken[] = [
      { id: '1', name: 'error-color', label: 'Error', category: 'color', cssProperty: 'color', value: '#dc2626', sortOrder: 0 },
    ];

    const conditions = JSON.stringify([{
      targetProperty: 'color',
      expression: '{{hasError}}',
      operator: 'truthy',
      trueValue: { mode: 'token', token: 'error-color' },
    }]);

    const result = evaluateStyleConditions(conditions, { hasError: true }, tokens);
    expect(result).toEqual({ color: '#dc2626' });
  });
});

describe('resolveStyleConditionsInData', () => {
  it('applies style condition overrides to component props', () => {
    const conditions = JSON.stringify([{
      targetProperty: 'color',
      expression: '{{urgent}}',
      operator: 'truthy',
      trueValue: { mode: 'inline', inline: '#ff0000' },
    }]);

    const data: Data = {
      root: { props: {} },
      content: [
        { type: 'TextBlock', props: { id: 'text-1', color: '#000000', styleConditions: conditions } },
      ],
      zones: {},
    };

    const result = resolveStyleConditionsInData(data, { urgent: true });
    const props = (result.content[0] as { props: Record<string, unknown> }).props;
    expect(props.color).toBe('#ff0000');
  });

  it('leaves props unchanged when no conditions match', () => {
    const conditions = JSON.stringify([{
      targetProperty: 'color',
      expression: '{{urgent}}',
      operator: 'truthy',
      trueValue: { mode: 'inline', inline: '#ff0000' },
    }]);

    const data: Data = {
      root: { props: {} },
      content: [
        { type: 'TextBlock', props: { id: 'text-1', color: '#000000', styleConditions: conditions } },
      ],
      zones: {},
    };

    const result = resolveStyleConditionsInData(data, { urgent: false });
    const props = (result.content[0] as { props: Record<string, unknown> }).props;
    expect(props.color).toBe('#000000');
  });

  it('processes zones as well as content', () => {
    const conditions = JSON.stringify([{
      targetProperty: 'color',
      expression: '{{urgent}}',
      operator: 'truthy',
      trueValue: { mode: 'inline', inline: '#ff0000' },
    }]);

    const data: Data = {
      root: { props: {} },
      content: [{ type: 'FlexBox', props: { id: 'flex-1' } }],
      zones: {
        'flex-1:flex-1-content': [
          { type: 'TextBlock', props: { id: 'text-1', color: '#000000', styleConditions: conditions } },
        ],
      },
    };

    const result = resolveStyleConditionsInData(data, { urgent: true });
    const zoneItems = result.zones?.['flex-1:flex-1-content'] as Array<{ props: Record<string, unknown> }>;
    expect(zoneItems[0].props.color).toBe('#ff0000');
  });
});
