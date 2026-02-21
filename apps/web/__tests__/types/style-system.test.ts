import { describe, it, expect } from 'vitest';
import {
  resolveStylableValue,
  resolveSpacing,
  evaluateCondition,
  type StylableValue,
  type SpacingValue,
  type StyleToken,
} from '@/lib/types/style-system';

describe('resolveStylableValue', () => {
  const mockTokens: StyleToken[] = [
    {
      id: '1',
      name: 'primary-color',
      label: 'Primary Color',
      category: 'color',
      cssProperty: 'color',
      value: '#0066cc',
      sortOrder: 0,
    },
    {
      id: '2',
      name: 'spacing-md',
      label: 'Medium Spacing',
      category: 'spacing',
      cssProperty: 'padding',
      value: '16px',
      sortOrder: 0,
    },
  ];

  it('returns undefined for undefined input', () => {
    const result = resolveStylableValue(undefined, mockTokens);
    expect(result).toBeUndefined();
  });

  it('returns string directly when input is string', () => {
    const result = resolveStylableValue('#ff0000', mockTokens);
    expect(result).toBe('#ff0000');
  });

  it('returns inline value when mode is inline', () => {
    const value: StylableValue = {
      mode: 'inline',
      inline: '#00ff00',
    };
    const result = resolveStylableValue(value, mockTokens);
    expect(result).toBe('#00ff00');
  });

  it('returns token value when mode is token and tokens provided', () => {
    const value: StylableValue = {
      mode: 'token',
      token: 'primary-color',
    };
    const result = resolveStylableValue(value, mockTokens);
    expect(result).toBe('#0066cc');
  });

  it('returns undefined when token not found', () => {
    const value: StylableValue = {
      mode: 'token',
      token: 'non-existent',
    };
    const result = resolveStylableValue(value, mockTokens);
    expect(result).toBeUndefined();
  });

  it('returns undefined when no tokens provided for token mode', () => {
    const value: StylableValue = {
      mode: 'token',
      token: 'primary-color',
    };
    const result = resolveStylableValue(value, undefined);
    expect(result).toBeUndefined();
  });
});

describe('resolveSpacing', () => {
  it('returns undefined for undefined input', () => {
    const result = resolveSpacing(undefined);
    expect(result).toBeUndefined();
  });

  it('returns string directly when input is string', () => {
    const result = resolveSpacing('16px');
    expect(result).toBe('16px');
  });

  it('returns all value when mode is all', () => {
    const spacing: SpacingValue = {
      mode: 'all',
      all: '20px',
    };
    const result = resolveSpacing(spacing);
    expect(result).toBe('20px');
  });

  it('returns CSS shorthand when mode is individual', () => {
    const spacing: SpacingValue = {
      mode: 'individual',
      top: '8px',
      right: '12px',
      bottom: '16px',
      left: '12px',
    };
    const result = resolveSpacing(spacing);
    expect(result).toBe('8px 12px 16px 12px');
  });

  it('fills missing sides with 0 in individual mode', () => {
    const spacing: SpacingValue = {
      mode: 'individual',
      top: '8px',
      right: '12px',
    };
    const result = resolveSpacing(spacing);
    expect(result).toBe('8px 12px 0 0');
  });
});

