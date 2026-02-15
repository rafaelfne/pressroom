/**
 * Extract initials from a user name.
 * - "John Doe" → "JD"
 * - "John" → "J"
 * - "" or null/undefined → "?"
 * - "John Michael Doe" → "JD" (first and last)
 * - Max 2 characters
 */
export function getInitials(name: string | null | undefined): string {
  if (!name || name.trim() === '') {
    return '?';
  }

  const trimmedName = name.trim();
  const words = trimmedName.split(/\s+/).filter((word) => word.length > 0);

  if (words.length === 0) {
    return '?';
  }

  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }

  // Multiple words: take first letter of first word and first letter of last word
  const first = words[0][0].toUpperCase();
  const last = words[words.length - 1][0].toUpperCase();
  return first + last;
}

/**
 * Generate a consistent HSL background color from a string (user ID or email).
 * Uses a simple hash to get a hue value (0-360), with fixed saturation and lightness
 * for readable white text on top.
 * Returns an HSL color string like "hsl(210, 70%, 50%)"
 * For null/undefined input, return a default gray.
 */
export function getAvatarColor(identifier: string | null | undefined): string {
  if (!identifier || identifier.trim() === '') {
    return 'hsl(0, 0%, 60%)';
  }

  // Simple hash function to generate a consistent number from a string
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert hash to hue (0-360)
  const hue = Math.abs(hash) % 360;

  // Fixed saturation and lightness for good contrast with white text
  return `hsl(${hue}, 70%, 50%)`;
}
