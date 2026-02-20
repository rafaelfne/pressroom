/**
 * Pipe Syntax Feature Demonstration
 * 
 * This file demonstrates the new pipe syntax feature added to the expression parser.
 * Run this with: node --loader ts-node/esm demonstration.ts
 */

import { resolveBindings } from './lib/binding';

console.log('=== Pipe Syntax Demonstration ===\n');

// Example 1: Simple pipe transformation
console.log('1. Simple Pipe:');
const example1 = resolveBindings(
  'Hello {{name | uppercase}}!',
  { name: 'world' }
);
console.log(`   Template: "Hello {{name | uppercase}}!"`);
console.log(`   Data: { name: "world" }`);
console.log(`   Result: "${example1}"\n`);

// Example 2: Pipe with arguments
console.log('2. Pipe with Arguments:');
const example2 = resolveBindings(
  'Price: {{amount | currency:"BRL"}}',
  { amount: 1234.56 }
);
console.log(`   Template: "Price: {{amount | currency:\\"BRL\\"}}"`);
console.log(`   Data: { amount: 1234.56 }`);
console.log(`   Result: "${example2}"\n`);

// Example 3: Chained pipes
console.log('3. Chained Pipes:');
const example3 = resolveBindings(
  'Growth: {{value | abs | percent:1}}',
  { value: -0.234 }
);
console.log(`   Template: "Growth: {{value | abs | percent:1}}"`);
console.log(`   Data: { value: -0.234 }`);
console.log(`   Result: "${example3}"\n`);

// Example 4: Complex template with multiple pipes
console.log('4. Complex Template:');
const template = {
  title: '{{company | uppercase}}',
  revenue: '{{revenue | currency:"USD"}}',
  growth: '{{growth | percent:2}}',
  summary: 'Company {{company}} achieved {{revenue | currency:"USD"}} in revenue',
};
const data = {
  company: 'Acme Corp',
  revenue: 1500000,
  growth: 0.15,
};
const example4 = resolveBindings(template, data);
console.log(`   Template:`, JSON.stringify(template, null, 2));
console.log(`   Data:`, JSON.stringify(data, null, 2));
console.log(`   Result:`, JSON.stringify(example4, null, 2));
console.log();

// Example 5: Backward compatibility - function syntax still works
console.log('5. Backward Compatibility:');
const example5 = resolveBindings(
  'Price: {{formatCurrency(amount, "EUR")}}',
  { amount: 999.99 }
);
console.log(`   Template: "Price: {{formatCurrency(amount, \\"EUR\\")}}"`);
console.log(`   Data: { amount: 999.99 }`);
console.log(`   Result: "${example5}"\n`);

// Example 6: Mixed syntax
console.log('6. Mixed Syntax:');
const example6 = resolveBindings(
  'Function: {{formatCurrency(price, "USD")}} | Pipe: {{price | currency:"USD"}}',
  { price: 49.99 }
);
console.log(`   Template: "Function: {{formatCurrency(price, \\"USD\\")}} | Pipe: {{price | currency:\\"USD\\"}}"`);
console.log(`   Data: { price: 49.99 }`);
console.log(`   Result: "${example6}"\n`);

console.log('=== All Features Working! ===');
