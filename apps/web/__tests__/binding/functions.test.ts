import { describe, it, expect } from 'vitest';
import { builtInFunctions } from '@/lib/binding/functions';

describe('built-in functions', () => {
  describe('formatCurrency', () => {
    it('formats USD currency', () => {
      const result = builtInFunctions.formatCurrency(1234.56, 'USD');
      expect(result).toBe('$1,234.56');
    });

    it('formats BRL currency', () => {
      const result = builtInFunctions.formatCurrency(1234.56, 'BRL');
      // BRL format may vary by Node version/ICU data, just check it contains the right parts
      expect(result).toMatch(/R\$.*1[.,]234[.,]56/);
    });

    it('formats EUR currency', () => {
      const result = builtInFunctions.formatCurrency(1234.56, 'EUR');
      expect(result).toMatch(/1[.,]234[.,]56/); // Different locales may format differently
    });

    it('formats GBP currency', () => {
      const result = builtInFunctions.formatCurrency(1234.56, 'GBP');
      expect(result).toMatch(/£1[.,]234[.,]56/);
    });

    it('handles string numbers', () => {
      const result = builtInFunctions.formatCurrency('1234.56', 'USD');
      expect(result).toBe('$1,234.56');
    });

    it('handles invalid numbers gracefully', () => {
      const result = builtInFunctions.formatCurrency('invalid', 'USD');
      expect(result).toBe('invalid');
    });

    it('handles null/undefined', () => {
      expect(builtInFunctions.formatCurrency(null, 'USD')).toBe('');
      expect(builtInFunctions.formatCurrency(undefined, 'USD')).toBe('');
    });

    it('handles unknown currency code with fallback', () => {
      const result = builtInFunctions.formatCurrency(1234.56, 'XYZ');
      // Fallback format includes the currency code and formatted number
      expect(result).toMatch(/XYZ.*1[,.]234\.56/);
    });
  });

  describe('formatDate', () => {
    it('formats Date object with locale', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = builtInFunctions.formatDate(date, 'en-US');
      expect(result).toMatch(/1\/15\/2024/);
    });

    it('formats date string with locale', () => {
      // Use ISO format with time to avoid timezone issues
      const result = builtInFunctions.formatDate('2024-01-15T12:00:00', 'en-US');
      expect(result).toMatch(/1\/15\/2024/);
    });

    it('formats with YYYY-MM-DD pattern', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = builtInFunctions.formatDate(date, 'YYYY-MM-DD');
      expect(result).toBe('2024-01-15');
    });

    it('formats with MM/DD/YYYY pattern', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = builtInFunctions.formatDate(date, 'MM/DD/YYYY');
      expect(result).toBe('01/15/2024');
    });

    it('formats with DD/MM/YYYY pattern', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = builtInFunctions.formatDate(date, 'DD/MM/YYYY');
      expect(result).toBe('15/01/2024');
    });

    it('handles invalid date gracefully', () => {
      const result = builtInFunctions.formatDate('invalid', 'en-US');
      expect(result).toBe('invalid');
    });

    it('handles null/undefined', () => {
      expect(builtInFunctions.formatDate(null, 'en-US')).toBe('');
      expect(builtInFunctions.formatDate(undefined, 'en-US')).toBe('');
    });

    it('handles timestamp number', () => {
      const timestamp = new Date('2024-01-15').getTime();
      const result = builtInFunctions.formatDate(timestamp, 'YYYY-MM-DD');
      expect(result).toBe('2024-01-15');
    });
  });

  describe('formatNumber', () => {
    it('formats number with 2 decimals by default', () => {
      const result = builtInFunctions.formatNumber(1234.56, 2);
      expect(result).toBe('1,234.56');
    });

    it('formats number with 0 decimals', () => {
      const result = builtInFunctions.formatNumber(1234.56, 0);
      expect(result).toBe('1,235');
    });

    it('formats number with 4 decimals', () => {
      const result = builtInFunctions.formatNumber(1234.5678, 4);
      expect(result).toBe('1,234.5678');
    });

    it('handles string numbers', () => {
      const result = builtInFunctions.formatNumber('1234.56', 2);
      expect(result).toBe('1,234.56');
    });

    it('handles invalid numbers gracefully', () => {
      const result = builtInFunctions.formatNumber('invalid', 2);
      expect(result).toBe('invalid');
    });

    it('handles null/undefined', () => {
      expect(builtInFunctions.formatNumber(null, 2)).toBe('');
      expect(builtInFunctions.formatNumber(undefined, 2)).toBe('');
    });

    it('uses default decimals if not provided', () => {
      const result = builtInFunctions.formatNumber(1234.56, undefined);
      expect(result).toBe('1,234.56');
    });
  });

  describe('if (conditional)', () => {
    it('returns then value for truthy condition', () => {
      const result = builtInFunctions.if(true, 'yes', 'no');
      expect(result).toBe('yes');
    });

    it('returns else value for falsy condition', () => {
      const result = builtInFunctions.if(false, 'yes', 'no');
      expect(result).toBe('no');
    });

    it('treats non-zero numbers as truthy', () => {
      const result = builtInFunctions.if(1, 'yes', 'no');
      expect(result).toBe('yes');
    });

    it('treats zero as falsy', () => {
      const result = builtInFunctions.if(0, 'yes', 'no');
      expect(result).toBe('no');
    });

    it('treats empty string as falsy', () => {
      const result = builtInFunctions.if('', 'yes', 'no');
      expect(result).toBe('no');
    });

    it('treats non-empty string as truthy', () => {
      const result = builtInFunctions.if('hello', 'yes', 'no');
      expect(result).toBe('yes');
    });

    it('treats null as falsy', () => {
      const result = builtInFunctions.if(null, 'yes', 'no');
      expect(result).toBe('no');
    });

    it('treats undefined as falsy', () => {
      const result = builtInFunctions.if(undefined, 'yes', 'no');
      expect(result).toBe('no');
    });

    it('can return non-string values', () => {
      const result = builtInFunctions.if(true, 42, 0);
      expect(result).toBe(42);
    });
  });

  describe('uppercase', () => {
    it('converts string to uppercase', () => {
      const result = builtInFunctions.uppercase('hello');
      expect(result).toBe('HELLO');
    });

    it('handles already uppercase string', () => {
      const result = builtInFunctions.uppercase('HELLO');
      expect(result).toBe('HELLO');
    });

    it('handles mixed case', () => {
      const result = builtInFunctions.uppercase('HeLLo WoRLd');
      expect(result).toBe('HELLO WORLD');
    });

    it('handles numbers by converting to string', () => {
      const result = builtInFunctions.uppercase(123);
      expect(result).toBe('123');
    });

    it('handles null/undefined', () => {
      expect(builtInFunctions.uppercase(null)).toBe('');
      expect(builtInFunctions.uppercase(undefined)).toBe('');
    });
  });

  describe('lowercase', () => {
    it('converts string to lowercase', () => {
      const result = builtInFunctions.lowercase('HELLO');
      expect(result).toBe('hello');
    });

    it('handles already lowercase string', () => {
      const result = builtInFunctions.lowercase('hello');
      expect(result).toBe('hello');
    });

    it('handles mixed case', () => {
      const result = builtInFunctions.lowercase('HeLLo WoRLd');
      expect(result).toBe('hello world');
    });

    it('handles numbers by converting to string', () => {
      const result = builtInFunctions.lowercase(123);
      expect(result).toBe('123');
    });

    it('handles null/undefined', () => {
      expect(builtInFunctions.lowercase(null)).toBe('');
      expect(builtInFunctions.lowercase(undefined)).toBe('');
    });
  });

  describe('join', () => {
    it('joins array with default comma separator', () => {
      const result = builtInFunctions.join(['a', 'b', 'c'], ',');
      expect(result).toBe('a,b,c');
    });

    it('joins array with custom separator', () => {
      const result = builtInFunctions.join(['a', 'b', 'c'], ' | ');
      expect(result).toBe('a | b | c');
    });

    it('joins array with space separator', () => {
      const result = builtInFunctions.join(['hello', 'world'], ' ');
      expect(result).toBe('hello world');
    });

    it('handles array with numbers', () => {
      const result = builtInFunctions.join([1, 2, 3], '-');
      expect(result).toBe('1-2-3');
    });

    it('handles array with mixed types', () => {
      const result = builtInFunctions.join([1, 'two', true], ',');
      expect(result).toBe('1,two,true');
    });

    it('handles non-array by converting to string', () => {
      const result = builtInFunctions.join('not-an-array', ',');
      expect(result).toBe('not-an-array');
    });

    it('handles empty array', () => {
      const result = builtInFunctions.join([], ',');
      expect(result).toBe('');
    });

    it('handles null/undefined in array elements', () => {
      const result = builtInFunctions.join(['a', null, 'b', undefined, 'c'], ',');
      expect(result).toBe('a,,b,,c');
    });
  });

  describe('percent', () => {
    it('formats decimal as percentage', () => {
      const result = builtInFunctions.percent(0.1234);
      expect(result).toBe('12,34%');
    });

    it('formats with custom decimal places', () => {
      const result = builtInFunctions.percent(0.02465594, 4);
      expect(result).toBe('2,4656%');
    });

    it('formats zero', () => {
      const result = builtInFunctions.percent(0);
      expect(result).toBe('0,00%');
    });

    it('handles string numbers', () => {
      const result = builtInFunctions.percent('0.5');
      expect(result).toBe('50,00%');
    });

    it('handles null/undefined', () => {
      expect(builtInFunctions.percent(null)).toBe('');
      expect(builtInFunctions.percent(undefined)).toBe('');
    });

    it('handles invalid input', () => {
      expect(builtInFunctions.percent('invalid')).toBe('invalid');
    });
  });

  describe('abs', () => {
    it('returns absolute value of negative number', () => {
      expect(builtInFunctions.abs(-5.5)).toBe(5.5);
    });

    it('returns positive number unchanged', () => {
      expect(builtInFunctions.abs(3.14)).toBe(3.14);
    });

    it('returns zero for zero', () => {
      expect(builtInFunctions.abs(0)).toBe(0);
    });

    it('handles string numbers', () => {
      expect(builtInFunctions.abs('-42')).toBe(42);
    });

    it('handles null/undefined', () => {
      expect(builtInFunctions.abs(null)).toBe('');
      expect(builtInFunctions.abs(undefined)).toBe('');
    });
  });

  describe('currency (pipe alias)', () => {
    it('defaults to BRL', () => {
      const result = builtInFunctions.currency(1234.56);
      expect(result).toMatch(/R\$.*1[.,]234[.,]56/);
    });

    it('accepts currency code argument', () => {
      const result = builtInFunctions.currency(1234.56, 'USD');
      expect(result).toBe('$1,234.56');
    });
  });

  describe('date (pipe alias)', () => {
    it('defaults to DD/MM/YYYY', () => {
      const result = builtInFunctions.date('2024-05-02T00:00:00Z');
      expect(result).toBe('02/05/2024');
    });

    it('formats with MMM/yy pattern', () => {
      const result = builtInFunctions.date('2024-05-02T00:00:00Z', 'MMM/yy');
      expect(result).toBe('Mai/24');
    });

    it('formats with MM/yyyy pattern', () => {
      const result = builtInFunctions.date('2024-05-02T00:00:00Z', 'MM/yyyy');
      expect(result).toBe('05/2024');
    });
  });

  describe('number (pipe alias)', () => {
    it('formats with default 2 decimals', () => {
      const result = builtInFunctions.number(12345.67);
      expect(result).toBe('12,345.67');
    });

    it('formats with 0 decimals', () => {
      const result = builtInFunctions.number(12345.67, 0);
      expect(result).toBe('12,346');
    });
  });

  describe('cpf', () => {
    it('formats 11-digit CPF string', () => {
      expect(builtInFunctions.cpf('14654044817')).toBe('146.540.448-17');
    });

    it('formats numeric CPF', () => {
      expect(builtInFunctions.cpf(14654044817)).toBe('146.540.448-17');
    });

    it('returns original for invalid length', () => {
      expect(builtInFunctions.cpf('123')).toBe('123');
    });

    it('handles null/undefined', () => {
      expect(builtInFunctions.cpf(null)).toBe('');
      expect(builtInFunctions.cpf(undefined)).toBe('');
    });

    it('strips non-numeric characters before formatting', () => {
      expect(builtInFunctions.cpf('146.540.448-17')).toBe('146.540.448-17');
    });
  });

  describe('sign', () => {
    it('adds + prefix to positive number', () => {
      expect(builtInFunctions.sign(0.0233)).toBe('+0.0233');
    });

    it('keeps - prefix for negative number', () => {
      expect(builtInFunctions.sign(-5)).toBe('-5');
    });

    it('returns "0" for zero', () => {
      expect(builtInFunctions.sign(0)).toBe('0');
    });

    it('handles null/undefined', () => {
      expect(builtInFunctions.sign(null)).toBe('');
      expect(builtInFunctions.sign(undefined)).toBe('');
    });
  });

  describe('ifEmpty', () => {
    it('returns fallback for null', () => {
      expect(builtInFunctions.ifEmpty(null, '—')).toBe('—');
    });

    it('returns fallback for undefined', () => {
      expect(builtInFunctions.ifEmpty(undefined, '—')).toBe('—');
    });

    it('returns fallback for empty string', () => {
      expect(builtInFunctions.ifEmpty('', '—')).toBe('—');
    });

    it('returns original value if not empty', () => {
      expect(builtInFunctions.ifEmpty(42, '—')).toBe(42);
    });

    it('returns original value for non-empty string', () => {
      expect(builtInFunctions.ifEmpty('hello', '—')).toBe('hello');
    });

    it('returns zero (not empty)', () => {
      expect(builtInFunctions.ifEmpty(0, '—')).toBe(0);
    });
  });

  describe('multiply', () => {
    it('multiplies value by factor', () => {
      expect(builtInFunctions.multiply(0.547, 100)).toBe(54.7);
    });

    it('defaults factor to 1', () => {
      expect(builtInFunctions.multiply(42)).toBe(42);
    });

    it('handles string numbers', () => {
      expect(builtInFunctions.multiply('10', 5)).toBe(50);
    });

    it('handles null/undefined', () => {
      expect(builtInFunctions.multiply(null, 100)).toBe('');
      expect(builtInFunctions.multiply(undefined, 100)).toBe('');
    });

    it('handles invalid input', () => {
      expect(builtInFunctions.multiply('invalid', 100)).toBe('invalid');
    });
  });

  describe('sign | percent chain', () => {
    it('produces +2,33% for positive value', () => {
      const signed = builtInFunctions.sign(0.0233);
      const result = builtInFunctions.percent(signed);
      expect(result).toBe('+2,33%');
    });

    it('produces -3,60% for negative value', () => {
      const signed = builtInFunctions.sign(-0.036);
      const result = builtInFunctions.percent(signed);
      expect(result).toBe('-3,60%');
    });
  });
});
