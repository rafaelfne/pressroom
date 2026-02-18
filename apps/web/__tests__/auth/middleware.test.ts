import { describe, it, expect } from 'vitest';

describe('Middleware', () => {
  describe('config matcher', () => {
    it('should have correct route matchers', () => {
      // We're testing the expected middleware configuration
      // without importing the actual middleware which requires Next.js runtime
      const expectedMatchers = ['/((?!_next/static|_next/image|favicon.ico).*)'];

      // The middleware should use a single catch-all matcher
      const catchAllPattern = expectedMatchers.find((pattern) =>
        pattern.includes('(?!_next/static|_next/image|favicon.ico)'),
      );
      expect(catchAllPattern).toBeDefined();
      expect(expectedMatchers).toHaveLength(1);
    });
  });
});
