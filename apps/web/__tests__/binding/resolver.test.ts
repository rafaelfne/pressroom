import { describe, it, expect } from 'vitest';
import { resolveExpression } from '@/lib/binding/resolver';
import { parse } from '@/lib/binding/expression-parser';

describe('resolver', () => {
  describe('simple path resolution', () => {
    it('resolves simple property', () => {
      const ast = parse('{{name}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, { name: 'John' });
      expect(result).toBe('John');
    });

    it('resolves nested property', () => {
      const ast = parse('{{user.name}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, {
        user: { name: 'Jane' },
      });
      expect(result).toBe('Jane');
    });

    it('resolves deep nested property', () => {
      const ast = parse('{{a.b.c.d}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, {
        a: { b: { c: { d: 'deep value' } } },
      });
      expect(result).toBe('deep value');
    });

    it('returns undefined for missing property', () => {
      const ast = parse('{{missing}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, { name: 'John' });
      expect(result).toBeUndefined();
    });

    it('returns undefined for missing nested property', () => {
      const ast = parse('{{user.missing}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, { user: {} });
      expect(result).toBeUndefined();
    });
  });

  describe('array resolution', () => {
    it('resolves array by index', () => {
      const ast = parse('{{items[0]}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, {
        items: ['first', 'second'],
      });
      expect(result).toBe('first');
    });

    it('resolves array element property', () => {
      const ast = parse('{{items[1].name}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, {
        items: [{ name: 'A' }, { name: 'B' }],
      });
      expect(result).toBe('B');
    });

    it('resolves nested arrays', () => {
      const ast = parse('{{matrix[0][1]}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, {
        matrix: [
          [1, 2, 3],
          [4, 5, 6],
        ],
      });
      expect(result).toBe(2);
    });

    it('returns undefined for out-of-bounds index', () => {
      const ast = parse('{{items[10]}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, {
        items: ['first'],
      });
      expect(result).toBeUndefined();
    });
  });

  describe('function calls', () => {
    it('resolves function with literal arguments', () => {
      const ast = parse('{{uppercase("hello")}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, {});
      expect(result).toBe('HELLO');
    });

    it('resolves function with path arguments', () => {
      const ast = parse('{{uppercase(name)}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, { name: 'john' });
      expect(result).toBe('JOHN');
    });

    it('resolves function with multiple arguments', () => {
      const ast = parse('{{formatCurrency(total, "USD")}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, { total: 1234.56 });
      expect(result).toBe('$1,234.56');
    });

    it('resolves function with nested path argument', () => {
      const ast = parse('{{uppercase(user.name)}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, {
        user: { name: 'alice' },
      });
      expect(result).toBe('ALICE');
    });

    it('returns undefined for unknown function', () => {
      const ast = parse('{{unknownFunc()}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, {});
      expect(result).toBeUndefined();
    });
  });

  describe('sandbox security', () => {
    it('blocks __proto__ access', () => {
      const ast = parse('{{__proto__}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, { name: 'test' });
      expect(result).toBeUndefined();
    });

    it('blocks prototype access', () => {
      const ast = parse('{{prototype}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, { name: 'test' });
      expect(result).toBeUndefined();
    });

    it('blocks constructor access', () => {
      const ast = parse('{{constructor}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, { name: 'test' });
      expect(result).toBeUndefined();
    });

    it('blocks nested dangerous property access', () => {
      const ast = parse('{{user.__proto__}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, {
        user: { name: 'test' },
      });
      expect(result).toBeUndefined();
    });
  });

  describe('whole-expression returns raw value', () => {
    it('returns array for array path', () => {
      const ast = parse('{{items}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const items = ['a', 'b', 'c'];
      const result = resolveExpression(ast.expression, { items });
      expect(result).toBe(items);
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns number for number path', () => {
      const ast = parse('{{count}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, { count: 42 });
      expect(result).toBe(42);
      expect(typeof result).toBe('number');
    });

    it('returns object for object path', () => {
      const ast = parse('{{user}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const user = { name: 'John', age: 30 };
      const result = resolveExpression(ast.expression, { user });
      expect(result).toBe(user);
      expect(typeof result).toBe('object');
    });

    it('returns boolean for boolean path', () => {
      const ast = parse('{{isActive}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, { isActive: true });
      expect(result).toBe(true);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('graceful fallback', () => {
    it('returns undefined when path resolves through null', () => {
      const ast = parse('{{user.name}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, { user: null });
      expect(result).toBeUndefined();
    });

    it('returns undefined when path resolves through undefined', () => {
      const ast = parse('{{user.name}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, { user: undefined });
      expect(result).toBeUndefined();
    });

    it('returns undefined when array access on non-array', () => {
      const ast = parse('{{value[0]}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');
      
      const result = resolveExpression(ast.expression, { value: 'string' });
      expect(result).toBeUndefined();
    });
  });
});
