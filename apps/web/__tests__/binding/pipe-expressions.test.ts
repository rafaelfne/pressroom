import { describe, it, expect } from 'vitest';
import { parse } from '@/lib/binding/expression-parser';
import { resolveExpression } from '@/lib/binding/resolver';

describe('pipe expressions', () => {
  describe('parser', () => {
    it('parses simple pipe without arguments', () => {
      const result = parse('{{value | uppercase}}');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'pipe',
          value: {
            type: 'path',
            segments: [{ type: 'property', name: 'value' }],
          },
          pipes: [
            {
              name: 'uppercase',
              args: [],
            },
          ],
        },
      });
    });

    it('parses pipe with string argument', () => {
      const result = parse('{{value | currency:"BRL"}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'pipe',
          value: {
            type: 'path',
            segments: [{ type: 'property', name: 'value' }],
          },
          pipes: [
            {
              name: 'currency',
              args: [{ type: 'string', value: 'BRL' }],
            },
          ],
        },
      });
    });

    it('parses pipe with single-quoted string argument', () => {
      const result = parse("{{value | currency:'EUR'}}");
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'pipe',
          pipes: [
            {
              name: 'currency',
              args: [{ type: 'string', value: 'EUR' }],
            },
          ],
        },
      });
    });

    it('parses pipe with numeric argument', () => {
      const result = parse('{{value | percent:4}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'pipe',
          pipes: [
            {
              name: 'percent',
              args: [{ type: 'number', value: 4 }],
            },
          ],
        },
      });
    });

    it('parses chained pipes', () => {
      const result = parse('{{value | abs | percent}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'pipe',
          value: {
            type: 'path',
            segments: [{ type: 'property', name: 'value' }],
          },
          pipes: [
            { name: 'abs', args: [] },
            { name: 'percent', args: [] },
          ],
        },
      });
    });

    it('parses multiple chained pipes with arguments', () => {
      const result = parse('{{value | currency:"USD" | uppercase}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'pipe',
          pipes: [
            { name: 'currency', args: [{ type: 'string', value: 'USD' }] },
            { name: 'uppercase', args: [] },
          ],
        },
      });
    });

    it('parses pipe with nested path', () => {
      const result = parse('{{user.name | uppercase}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'pipe',
          value: {
            type: 'path',
            segments: [
              { type: 'property', name: 'user' },
              { type: 'property', name: 'name' },
            ],
          },
          pipes: [{ name: 'uppercase', args: [] }],
        },
      });
    });

    it('parses pipe with array access', () => {
      const result = parse('{{items[0].price | currency:"USD"}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'pipe',
          value: {
            type: 'path',
            segments: [
              { type: 'property', name: 'items' },
              { type: 'index', value: 0 },
              { type: 'property', name: 'price' },
            ],
          },
          pipes: [
            { name: 'currency', args: [{ type: 'string', value: 'USD' }] },
          ],
        },
      });
    });

    it('parses pipe with whitespace variations', () => {
      const result = parse('{{ value  |  uppercase }}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'pipe',
          value: {
            type: 'path',
            segments: [{ type: 'property', name: 'value' }],
          },
          pipes: [{ name: 'uppercase', args: [] }],
        },
      });
    });

    it('does not parse pipe inside function call as pipe expression', () => {
      const result = parse('{{myFunc("value | test")}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'function',
          name: 'myFunc',
          args: [{ type: 'string', value: 'value | test' }],
        },
      });
    });
  });

  describe('resolver', () => {
    it('resolves simple pipe without arguments', () => {
      const ast = parse('{{value | uppercase}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');

      const result = resolveExpression(ast.expression, { value: 'hello' });
      expect(result).toBe('HELLO');
    });

    it('resolves pipe with string argument', () => {
      const ast = parse('{{value | currency:"BRL"}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');

      const result = resolveExpression(ast.expression, { value: 1234.56 });
      // Note: Intl.NumberFormat uses non-breaking space (char 160)
      expect(result).toMatch(/R\$\s1\.234,56/);
    });

    it('resolves pipe with numeric argument', () => {
      const ast = parse('{{value | percent:4}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');

      const result = resolveExpression(ast.expression, { value: 0.1234 });
      expect(result).toBe('12.3400%');
    });

    it('resolves chained pipes', () => {
      const ast = parse('{{value | abs | percent}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');

      const result = resolveExpression(ast.expression, { value: -0.45 });
      expect(result).toBe('45.00%');
    });

    it('resolves multiple chained pipes with arguments', () => {
      const ast = parse('{{value | currency:"USD" | uppercase}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');

      const result = resolveExpression(ast.expression, { value: 99.99 });
      expect(result).toBe('$99.99');
    });

    it('resolves pipe with nested path', () => {
      const ast = parse('{{user.name | uppercase}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');

      const result = resolveExpression(ast.expression, {
        user: { name: 'alice' },
      });
      expect(result).toBe('ALICE');
    });

    it('resolves pipe with array access', () => {
      const ast = parse('{{items[0].price | currency:"USD"}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');

      const result = resolveExpression(ast.expression, {
        items: [{ price: 29.99 }],
      });
      expect(result).toBe('$29.99');
    });

    it('resolves pipe with default argument value', () => {
      const ast = parse('{{value | percent}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');

      const result = resolveExpression(ast.expression, { value: 0.25 });
      expect(result).toBe('25.00%');
    });

    it('returns undefined for unknown pipe function', () => {
      const ast = parse('{{value | unknownPipe}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');

      const result = resolveExpression(ast.expression, { value: 'test' });
      expect(result).toBeUndefined();
    });

    it('handles pipe on undefined value gracefully', () => {
      const ast = parse('{{missing | uppercase}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');

      const result = resolveExpression(ast.expression, {});
      // uppercase converts undefined to empty string
      expect(result).toBe('');
    });

    it('pipes work with formatNumber', () => {
      const ast = parse('{{value | formatNumber:3}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');

      const result = resolveExpression(ast.expression, { value: 1234.5678 });
      expect(result).toBe('1,234.568');
    });

    it('resolves complex chain: abs -> multiply -> percent', () => {
      const ast = parse('{{value | abs | percent:0}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');

      const result = resolveExpression(ast.expression, { value: -0.567 });
      expect(result).toBe('57%');
    });
  });

  describe('backward compatibility', () => {
    it('still resolves function call syntax', () => {
      const ast = parse('{{formatCurrency(total, "BRL")}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');

      const result = resolveExpression(ast.expression, { total: 1234.56 });
      // Note: Intl.NumberFormat uses non-breaking space (char 160)
      expect(result).toMatch(/R\$\s1\.234,56/);
    });

    it('still resolves nested function calls', () => {
      const ast = parse('{{uppercase("hello")}}')[0];
      if (ast.type !== 'expression') throw new Error('Expected expression');

      const result = resolveExpression(ast.expression, {});
      expect(result).toBe('HELLO');
    });

    it('function call takes precedence over pipe syntax', () => {
      // This should be parsed as a function call, not a pipe
      const result = parse('{{func(a, b)}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'function',
          name: 'func',
        },
      });
    });
  });

  describe('edge cases', () => {
    it('handles pipe with no spaces', () => {
      const result = parse('{{value|uppercase}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'pipe',
          pipes: [{ name: 'uppercase' }],
        },
      });
    });

    it('handles multiple pipes with varying whitespace', () => {
      const result = parse('{{value| abs |percent:2}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'pipe',
          pipes: [{ name: 'abs' }, { name: 'percent', args: [{ type: 'number', value: 2 }] }],
        },
      });
    });

    it('handles escaped quotes in pipe arguments', () => {
      const result = parse('{{value | func:"test\\"quote"}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'pipe',
          pipes: [
            {
              name: 'func',
              args: [{ type: 'string', value: 'test"quote' }],
            },
          ],
        },
      });
    });
  });

  describe('mixed content', () => {
    it('parses text with pipe expression', () => {
      const result = parse('Total: {{amount | currency:"USD"}}');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ type: 'literal', value: 'Total: ' });
      expect(result[1].type).toBe('expression');
    });

    it('parses multiple pipe expressions in text', () => {
      const result = parse('{{first | uppercase}} and {{second | lowercase}}');
      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('expression');
      expect(result[1]).toEqual({ type: 'literal', value: ' and ' });
      expect(result[2].type).toBe('expression');
    });
  });
});
