'use client';

import { useMemo } from 'react';
import { useSampleData } from '@/contexts/sample-data-context';
import { resolveBindings } from '@/lib/binding';

/**
 * Hook that resolves {{...}} binding expressions in a string using sample data
 * from the SampleDataContext.
 *
 * In the studio editor: sampleData is provided → expressions are resolved and
 * the formatted values are displayed live in the canvas.
 *
 * In the PDF/HTML renderer: bindings are already resolved before components render,
 * so the input won't contain "{{...}}" and this hook returns it unchanged.
 * If there's no SampleDataContext (e.g. renderToStaticMarkup), sampleData is
 * undefined and the original value passes through.
 */
export function useResolvedValue(value: string): string {
  const sampleData = useSampleData();

  return useMemo(() => {
    if (!sampleData || !value || !value.includes('{{')) {
      return value;
    }

    const resolved = resolveBindings(value, sampleData);
    return String(resolved ?? value);
  }, [value, sampleData]);
}
