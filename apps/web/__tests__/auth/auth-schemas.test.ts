import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '@/lib/validation/auth-schemas';

describe('Auth Schemas', () => {
  describe('loginSchema', () => {
    it('validates correct login input', () => {
      const validInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('rejects invalid email', () => {
      const invalidInput = {
        email: 'not-an-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });

    it('rejects empty password', () => {
      const invalidInput = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is required');
      }
    });

    it('rejects missing fields', () => {
      const invalidInput = {
        email: 'test@example.com',
      };

      const result = loginSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('validates correct registration input', () => {
      const validInput = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = registerSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('rejects invalid email', () => {
      const invalidInput = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'not-an-email',
        password: 'password123',
      };

      const result = registerSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });

    it('rejects name that is too short', () => {
      const invalidInput = {
        name: 'J',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = registerSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name must be at least 2 characters');
      }
    });

    it('rejects password that is too short', () => {
      const invalidInput = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'pass',
      };

      const result = registerSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
      }
    });

    it('rejects missing fields', () => {
      const invalidInput = {
        email: 'john@example.com',
        password: 'password123',
      };

      const result = registerSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});
