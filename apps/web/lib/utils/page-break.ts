import type { CSSProperties } from 'react';

export type PageBreakBehavior = 'auto' | 'avoid' | 'before' | 'after';

/**
 * Compute CSS properties for the given page break behavior.
 * Returns an empty object for 'auto' (browser decides).
 */
export function getPageBreakStyle(behavior: PageBreakBehavior): CSSProperties {
  if (behavior === 'avoid') {
    return { pageBreakInside: 'avoid' };
  }
  if (behavior === 'before') {
    return { pageBreakBefore: 'always' };
  }
  if (behavior === 'after') {
    return { pageBreakAfter: 'always' };
  }
  return {};
}

export const pageBreakField = {
  type: 'select' as const,
  label: 'Page Break',
  options: [
    { label: 'Auto', value: 'auto' },
    { label: 'Avoid Split', value: 'avoid' },
    { label: 'Break Before', value: 'before' },
    { label: 'Break After', value: 'after' },
  ],
};
