/**
 * Expression Parser
 * 
 * Tokenizes and parses {{...}} expressions into an AST.
 * Supports:
 * - Literal text
 * - Path expressions (a.b.c)
 * - Array access (items[0].name)
 * - Function calls (formatCurrency(total, 'BRL'))
 * - Pipe expressions (value | currency:"BRL" | uppercase)
 */

export type ASTNode =
  | { type: 'literal'; value: string }
  | { type: 'expression'; expression: Expression; original: string };

export type Expression =
  | { type: 'path'; segments: PathSegment[] }
  | { type: 'function'; name: string; args: FunctionArg[] }
  | { type: 'pipe'; value: Expression; pipes: PipeCall[] };

export type PipeCall = {
  name: string;
  args: PipeArg[];
};

export type PipeArg =
  | { type: 'string'; value: string }
  | { type: 'number'; value: number };

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
  // Check if it contains pipe syntax (not inside strings or function calls)
  const pipeIndex = findTopLevelPipe(expr);
  
  if (pipeIndex !== -1) {
    return parsePipeExpression(expr);
  }
  
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

/**
 * Find the index of the first top-level pipe character (|)
 * Returns -1 if no top-level pipe is found
 */
function findTopLevelPipe(expr: string): number {
  let depth = 0;
  let inString = false;
  let stringChar: string | null = null;
  
  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];
    
    if (inString) {
      if (char === '\\' && i + 1 < expr.length) {
        i++; // Skip escaped character
      } else if (char === stringChar) {
        inString = false;
        stringChar = null;
      }
    } else {
      if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
      } else if (char === '(') {
        depth++;
      } else if (char === ')') {
        depth--;
      } else if (char === '|' && depth === 0) {
        return i;
      }
    }
  }
  
  return -1;
}

/**
 * Parse a pipe expression like "value | currency:'BRL' | uppercase"
 */
function parsePipeExpression(expr: string): Expression {
  // Split by top-level pipes
  const parts = splitByTopLevelPipe(expr);
  
  if (parts.length < 2) {
    // No pipes found, shouldn't happen but handle gracefully
    return { type: 'path', segments: parsePath(expr) };
  }
  
  // First part is the value expression
  const valueExpr = parts[0].trim();
  
  // Check if value is a function call or path
  const funcMatch = valueExpr.match(/^([a-zA-Z_]\w*)\s*\(/);
  const value: Expression = funcMatch
    ? parseFunctionCall(valueExpr)
    : { type: 'path', segments: parsePath(valueExpr) };
  
  // Rest are pipe calls
  const pipes: PipeCall[] = [];
  for (let i = 1; i < parts.length; i++) {
    const pipeStr = parts[i].trim();
    pipes.push(parsePipeCall(pipeStr));
  }
  
  return { type: 'pipe', value, pipes };
}

/**
 * Split expression by top-level pipe characters
 */
function splitByTopLevelPipe(expr: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let stringChar: string | null = null;
  
  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];
    
    if (inString) {
      if (char === '\\' && i + 1 < expr.length) {
        current += char + expr[i + 1];
        i++; // Skip escaped character
      } else if (char === stringChar) {
        current += char;
        inString = false;
        stringChar = null;
      } else {
        current += char;
      }
    } else {
      if (char === '"' || char === "'") {
        current += char;
        inString = true;
        stringChar = char;
      } else if (char === '(') {
        current += char;
        depth++;
      } else if (char === ')') {
        current += char;
        depth--;
      } else if (char === '|' && depth === 0) {
        parts.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  
  if (current) {
    parts.push(current);
  }
  
  return parts;
}

/**
 * Parse a single pipe call like "currency:'BRL'" or "uppercase"
 */
function parsePipeCall(pipeStr: string): PipeCall {
  const colonIndex = pipeStr.indexOf(':');
  
  if (colonIndex === -1) {
    // No arguments, just pipe name
    return { name: pipeStr.trim(), args: [] };
  }
  
  const name = pipeStr.slice(0, colonIndex).trim();
  const argsStr = pipeStr.slice(colonIndex + 1).trim();
  
  // Parse pipe arguments (similar to function args but simpler)
  const args = parsePipeArguments(argsStr);
  
  return { name, args };
}

/**
 * Parse pipe arguments (strings or numbers only)
 */
function parsePipeArguments(argsStr: string): PipeArg[] {
  const args: PipeArg[] = [];
  let current = '';
  let inString = false;
  let stringChar: string | null = null;
  let stringValue = '';
  
  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];
    
    if (inString) {
      if (char === '\\' && i + 1 < argsStr.length) {
        stringValue += argsStr[i + 1];
        i++;
      } else if (char === stringChar) {
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
        inString = true;
        stringChar = char;
        stringValue = '';
      } else if (char === ':') {
        // Multiple arguments separated by colon
        const trimmed = current.trim();
        if (trimmed) {
          args.push(parsePipeArg(trimmed));
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
    args.push(parsePipeArg(trimmed));
  }
  
  return args;
}

/**
 * Parse a single pipe argument (string or number only)
 * Note: Only accepts standard numeric notation (e.g., "123", "-45.67")
 * Scientific notation (e.g., "1e5") is treated as a string for predictability
 */
function parsePipeArg(arg: string): PipeArg {
  const num = parseFloat(arg);
  
  // Strict numeric pattern - only standard notation, no scientific
  // This ensures predictable behavior in templates
  if (!isNaN(num) && isFinite(num) && /^-?\d+(\.\d+)?$/.test(arg)) {
    return { type: 'number', value: num };
  }
  
  // If not a number, treat as string (unquoted string literal)
  return { type: 'string', value: arg };
}

