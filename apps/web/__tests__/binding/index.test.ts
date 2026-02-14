import { describe, it, expect } from 'vitest';
import { resolveBindings } from '@/lib/binding';

describe('resolveBindings', () => {
  describe('simple template resolution', () => {
    it('resolves simple string expression', () => {
      const result = resolveBindings('Hello {{name}}!', { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('resolves multiple expressions in string', () => {
      const result = resolveBindings('{{first}} {{last}}', {
        first: 'John',
        last: 'Doe',
      });
      expect(result).toBe('John Doe');
    });

    it('leaves plain text unchanged', () => {
      const result = resolveBindings('Hello World', {});
      expect(result).toBe('Hello World');
    });

    it('handles missing data with fallback to original expression', () => {
      const result = resolveBindings('Hello {{name}}!', {});
      expect(result).toBe('Hello {{name}}!');
    });
  });

  describe('object template resolution', () => {
    it('resolves object properties', () => {
      const template = {
        title: '{{pageTitle}}',
        content: 'Hello {{name}}!',
      };
      const result = resolveBindings(template, {
        pageTitle: 'My Page',
        name: 'User',
      });
      expect(result).toEqual({
        title: 'My Page',
        content: 'Hello User!',
      });
    });

    it('resolves nested objects', () => {
      const template = {
        user: {
          greeting: 'Hello {{name}}!',
          role: '{{role}}',
        },
      };
      const result = resolveBindings(template, {
        name: 'Alice',
        role: 'Admin',
      });
      expect(result).toEqual({
        user: {
          greeting: 'Hello Alice!',
          role: 'Admin',
        },
      });
    });

    it('resolves deeply nested objects', () => {
      const template = {
        level1: {
          level2: {
            level3: {
              message: '{{deep}}',
            },
          },
        },
      };
      const result = resolveBindings(template, { deep: 'Found it!' });
      expect(result).toEqual({
        level1: {
          level2: {
            level3: {
              message: 'Found it!',
            },
          },
        },
      });
    });
  });

  describe('array template resolution', () => {
    it('resolves array elements', () => {
      const template = ['{{first}}', '{{second}}', '{{third}}'];
      const result = resolveBindings(template, {
        first: 'A',
        second: 'B',
        third: 'C',
      });
      expect(result).toEqual(['A', 'B', 'C']);
    });

    it('resolves arrays within objects', () => {
      const template = {
        items: ['{{item1}}', '{{item2}}'],
      };
      const result = resolveBindings(template, {
        item1: 'First',
        item2: 'Second',
      });
      expect(result).toEqual({
        items: ['First', 'Second'],
      });
    });

    it('resolves objects within arrays', () => {
      const template = [
        { name: '{{name1}}' },
        { name: '{{name2}}' },
      ];
      const result = resolveBindings(template, {
        name1: 'Alice',
        name2: 'Bob',
      });
      expect(result).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
    });
  });

  describe('raw value return for whole-expression', () => {
    it('returns raw array when expression is entire string', () => {
      const result = resolveBindings('{{items}}', {
        items: ['a', 'b', 'c'],
      });
      expect(result).toEqual(['a', 'b', 'c']);
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns raw number when expression is entire string', () => {
      const result = resolveBindings('{{count}}', { count: 42 });
      expect(result).toBe(42);
      expect(typeof result).toBe('number');
    });

    it('returns raw object when expression is entire string', () => {
      const obj = { name: 'John', age: 30 };
      const result = resolveBindings('{{user}}', { user: obj });
      expect(result).toEqual(obj);
    });

    it('returns raw boolean when expression is entire string', () => {
      const result = resolveBindings('{{isActive}}', { isActive: true });
      expect(result).toBe(true);
      expect(typeof result).toBe('boolean');
    });

    it('stringifies when mixed with text', () => {
      const result = resolveBindings('Count: {{count}}', { count: 42 });
      expect(result).toBe('Count: 42');
      expect(typeof result).toBe('string');
    });
  });

  describe('mixed text and expression', () => {
    it('concatenates text and resolved values', () => {
      const result = resolveBindings('Total: {{total}} items', { total: 5 });
      expect(result).toBe('Total: 5 items');
    });

    it('handles multiple expressions with text', () => {
      const result = resolveBindings('Name: {{first}} {{last}}, Age: {{age}}', {
        first: 'John',
        last: 'Doe',
        age: 30,
      });
      expect(result).toBe('Name: John Doe, Age: 30');
    });
  });

  describe('function expressions', () => {
    it('resolves function calls in strings', () => {
      const result = resolveBindings('{{uppercase(name)}}', { name: 'hello' });
      expect(result).toBe('HELLO');
    });

    it('resolves functions in object properties', () => {
      const template = {
        currency: '{{formatCurrency(amount, "USD")}}',
      };
      const result = resolveBindings(template, { amount: 1234.56 });
      expect(result).toEqual({
        currency: '$1,234.56',
      });
    });

    it('resolves nested path in function arguments', () => {
      const result = resolveBindings('{{uppercase(user.name)}}', {
        user: { name: 'alice' },
      });
      expect(result).toBe('ALICE');
    });
  });

  describe('complex template resolution', () => {
    it('resolves Puck-like template structure', () => {
      const template = {
        content: [
          {
            type: 'TextBlock',
            props: {
              text: '{{message}}',
            },
          },
          {
            type: 'DataTable',
            props: {
              dataSource: '{{items}}',
              title: 'Items: {{itemCount}}',
            },
          },
        ],
        root: {
          title: '{{pageTitle}}',
        },
      };

      const result = resolveBindings(template, {
        message: 'Welcome!',
        items: [{ id: 1 }, { id: 2 }],
        itemCount: 2,
        pageTitle: 'Dashboard',
      });

      expect(result).toEqual({
        content: [
          {
            type: 'TextBlock',
            props: {
              text: 'Welcome!',
            },
          },
          {
            type: 'DataTable',
            props: {
              dataSource: [{ id: 1 }, { id: 2 }],
              title: 'Items: 2',
            },
          },
        ],
        root: {
          title: 'Dashboard',
        },
      });
    });
  });

  describe('primitives and edge cases', () => {
    it('leaves numbers unchanged', () => {
      const result = resolveBindings(42, {});
      expect(result).toBe(42);
    });

    it('leaves booleans unchanged', () => {
      const result = resolveBindings(true, {});
      expect(result).toBe(true);
    });

    it('leaves null unchanged', () => {
      const result = resolveBindings(null, {});
      expect(result).toBe(null);
    });

    it('leaves undefined unchanged', () => {
      const result = resolveBindings(undefined, {});
      expect(result).toBe(undefined);
    });

    it('handles empty object', () => {
      const result = resolveBindings({}, { name: 'Test' });
      expect(result).toEqual({});
    });

    it('handles empty array', () => {
      const result = resolveBindings([], { name: 'Test' });
      expect(result).toEqual([]);
    });
  });

  describe('performance', () => {
    it('resolves 1000 expressions in under 100ms', () => {
      const template: Record<string, string> = {};
      const data: Record<string, string> = {};

      // Create 1000 properties with expressions
      for (let i = 0; i < 1000; i++) {
        template[`prop${i}`] = `{{value${i}}}`;
        data[`value${i}`] = `Value ${i}`;
      }

      const startTime = performance.now();
      const result = resolveBindings(template, data);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100);

      // Verify correctness
      expect(result).toHaveProperty('prop0', 'Value 0');
      expect(result).toHaveProperty('prop999', 'Value 999');
    });
  });

  describe('nested data access', () => {
    it('resolves nested data paths', () => {
      const result = resolveBindings('{{user.profile.name}}', {
        user: {
          profile: {
            name: 'Jane',
          },
        },
      });
      expect(result).toBe('Jane');
    });

    it('resolves array element access', () => {
      const result = resolveBindings('{{users[0].name}}', {
        users: [{ name: 'Alice' }, { name: 'Bob' }],
      });
      expect(result).toBe('Alice');
    });

    it('resolves complex nested structures', () => {
      const template = {
        user: '{{data.users[0].name}}',
        total: '{{data.metrics.total}}',
      };
      const result = resolveBindings(template, {
        data: {
          users: [{ name: 'Charlie' }],
          metrics: { total: 100 },
        },
      });
      expect(result).toEqual({
        user: 'Charlie',
        total: 100,
      });
    });
  });
});
