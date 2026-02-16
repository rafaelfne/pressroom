'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';

export interface PageBreakSelectorProps {
  value: 'auto' | 'avoid' | 'before' | 'after';
  onChange: (value: 'auto' | 'avoid' | 'before' | 'after') => void;
}

/**
 * Radio group for selecting page break behavior for a component.
 */
export function PageBreakSelector({ value, onChange }: PageBreakSelectorProps) {
  const options = [
    {
      value: 'auto' as const,
      label: 'Auto',
      description: 'Let the PDF engine decide where to break',
    },
    {
      value: 'avoid' as const,
      label: 'Avoid',
      description: 'Try to keep this block on one page',
    },
    {
      value: 'before' as const,
      label: 'Before',
      description: 'Always start this block on a new page',
    },
    {
      value: 'after' as const,
      label: 'After',
      description: 'Always start a new page after this block',
    },
  ];

  return (
    <div className="space-y-3" data-testid="page-break-selector">
      {options.map((option) => (
        <div key={option.value} className="flex items-start gap-2">
          <input
            id={`page-break-${option.value}`}
            type="radio"
            name="page-break"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            data-testid={`page-break-${option.value}`}
            className="mt-0.5 h-4 w-4 border-gray-300"
          />
          <div className="flex-1">
            <Label
              htmlFor={`page-break-${option.value}`}
              className="text-sm font-medium cursor-pointer"
            >
              {option.label}
            </Label>
            <p className="text-xs text-muted-foreground">{option.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
