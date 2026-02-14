/**
 * Expression Parser
 * 
 * Tokenizes and parses {{...}} expressions into an AST.
 * Supports:
 * - Literal text
 * - Path expressions (a.b.c)
 * - Array access (items[0].name)
 * - Function calls (formatCurrency(total, 'BRL'))
 */

export type ASTNode =
  | { type: 'literal'; value: string }
  | { type: 'expression'; expression: Expression; original: string };

export type Expression =
  | { type: 'path'; segments: PathSegment[] }
  | { type: 'function'; name: string; args: FunctionArg[] };

export type PathSegment =
  | { type: 'property'; name: string }
  | { type: 'index'; value: number };

export type FunctionArg =
  | { type: 'string'; value: string }
  | { type: 'number'; value: number }
  | { type: 'path'; segments: PathSegment[] };

/**
 * Parse a template string into an AST
 */
export function parse(template: string): ASTNode[] {
  const nodes: ASTNode[] = [];
  let position = 0;

  while (position < template.length) {
    const openIndex = template.indexOf('{{', position);

    if (openIndex === -1) {
      // No more expressions, rest is literal
      if (position < template.length) {
        nodes.push({ type: 'literal', value: template.slice(position) });
      }
      break;
    }

    // Add literal text before expression
    if (openIndex > position) {
      nodes.push({ type: 'literal', value: template.slice(position, openIndex) });
    }

    // Find closing }}
    const closeIndex = template.indexOf('}}', openIndex + 2);
    if (closeIndex === -1) {
      // Malformed expression, treat rest as literal
      nodes.push({ type: 'literal', value: template.slice(openIndex) });
      break;
    }

    // Extract and parse expression
    const rawExpression = template.slice(openIndex + 2, closeIndex);
    const expressionText = rawExpression.trim();
    if (expressionText.length > 0) {
      const expression = parseExpression(expressionText);
      const original = `{{${rawExpression}}}`;
      nodes.push({ type: 'expression', expression, original });
    }

    position = closeIndex + 2;
  }

  return nodes;
}

/**
 * Parse an expression string (without {{ }})
 */
function parseExpression(expr: string): Expression {
  // Check if it's a function call
  const funcMatch = expr.match(/^([a-zA-Z_]\w*)\s*\(/);
  if (funcMatch) {
    return parseFunctionCall(expr);
  }

  // Otherwise it's a path expression
  return { type: 'path', segments: parsePath(expr) };
}

/**
 * Parse a path expression like "a.b.c" or "items[0].name"
 */
function parsePath(path: string): PathSegment[] {
  const segments: PathSegment[] = [];
  let current = '';
  let i = 0;

  while (i < path.length) {
    const char = path[i];

    if (char === '.') {
      if (current) {
        segments.push({ type: 'property', name: current });
        current = '';
      }
      i++;
    } else if (char === '[') {
      if (current) {
        segments.push({ type: 'property', name: current });
        current = '';
      }
      // Parse array index
      const closeIndex = path.indexOf(']', i);
      if (closeIndex === -1) break;
      
      const indexStr = path.slice(i + 1, closeIndex);
      const index = parseInt(indexStr, 10);
      if (!isNaN(index)) {
        segments.push({ type: 'index', value: index });
      }
      i = closeIndex + 1;
    } else if (char === ' ') {
      // Skip whitespace
      i++;
    } else {
      current += char;
      i++;
    }
  }

  if (current) {
    segments.push({ type: 'property', name: current });
  }

  return segments;
}

/**
 * Parse a function call like "formatCurrency(total, 'BRL')"
 */
function parseFunctionCall(expr: string): Expression {
  const parenIndex = expr.indexOf('(');
  const name = expr.slice(0, parenIndex).trim();
  
  // Find matching closing paren
  let depth = 0;
  let closeIndex = -1;
  for (let i = parenIndex; i < expr.length; i++) {
    if (expr[i] === '(') depth++;
    if (expr[i] === ')') {
      depth--;
      if (depth === 0) {
        closeIndex = i;
        break;
      }
    }
  }

  if (closeIndex === -1) {
    // Malformed, return empty function call
    return { type: 'function', name, args: [] };
  }

  const argsStr = expr.slice(parenIndex + 1, closeIndex);
  const args = parseArguments(argsStr);

  return { type: 'function', name, args };
}

/**
 * Parse function arguments
 */
function parseArguments(argsStr: string): FunctionArg[] {
  const args: FunctionArg[] = [];
  let current = '';
  let inString = false;
  let stringChar: string | null = null;
  let stringValue = '';

  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];

    if (inString) {
      if (char === '\\' && i + 1 < argsStr.length) {
        // Escaped character - consume next char literally
        stringValue += argsStr[i + 1];
        i++;
      } else if (char === stringChar) {
        // End of string - push the string value directly
        args.push({ type: 'string', value: stringValue });
        stringValue = '';
        current = '';
        inString = false;
        stringChar = null;
      } else {
        stringValue += char;
      }
    } else {
      if (char === '"' || char === "'") {
        // Start of string
        inString = true;
        stringChar = char;
        stringValue = '';
      } else if (char === ',') {
        // End of argument
        const trimmed = current.trim();
        if (trimmed) {
          args.push(parseArgument(trimmed));
        }
        current = '';
      } else {
        current += char;
      }
    }
  }

  // Add last argument
  const trimmed = current.trim();
  if (trimmed) {
    args.push(parseArgument(trimmed));
  }

  return args;
}

/**
 * Parse a single argument (can be string, number, or path)
 */
function parseArgument(arg: string): FunctionArg {
  // Check if it's a number - use a more robust check
  const trimmed = arg.trim();
  const num = parseFloat(trimmed);
  
  // Valid number if: not NaN, finite, and the original string looks numeric
  // This handles integers, decimals, and negative numbers correctly
  if (!isNaN(num) && isFinite(num) && /^-?\d+(\.\d+)?$/.test(trimmed)) {
    return { type: 'number', value: num };
  }

  // Otherwise it's a path
  return { type: 'path', segments: parsePath(arg) };
}
