/**
 * Built-in Functions
 * 
 * Registry of built-in functions for use in binding expressions.
 * No eval(), no Function() constructor - all functions are explicitly defined.
 */

type BuiltInFunction = (...args: unknown[]) => unknown;

/**
 * Format a number as currency
 */
function formatCurrency(value: unknown, locale: unknown): string {
  const num = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  if (isNaN(num)) return String(value ?? '');

  const localeStr = String(locale ?? 'USD');

  const currencyMap: Record<string, { locale: string; currency: string }> = {
    BRL: { locale: 'pt-BR', currency: 'BRL' },
    USD: { locale: 'en-US', currency: 'USD' },
    EUR: { locale: 'de-DE', currency: 'EUR' },
    GBP: { locale: 'en-GB', currency: 'GBP' },
  };

  const config = currencyMap[localeStr] ?? { locale: 'en-US', currency: localeStr };

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
    }).format(num);
  } catch {
    // Fallback if locale/currency is invalid
    return `${config.currency} ${num.toFixed(2)}`;
  }
}

/**
 * Format a date
 */
function formatDate(value: unknown, format: unknown): string {
  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string' || typeof value === 'number') {
    date = new Date(value);
  } else {
    return String(value ?? '');
  }

  if (isNaN(date.getTime())) {
    return String(value ?? '');
  }

  const formatStr = String(format ?? 'en-US');

  // Simple pattern matching for common formats (check first)
  const patterns: Record<string, () => string> = {
    'YYYY-MM-DD': () => date.toISOString().split('T')[0],
    'MM/DD/YYYY': () => `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`,
    'DD/MM/YYYY': () => `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`,
  };

  if (patterns[formatStr]) {
    return patterns[formatStr]();
  }

  // If format looks like a locale, use it as locale
  if (formatStr.includes('-') || formatStr.length === 2) {
    try {
      return new Intl.DateTimeFormat(formatStr).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  }

  // Default to locale date string
  return date.toLocaleDateString(formatStr);
}

/**
 * Format a number with decimal precision
 */
function formatNumber(value: unknown, decimals: unknown): string {
  const num = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  if (isNaN(num)) return String(value ?? '');

  const dec = typeof decimals === 'number' ? decimals : parseInt(String(decimals ?? '2'), 10);
  const validDecimals = isNaN(dec) ? 2 : dec;

  return num.toLocaleString('en-US', {
    minimumFractionDigits: validDecimals,
    maximumFractionDigits: validDecimals,
  });
}

/**
 * Conditional expression (ternary)
 */
function ifFn(condition: unknown, thenValue: unknown, elseValue: unknown): unknown {
  return condition ? thenValue : elseValue;
}

/**
 * Convert string to uppercase
 */
function uppercase(value: unknown): string {
  return String(value ?? '').toUpperCase();
}

/**
 * Convert string to lowercase
 */
function lowercase(value: unknown): string {
  return String(value ?? '').toLowerCase();
}

/**
 * Join array with separator
 */
function join(value: unknown, separator: unknown): string {
  if (!Array.isArray(value)) {
    return String(value ?? '');
  }

  const sep = String(separator ?? ',');
  return value.map((v) => String(v ?? '')).join(sep);
}

/**
 * Registry of built-in functions
 */
export const builtInFunctions: Record<string, BuiltInFunction> = {
  formatCurrency,
  formatDate,
  formatNumber,
  if: ifFn,
  uppercase,
  lowercase,
  join,
};

/**
 * Get a function by name from the registry
 */
export function getFunction(name: string): BuiltInFunction | undefined {
  return builtInFunctions[name];
}
