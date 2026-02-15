'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SampleDataEditor } from './sample-data-editor';

export interface SampleDataPanelProps {
  sampleData: Record<string, unknown>;
  onSampleDataChange: (data: Record<string, unknown>) => void;
}

export function SampleDataPanel({
  sampleData,
  onSampleDataChange,
}: SampleDataPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(sampleData, null, 2),
  );

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleJsonChange = useCallback((text: string) => {
    setJsonText(text);
  }, []);

  const handleValidChange = useCallback(
    (data: Record<string, unknown>) => {
      onSampleDataChange(data);
    },
    [onSampleDataChange],
  );

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText) as Record<string, unknown>;
      setJsonText(JSON.stringify(parsed, null, 2));
    } catch {
      // If JSON is invalid, don't format
    }
  }, [jsonText]);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        data-testid="sample-data-toggle"
      >
        Sample Data
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        data-testid="sample-data-toggle"
      >
        Close Data
      </Button>
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-96 flex-col border-l bg-background shadow-lg"
        data-testid="sample-data-panel"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Sample Data</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleFormat}>
              Format
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToggle}>
              ×
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-2 text-xs text-muted-foreground">
            Edit JSON data to preview how bindings like{' '}
            <code className="rounded bg-muted px-1">{'{{field}}'}</code>{' '}
            will resolve in the report.
          </p>
          <SampleDataEditor
            value={jsonText}
            onChange={handleJsonChange}
            onValidChange={handleValidChange}
          />
        </div>
      </div>
    </>
  );
}
