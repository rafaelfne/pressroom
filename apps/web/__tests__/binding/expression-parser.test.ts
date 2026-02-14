import { describe, it, expect } from 'vitest';
import { parse } from '@/lib/binding/expression-parser';

describe('expression-parser', () => {
  describe('plain text', () => {
    it('parses plain text with no expressions', () => {
      const result = parse('Hello World');
      expect(result).toEqual([{ type: 'literal', value: 'Hello World' }]);
    });

    it('parses empty string', () => {
      const result = parse('');
      expect(result).toEqual([]);
    });
  });

  describe('single expression', () => {
    it('parses single simple expression', () => {
      const result = parse('{{name}}');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'path',
          segments: [{ type: 'property', name: 'name' }],
        },
      });
    });

    it('parses expression with whitespace', () => {
      const result = parse('{{ name }}');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'path',
          segments: [{ type: 'property', name: 'name' }],
        },
      });
    });

    it('handles empty expression', () => {
      const result = parse('{{}}');
      expect(result).toHaveLength(0);
    });
  });

  describe('mixed text and expressions', () => {
    it('parses text before expression', () => {
      const result = parse('Hello {{name}}');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ type: 'literal', value: 'Hello ' });
      expect(result[1].type).toBe('expression');
    });

    it('parses text after expression', () => {
      const result = parse('{{name}} is here');
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('expression');
      expect(result[1]).toEqual({ type: 'literal', value: ' is here' });
    });

    it('parses text around expression', () => {
      const result = parse('Hello {{name}}!');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ type: 'literal', value: 'Hello ' });
      expect(result[1].type).toBe('expression');
      expect(result[2]).toEqual({ type: 'literal', value: '!' });
    });

    it('parses multiple expressions', () => {
      const result = parse('{{first}} {{last}}');
      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('expression');
      expect(result[1]).toEqual({ type: 'literal', value: ' ' });
      expect(result[2].type).toBe('expression');
    });
  });

  describe('path expressions', () => {
    it('parses nested property access', () => {
      const result = parse('{{user.name}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'path',
          segments: [
            { type: 'property', name: 'user' },
            { type: 'property', name: 'name' },
          ],
        },
      });
    });

    it('parses deep nested paths', () => {
      const result = parse('{{a.b.c.d}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'path',
          segments: [
            { type: 'property', name: 'a' },
            { type: 'property', name: 'b' },
            { type: 'property', name: 'c' },
            { type: 'property', name: 'd' },
          ],
        },
      });
    });

    it('parses array index access', () => {
      const result = parse('{{items[0]}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'path',
          segments: [
            { type: 'property', name: 'items' },
            { type: 'index', value: 0 },
          ],
        },
      });
    });

    it('parses array index with property access', () => {
      const result = parse('{{items[0].name}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'path',
          segments: [
            { type: 'property', name: 'items' },
            { type: 'index', value: 0 },
            { type: 'property', name: 'name' },
          ],
        },
      });
    });

    it('parses multiple array indices', () => {
      const result = parse('{{matrix[0][1]}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'path',
          segments: [
            { type: 'property', name: 'matrix' },
            { type: 'index', value: 0 },
            { type: 'index', value: 1 },
          ],
        },
      });
    });
  });

  describe('function calls', () => {
    it('parses function with no arguments', () => {
      const result = parse('{{now()}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'function',
          name: 'now',
          args: [],
        },
      });
    });

    it('parses function with string literal', () => {
      const result = parse('{{formatCurrency(total, "USD")}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'function',
          name: 'formatCurrency',
          args: [
            { type: 'path', segments: [{ type: 'property', name: 'total' }] },
            { type: 'string', value: 'USD' },
          ],
        },
      });
    });

    it('parses function with single-quoted string', () => {
      const result = parse("{{formatCurrency(total, 'BRL')}}");
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'function',
          name: 'formatCurrency',
          args: [
            { type: 'path', segments: [{ type: 'property', name: 'total' }] },
            { type: 'string', value: 'BRL' },
          ],
        },
      });
    });

    it('parses function with number literal', () => {
      const result = parse('{{formatNumber(value, 2)}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'function',
          name: 'formatNumber',
          args: [
            { type: 'path', segments: [{ type: 'property', name: 'value' }] },
            { type: 'number', value: 2 },
          ],
        },
      });
    });

    it('parses function with path argument', () => {
      const result = parse('{{uppercase(user.name)}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'function',
          name: 'uppercase',
          args: [
            {
              type: 'path',
              segments: [
                { type: 'property', name: 'user' },
                { type: 'property', name: 'name' },
              ],
            },
          ],
        },
      });
    });

    it('parses function with multiple arguments', () => {
      const result = parse('{{if(condition, "yes", "no")}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'function',
          name: 'if',
          args: [
            { type: 'path', segments: [{ type: 'property', name: 'condition' }] },
            { type: 'string', value: 'yes' },
            { type: 'string', value: 'no' },
          ],
        },
      });
    });

    it('parses function with nested path argument', () => {
      const result = parse('{{formatCurrency(items[0].price, "USD")}}');
      expect(result[0]).toMatchObject({
        type: 'expression',
        expression: {
          type: 'function',
          name: 'formatCurrency',
          args: [
            {
              type: 'path',
              segments: [
                { type: 'property', name: 'items' },
                { type: 'index', value: 0 },
                { type: 'property', name: 'price' },
              ],
            },
            { type: 'string', value: 'USD' },
          ],
        },
      });
    });
  });

  describe('edge cases', () => {
    it('handles malformed expression (no closing brace)', () => {
      const result = parse('Hello {{name');
      // Malformed expression: "Hello " is parsed as literal, then "{{name" as literal
      expect(result).toEqual([
        { type: 'literal', value: 'Hello ' },
        { type: 'literal', value: '{{name' },
      ]);
    });

    it('handles expression with only opening braces', () => {
      const result = parse('{{');
      expect(result).toEqual([{ type: 'literal', value: '{{' }]);
    });

    it('handles nested braces in string (not nested expressions)', () => {
      const result = parse('{{name}}');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('expression');
    });
  });
});
