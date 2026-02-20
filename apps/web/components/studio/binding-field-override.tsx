'use client';

import { useCallback } from 'react';
import { BindingAutocomplete } from './binding-autocomplete';
import { BindingPathExplorer } from './binding-path-explorer';

export interface BindingFieldOverrideProps {
  value: string;
  onChange: (value: string) => void;
  sampleData?: Record<string, unknown>;
  placeholder?: string;
  multiline?: boolean;
}

/**
 * Custom Puck field override for binding inputs.
 * Combines the autocomplete input with the path explorer button.
 */
export function BindingFieldOverride({
  value,
  onChange,
  sampleData,
  placeholder = 'Type {{ to insert binding...',
  multiline = false,
}: BindingFieldOverrideProps) {
  const handlePathSelect = useCallback(
    (path: string) => {
      // Insert as a binding expression
      const bindingExpression = `{{${path}}}`;

      // If value is empty, just set it; otherwise append
      if (!value) {
        onChange(bindingExpression);
      } else {
        onChange(value + bindingExpression);
      }
    },
    [value, onChange],
  );

  return (
    <div className="flex items-start gap-2" data-testid="binding-field-override">
      <div className="flex-1">
        <BindingAutocomplete
          value={value}
          onChange={onChange}
          sampleData={sampleData}
          placeholder={placeholder}
          multiline={multiline}
        />
      </div>
      <div className="mt-1">
        <BindingPathExplorer
          sampleData={sampleData}
          onSelectPath={handlePathSelect}
        />
      </div>
    </div>
  );
}
