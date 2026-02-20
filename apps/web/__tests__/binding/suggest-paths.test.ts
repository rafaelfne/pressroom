import { describe, it, expect } from 'vitest';
import {
  generatePathSuggestions,
  filterSuggestions,
  getFunctionSuggestions,
  filterFunctionSuggestions,
} from '@/lib/binding/suggest-paths';

describe('generatePathSuggestions', () => {
  it('generates paths for flat object', () => {
    const data = { name: 'John', age: 30, active: true };
    const suggestions = generatePathSuggestions(data);

    expect(suggestions).toEqual([
      { path: 'name', type: 'string', depth: 1 },
      { path: 'age', type: 'number', depth: 1 },
      { path: 'active', type: 'boolean', depth: 1 },
    ]);
  });

  it('generates paths for nested objects', () => {
    const data = { customer: { name: 'John', email: 'john@example.com' } };
    const suggestions = generatePathSuggestions(data);

    expect(suggestions).toEqual([
      { path: 'customer', type: 'object', depth: 1 },
      { path: 'customer.name', type: 'string', depth: 2 },
      { path: 'customer.email', type: 'string', depth: 2 },
    ]);
  });

  it('generates paths for arrays with item count', () => {
    const data = {
      items: [
        { name: 'Product A', price: 29.99 },
        { name: 'Product B', price: 49.99 },
        { name: 'Product C', price: 19.99 },
      ],
    };
    const suggestions = generatePathSuggestions(data);

    expect(suggestions).toContainEqual({
      path: 'items',
      type: 'array[3]',
      depth: 1,
    });
    expect(suggestions).toContainEqual({
      path: 'items[0]',
      type: 'object',
      depth: 2,
    });
    expect(suggestions).toContainEqual({
      path: 'items[0].name',
      type: 'string',
      depth: 3,
    });
    expect(suggestions).toContainEqual({
      path: 'items[0].price',
      type: 'number',
      depth: 3,
    });
  });

  it('handles empty arrays', () => {
    const data = { items: [] };
    const suggestions = generatePathSuggestions(data);

    expect(suggestions).toEqual([
      { path: 'items', type: 'array[0]', depth: 1 },
    ]);
  });

  it('handles null values', () => {
    const data = { value: null };
    const suggestions = generatePathSuggestions(data);

    expect(suggestions).toEqual([
      { path: 'value', type: 'null', depth: 1 },
    ]);
  });

  it('handles undefined values', () => {
    const data = { value: undefined };
    const suggestions = generatePathSuggestions(data);

    expect(suggestions).toEqual([
      { path: 'value', type: 'null', depth: 1 },
    ]);
  });

  it('blocks dangerous properties', () => {
    const data = {
      name: 'safe',
      __proto__: { evil: true },
      constructor: 'bad',
      prototype: { also: 'bad' },
    };
    const suggestions = generatePathSuggestions(data);
    const paths = suggestions.map((s) => s.path);

    expect(paths).toContain('name');
    expect(paths).not.toContain('__proto__');
    expect(paths).not.toContain('constructor');
    expect(paths).not.toContain('prototype');
  });

  it('respects maxDepth parameter', () => {
    const data = {
      a: { b: { c: { d: { e: 'deep' } } } },
    };
    const suggestions = generatePathSuggestions(data, 2);
    const paths = suggestions.map((s) => s.path);

    expect(paths).toContain('a');
    expect(paths).toContain('a.b');
    expect(paths).not.toContain('a.b.c');
  });

  it('handles complex nested data with arrays and objects', () => {
    const data = {
      company: {
        name: 'Acme Corp',
        employees: [{ name: 'John', salary: 50000 }],
      },
      total: 100000,
    };
    const suggestions = generatePathSuggestions(data);
    const paths = suggestions.map((s) => s.path);

    expect(paths).toContain('company');
    expect(paths).toContain('company.name');
    expect(paths).toContain('company.employees');
    expect(paths).toContain('company.employees[0]');
    expect(paths).toContain('company.employees[0].name');
    expect(paths).toContain('company.employees[0].salary');
    expect(paths).toContain('total');
  });

  it('returns empty array for non-object data', () => {
    expect(generatePathSuggestions('string')).toEqual([]);
    expect(generatePathSuggestions(42)).toEqual([]);
    expect(generatePathSuggestions(true)).toEqual([]);
    expect(generatePathSuggestions(null)).toEqual([]);
    expect(generatePathSuggestions(undefined)).toEqual([]);
  });

  it('handles arrays of primitives', () => {
    const data = { tags: ['red', 'green', 'blue'] };
    const suggestions = generatePathSuggestions(data);

    expect(suggestions).toContainEqual({
      path: 'tags',
      type: 'array[3]',
      depth: 1,
    });
    expect(suggestions).toContainEqual({
      path: 'tags[0]',
      type: 'string',
      depth: 2,
    });
  });

  it('handles circular references without infinite loop', () => {
    const data: Record<string, unknown> = { name: 'test' };
    data.self = data;

    const suggestions = generatePathSuggestions(data);
    const paths = suggestions.map((s) => s.path);

    expect(paths).toContain('name');
    // self is visited but circular, so no further traversal
  });
});