describe('evaluateCondition', () => {
  it('eq: returns true for matching values', () => {
    expect(evaluateCondition('test', 'eq', 'test')).toBe(true);
    expect(evaluateCondition('test', 'eq', 'other')).toBe(false);
    expect(evaluateCondition(42, 'eq', 42)).toBe(true);
    expect(evaluateCondition(42, 'eq', 43)).toBe(false);
  });

  it('neq: returns true for non-matching values', () => {
    expect(evaluateCondition('test', 'neq', 'other')).toBe(true);
    expect(evaluateCondition('test', 'neq', 'test')).toBe(false);
    expect(evaluateCondition(42, 'neq', 43)).toBe(true);
    expect(evaluateCondition(42, 'neq', 42)).toBe(false);
  });

  it('gt: returns true when resolvedValue > compareValue (numbers)', () => {
    expect(evaluateCondition(10, 'gt', 5)).toBe(true);
    expect(evaluateCondition(5, 'gt', 10)).toBe(false);
    expect(evaluateCondition(5, 'gt', 5)).toBe(false);
  });

  it('lt: returns true when resolvedValue < compareValue (numbers)', () => {
    expect(evaluateCondition(5, 'lt', 10)).toBe(true);
    expect(evaluateCondition(10, 'lt', 5)).toBe(false);
    expect(evaluateCondition(5, 'lt', 5)).toBe(false);
  });

  it('gte: returns true when resolvedValue >= compareValue', () => {
    expect(evaluateCondition(10, 'gte', 5)).toBe(true);
    expect(evaluateCondition(5, 'gte', 5)).toBe(true);
    expect(evaluateCondition(3, 'gte', 5)).toBe(false);
  });

  it('lte: returns true when resolvedValue <= compareValue', () => {
    expect(evaluateCondition(5, 'lte', 10)).toBe(true);
    expect(evaluateCondition(5, 'lte', 5)).toBe(true);
    expect(evaluateCondition(10, 'lte', 5)).toBe(false);
  });

  it('empty: returns true for null, undefined, empty string, empty array', () => {
    expect(evaluateCondition(null, 'empty')).toBe(true);
    expect(evaluateCondition(undefined, 'empty')).toBe(true);
    expect(evaluateCondition('', 'empty')).toBe(true);
    expect(evaluateCondition('   ', 'empty')).toBe(true);
    expect(evaluateCondition([], 'empty')).toBe(true);
    expect(evaluateCondition('test', 'empty')).toBe(false);
    expect(evaluateCondition(['item'], 'empty')).toBe(false);
  });

  it('notEmpty: returns true for non-null, non-empty values', () => {
    expect(evaluateCondition('test', 'notEmpty')).toBe(true);
    expect(evaluateCondition(['item'], 'notEmpty')).toBe(true);
    expect(evaluateCondition(42, 'notEmpty')).toBe(true);
    expect(evaluateCondition(null, 'notEmpty')).toBe(false);
    expect(evaluateCondition(undefined, 'notEmpty')).toBe(false);
    expect(evaluateCondition('', 'notEmpty')).toBe(false);
    expect(evaluateCondition('   ', 'notEmpty')).toBe(false);
    expect(evaluateCondition([], 'notEmpty')).toBe(false);
  });

  it('truthy: returns true for truthy values', () => {
    expect(evaluateCondition(true, 'truthy')).toBe(true);
    expect(evaluateCondition('text', 'truthy')).toBe(true);
    expect(evaluateCondition(42, 'truthy')).toBe(true);
    expect(evaluateCondition(['item'], 'truthy')).toBe(true);
    expect(evaluateCondition(false, 'truthy')).toBe(false);
    expect(evaluateCondition(0, 'truthy')).toBe(false);
    expect(evaluateCondition('', 'truthy')).toBe(false);
    expect(evaluateCondition(null, 'truthy')).toBe(false);
    expect(evaluateCondition(undefined, 'truthy')).toBe(false);
  });

  it('falsy: returns true for falsy values', () => {
    expect(evaluateCondition(false, 'falsy')).toBe(true);
    expect(evaluateCondition(0, 'falsy')).toBe(true);
    expect(evaluateCondition('', 'falsy')).toBe(true);
    expect(evaluateCondition(null, 'falsy')).toBe(true);
    expect(evaluateCondition(undefined, 'falsy')).toBe(true);
    expect(evaluateCondition(true, 'falsy')).toBe(false);
    expect(evaluateCondition('text', 'falsy')).toBe(false);
    expect(evaluateCondition(42, 'falsy')).toBe(false);
  });

  it('returns false for gt/lt with non-number types', () => {
    expect(evaluateCondition('10', 'gt', '5')).toBe(false);
    expect(evaluateCondition('5', 'lt', '10')).toBe(false);
    expect(evaluateCondition(10, 'gt', '5')).toBe(false);
    expect(evaluateCondition('10', 'lt', 5)).toBe(false);
  });
});
