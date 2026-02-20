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
 * pt-BR month abbreviations (used in date formatting)
 */
const PT_BR_MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

/**
 * Format a date with extended pattern support including pt-BR month names
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

  const formatStr = String(format ?? 'DD/MM/YYYY');

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = String(date.getUTCFullYear());
  const shortYear = year.slice(-2);
  const monthShort = PT_BR_MONTHS_SHORT[date.getUTCMonth()];

  const patterns: Record<string, () => string> = {
    'YYYY-MM-DD': () => `${year}-${month}-${day}`,
    'MM/DD/YYYY': () => `${month}/${day}/${year}`,
    'DD/MM/YYYY': () => `${day}/${month}/${year}`,
    'MM/yyyy': () => `${month}/${year}`,
    'MM/YYYY': () => `${month}/${year}`,
    'MMM/yy': () => `${monthShort}/${shortYear}`,
    'MMM/yyyy': () => `${monthShort}/${year}`,
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

  // Default to pt-BR locale date string
  return date.toLocaleDateString('pt-BR');
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
 * Format as percentage (value * 100) with pt-BR locale formatting
 */
function percent(value: unknown, decimals: unknown = 2): string {
  const num = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  if (isNaN(num)) return String(value ?? '');
  
  const dec = typeof decimals === 'number' ? decimals : parseInt(String(decimals ?? '2'), 10);
  const validDecimals = isNaN(dec) ? 2 : dec;
  
  const percentage = num * 100;
  const formatted = percentage.toLocaleString('pt-BR', {
    minimumFractionDigits: validDecimals,
    maximumFractionDigits: validDecimals,
  });
  return `${formatted}%`;
}

/**
 * Absolute value
 */
function abs(value: unknown): number | string {
  const num = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  if (isNaN(num)) return String(value ?? '');
  
  return Math.abs(num);
}

/**
 * Alias for formatCurrency - pipe-friendly name
 */
function currency(value: unknown, currencyCode: unknown = 'BRL'): string {
  return formatCurrency(value, currencyCode);
}

/**
 * Pipe-friendly alias for formatDate
 */
function date(value: unknown, format: unknown = 'DD/MM/YYYY'): string {
  return formatDate(value, format);
}

/**
 * Pipe-friendly alias for formatNumber
 */
function number(value: unknown, decimals: unknown = 2): string {
  return formatNumber(value, decimals);
}

/**
 * Format a Brazilian CPF number (11 digits → XXX.XXX.XXX-XX)
 */
function cpf(value: unknown): string {
  const str = String(value ?? '').replace(/\D/g, '');
  if (str.length !== 11) return String(value ?? '');
  return `${str.slice(0, 3)}.${str.slice(3, 6)}.${str.slice(6, 9)}-${str.slice(9, 11)}`;
}

/**
 * Add sign prefix (+/-) to a number
 */
function sign(value: unknown): number | string {
  const num = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  if (isNaN(num)) return String(value ?? '');
  return num;
}

/**
 * Provide a fallback value when the input is null, undefined, or empty string
 */
function ifEmpty(value: unknown, fallback: unknown = ''): unknown {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return value;
}

/**
 * Multiply a number by a factor
 */
function multiply(value: unknown, factor: unknown = 1): number | string {
  const num = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  if (isNaN(num)) return String(value ?? '');
  const fac = typeof factor === 'number' ? factor : parseFloat(String(factor ?? '1'));
  if (isNaN(fac)) return num;
  return num * fac;
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
  percent,
  abs,
  currency,
  date,
  number,
  cpf,
  sign,
  ifEmpty,
  multiply,
};

/**
 * Get a function by name from the registry
 */
export function getFunction(name: string): BuiltInFunction | undefined {
  return builtInFunctions[name];
}