describe('filterSuggestions', () => {
  const suggestions = [
    { path: 'customer', type: 'object', depth: 1 },
    { path: 'customer.name', type: 'string', depth: 2 },
    { path: 'customer.email', type: 'string', depth: 2 },
    { path: 'items', type: 'array[3]', depth: 1 },
    { path: 'items[0].name', type: 'string', depth: 3 },
    { path: 'total', type: 'number', depth: 1 },
  ];

  it('returns all suggestions for empty query', () => {
    expect(filterSuggestions(suggestions, '')).toEqual(suggestions);
  });

  it('filters by partial path (case-insensitive)', () => {
    const result = filterSuggestions(suggestions, 'cu');
    expect(result).toHaveLength(3);
    expect(result.map((s) => s.path)).toEqual([
      'customer',
      'customer.name',
      'customer.email',
    ]);
  });

  it('filters case-insensitively', () => {
    const result = filterSuggestions(suggestions, 'CUSTOMER');
    expect(result).toHaveLength(3);
  });

  it('returns empty array when no match', () => {
    const result = filterSuggestions(suggestions, 'nonexistent');
    expect(result).toEqual([]);
  });

  it('matches mid-path segments', () => {
    const result = filterSuggestions(suggestions, 'name');
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.path)).toEqual([
      'customer.name',
      'items[0].name',
    ]);
  });
});

describe('getFunctionSuggestions', () => {
  it('returns all 16 built-in functions', () => {
    const suggestions = getFunctionSuggestions();
    expect(suggestions).toHaveLength(16);
  });

  it('includes formatCurrency with correct signature', () => {
    const suggestions = getFunctionSuggestions();
    const fn = suggestions.find((s) => s.name === 'formatCurrency');

    expect(fn).toBeDefined();
    expect(fn?.signature).toBe("formatCurrency(value, 'BRL'|'USD'|'EUR'|'GBP')");
    expect(fn?.description).toBe('Format number as currency');
  });

  it('includes formatDate with correct signature', () => {
    const suggestions = getFunctionSuggestions();
    const fn = suggestions.find((s) => s.name === 'formatDate');

    expect(fn).toBeDefined();
    expect(fn?.signature).toBe(
      "formatDate(value, 'YYYY-MM-DD'|'MM/DD/YYYY'|'DD/MM/YYYY'|'MMM/yy'|'MM/yyyy')",
    );
  });

  it('includes all expected function names', () => {
    const suggestions = getFunctionSuggestions();
    const names = suggestions.map((s) => s.name);

    expect(names).toEqual([
      'formatCurrency',
      'formatDate',
      'formatNumber',
      'if',
      'uppercase',
      'lowercase',
      'join',
      'currency',
      'percent',
      'abs',
      'date',
      'number',
      'cpf',
      'sign',
      'ifEmpty',
      'multiply',
    ]);
  });
});

describe('filterFunctionSuggestions', () => {
  it('returns all for empty query', () => {
    const suggestions = getFunctionSuggestions();
    expect(filterFunctionSuggestions(suggestions, '')).toEqual(suggestions);
  });

  it('filters by name', () => {
    const suggestions = getFunctionSuggestions();
    const result = filterFunctionSuggestions(suggestions, 'format');

    // Matches name or description containing 'format'
    const names = result.map((s) => s.name);
    expect(names).toContain('formatCurrency');
    expect(names).toContain('formatDate');
    expect(names).toContain('formatNumber');
  });

  it('filters by description', () => {
    const suggestions = getFunctionSuggestions();
    const result = filterFunctionSuggestions(suggestions, 'currency');

    // Matches formatCurrency (name) and currency (name and description)
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.name)).toContain('formatCurrency');
    expect(result.map((s) => s.name)).toContain('currency');
  });

  it('filters case-insensitively', () => {
    const suggestions = getFunctionSuggestions();
    const result = filterFunctionSuggestions(suggestions, 'UPPERCASE');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('uppercase');
  });
});
