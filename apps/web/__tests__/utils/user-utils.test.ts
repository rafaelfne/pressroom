import { describe, it, expect } from 'vitest';
import { getInitials, getAvatarColor } from '@/lib/utils/user-utils';

describe('getInitials', () => {
  it('returns "JD" for "John Doe"', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('returns "J" for single word "John"', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('returns "?" for empty string', () => {
    expect(getInitials('')).toBe('?');
  });

  it('returns "?" for null', () => {
    expect(getInitials(null)).toBe('?');
  });

  it('returns "?" for undefined', () => {
    expect(getInitials(undefined)).toBe('?');
  });

  it('returns "JD" for "John Michael Doe" (first and last)', () => {
    expect(getInitials('John Michael Doe')).toBe('JD');
  });

  it('returns "?" for whitespace-only string', () => {
    expect(getInitials('   ')).toBe('?');
  });

  it('handles extra whitespace between names', () => {
    expect(getInitials('John    Doe')).toBe('JD');
  });

  it('returns uppercase initials', () => {
    expect(getInitials('john doe')).toBe('JD');
  });

  it('handles leading and trailing whitespace', () => {
    expect(getInitials('  John Doe  ')).toBe('JD');
  });

  it('returns max 2 characters for multiple words', () => {
    const result = getInitials('John Michael Andrew Doe');
    expect(result).toBe('JD');
    expect(result.length).toBe(2);
  });
});

describe('getAvatarColor', () => {
  it('returns consistent color for same input', () => {
    const color1 = getAvatarColor('john@example.com');
    const color2 = getAvatarColor('john@example.com');
    expect(color1).toBe(color2);
  });

  it('returns different colors for different inputs', () => {
    const color1 = getAvatarColor('john@example.com');
    const color2 = getAvatarColor('jane@example.com');
    expect(color1).not.toBe(color2);
  });

  it('returns HSL color string format', () => {
    const color = getAvatarColor('test@example.com');
    expect(color).toMatch(/^hsl\(\d+,\s*\d+%,\s*\d+%\)$/);
  });

  it('returns default gray for null', () => {
    expect(getAvatarColor(null)).toBe('hsl(0, 0%, 60%)');
  });

  it('returns default gray for undefined', () => {
    expect(getAvatarColor(undefined)).toBe('hsl(0, 0%, 60%)');
  });

  it('returns default gray for empty string', () => {
    expect(getAvatarColor('')).toBe('hsl(0, 0%, 60%)');
  });

  it('returns default gray for whitespace-only string', () => {
    expect(getAvatarColor('   ')).toBe('hsl(0, 0%, 60%)');
  });

  it('generates valid hue values (0-360)', () => {
    const testInputs = ['test1', 'test2', 'test3', 'user@example.com', '12345'];
    testInputs.forEach((input) => {
      const color = getAvatarColor(input);
      const match = color.match(/^hsl\((\d+),/);
      expect(match).not.toBeNull();
      if (match) {
        const hue = parseInt(match[1], 10);
        expect(hue).toBeGreaterThanOrEqual(0);
        expect(hue).toBeLessThan(360);
      }
    });
  });

  it('maintains fixed saturation and lightness', () => {
    const color = getAvatarColor('test@example.com');
    expect(color).toContain('70%');
    expect(color).toContain('50%');
  });
});
