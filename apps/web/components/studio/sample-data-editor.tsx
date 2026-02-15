'use client';

import { useState, useCallback, useEffect } from 'react';

export interface SampleDataEditorProps {
  value: string;
  onChange: (value: string) => void;
  onValidChange?: (data: Record<string, unknown>) => void;
}

export function SampleDataEditor({
  value,
  onChange,
  onValidChange,
}: SampleDataEditorProps) {
  // State for validation error
  const [error, setError] = useState<string | null>(null);

  // Validate JSON on value change
  const validate = useCallback(
    (jsonString: string) => {
      if (!jsonString.trim()) {
        setError('JSON cannot be empty');
        return;
      }

      try {
        const parsed = JSON.parse(jsonString) as Record<string, unknown>;
        setError(null);
        onValidChange?.(parsed);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Invalid JSON';
        setError(errorMessage);
      }
    },
    [onValidChange],
  );

  useEffect(() => {
    validate(value);
  }, [value, validate]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col gap-2" data-testid="sample-data-editor">
      <textarea
        value={value}
        onChange={handleChange}
        className="min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder='{"key": "value"}'
        spellCheck={false}
        data-testid="sample-data-textarea"
      />
      {error ? (
        <p className="text-xs text-destructive" data-testid="validation-error">
          {error}
        </p>
      ) : (
        <p className="text-xs text-green-600" data-testid="validation-success">
          ✓ Valid JSON
        </p>
      )}
    </div>
  );
}
