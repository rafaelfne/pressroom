/**
 * Default sample data for new templates.
 *
 * Provides a sensible starting point so designers can immediately see
 * how bindings like {{company.name}} resolve in the preview.
 */
export const DEFAULT_SAMPLE_DATA: Record<string, unknown> = {
  company: {
    name: 'Acme Corp',
    address: '123 Main Street, Springfield',
    phone: '(555) 123-4567',
    email: 'contact@acme.com',
  },
  report: {
    title: 'Monthly Report',
    date: '2025-01-15',
    author: 'John Doe',
  },
  items: [
    { name: 'Item 1', quantity: 10, price: 29.99 },
    { name: 'Item 2', quantity: 5, price: 49.99 },
    { name: 'Item 3', quantity: 8, price: 19.99 },
  ],
  summary: {
    total: 649.72,
    count: 23,
    average: 28.25,
  },
};
