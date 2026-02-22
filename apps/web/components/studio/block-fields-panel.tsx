'use client';

import * as React from 'react';
import { PageBreakSelector } from './page-break-selector';
import { PdfWarnings } from './pdf-warnings';

export interface BlockFieldsPanelProps {
  componentType: string;
  componentProps?: Record<string, unknown>;
  children?: React.ReactNode;
}

/**
 * Panel that wraps Puck.Fields when a component is selected.
 * Includes component type header, page break behavior, and PDF warnings.
 */
export function BlockFieldsPanel({
  componentType,
  componentProps = {},
  children,
}: BlockFieldsPanelProps) {

  // Page break behavior state is local to this component for MVP.
  // Persistence will be added when page break behavior is stored in Puck component props.
  const [pageBreakBehavior, setPageBreakBehavior] = React.useState<
    'auto' | 'avoid' | 'before' | 'after'
  >('auto');

  return (
    <div className="space-y-4" data-testid="block-fields-panel">
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
