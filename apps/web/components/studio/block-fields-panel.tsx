'use client';

import * as React from 'react';
import { type createUsePuck } from '@puckeditor/core';
import { Button } from '@/components/ui/button';
import { PageBreakSelector } from './page-break-selector';
import { PdfWarnings } from './pdf-warnings';
import { ChevronLeft } from 'lucide-react';

export interface BlockFieldsPanelProps {
  usePuck: ReturnType<typeof createUsePuck>;
  componentType: string;
  componentProps?: Record<string, unknown>;
  children?: React.ReactNode;
}

/**
 * Panel that wraps Puck.Fields when a component is selected.
 * Includes back button, component type header, page break behavior, and PDF warnings.
 */
export function BlockFieldsPanel({
  usePuck,
  componentType,
  componentProps = {},
  children,
}: BlockFieldsPanelProps) {
  const dispatch = usePuck((s) => s.dispatch);

  // Page break behavior state is local to this component for MVP.
  // Persistence will be added when page break behavior is stored in Puck component props.
  const [pageBreakBehavior, setPageBreakBehavior] = React.useState<
    'auto' | 'avoid' | 'before' | 'after'
  >('auto');

  const handleBack = () => {
    dispatch({ type: 'setUi', ui: { itemSelector: null } });
  };

  // Format component type for display (e.g., "ChartBlock" -> "Chart Block", "PDFChart" -> "PDF Chart")
  const formatComponentType = (type: string): string => {
    // Handle acronyms and camelCase/PascalCase properly
    const words = type
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z\d])([A-Z])/g, '$1 $2')
      .trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
  };

  return (
    <div className="space-y-4" data-testid="block-fields-panel">
      {/* Back Button */}
      <div className="p-4 pb-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid="back-button"
          onClick={handleBack}
          className="flex items-center gap-1 -ml-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Component Type Header */}
      <div className="px-4">
        <h3 className="text-sm font-bold" data-testid="component-type-header">
          {formatComponentType(componentType)}
        </h3>
      </div>

      {/* Puck Fields (children) */}
      <div className="px-4">{children}</div>

      {/* Page Break Behavior Section */}
      <div className="px-4 space-y-3 border-t border-border pt-4">
        <h4 className="text-xs font-medium text-muted-foreground">
          Page Break Behavior
        </h4>
        <PageBreakSelector value={pageBreakBehavior} onChange={setPageBreakBehavior} />
      </div>

      {/* PDF Warnings Section */}
      <div className="px-4 border-t border-border pt-4">
        <PdfWarnings componentType={componentType} componentProps={componentProps} />
      </div>
    </div>
  );
}
