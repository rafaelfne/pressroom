'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface PdfWarningsProps {
  componentType: string;
  componentProps?: Record<string, unknown>;
}

/**
 * Contextual warnings for PDF rendering based on component type and props.
 */
export function PdfWarnings({ componentType, componentProps = {} }: PdfWarningsProps) {
  const warnings: string[] = [];

  // Memoize componentProps string to avoid expensive JSON.stringify on every render
  const propsStr = React.useMemo(
    () => JSON.stringify(componentProps).toLowerCase(),
    [componentProps],
  );

  // Chart warnings
  if (componentType.toLowerCase().includes('chart')) {
    const hasExplicitHeight =
      typeof componentProps.height === 'number' ||
      (typeof componentProps.height === 'string' &&
        componentProps.height.trim() !== '');

    if (!hasExplicitHeight) {
      warnings.push('Set explicit height for PDF rendering');
    }

    // Check for ResponsiveContainer (common pattern in chart props)
    if (propsStr.includes('responsive')) {
      warnings.push('Use fixed dimensions for reliable PDF output');
    }
  }

  // Image warnings
  if (componentType.toLowerCase().includes('image')) {
    const src = componentProps.src;
    if (
      typeof src === 'string' &&
      (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//'))
    ) {
      warnings.push('External images are converted to base64 in PDF');
    }
  }

  // Table warnings
  if (componentType.toLowerCase().includes('table') || componentType.toLowerCase().includes('data')) {
    const hasLargeDataset = Array.isArray(componentProps.data) && componentProps.data.length > 100;
    if (hasLargeDataset) {
      warnings.push('Large datasets may cause pagination issues in PDF');
    }
  }

  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2" data-testid="pdf-warnings">
      <h4 className="text-xs font-medium text-muted-foreground">PDF Warnings</h4>
      <div className="space-y-2">
        {warnings.map((warning, index) => (
          <div
            key={index}
            className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800"
            data-testid={`pdf-warning-${index}`}
          >
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>{warning}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
