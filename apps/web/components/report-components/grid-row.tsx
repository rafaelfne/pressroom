import type { ComponentConfig } from '@puckeditor/core';
import { DropZone } from '@puckeditor/core';

export type GridRowProps = {
  columns: '2-equal' | '3-equal' | '4-equal' | '1-3_2-3' | '2-3_1-3' | 'custom';
  customColumns: string;
  gap: string;
  id?: string;
};

type ColumnConfig = {
  template: string;
  count: number;
};

const columnMap: Record<Exclude<GridRowProps['columns'], 'custom'>, ColumnConfig> = {
  '2-equal': { template: '1fr 1fr', count: 2 },
  '3-equal': { template: '1fr 1fr 1fr', count: 3 },
  '4-equal': { template: '1fr 1fr 1fr 1fr', count: 4 },
  '1-3_2-3': { template: '1fr 2fr', count: 2 },
  '2-3_1-3': { template: '2fr 1fr', count: 2 },
};

export const GridRow: ComponentConfig<GridRowProps> = {
  label: 'Grid Row',
  fields: {
    columns: {
      type: 'select',
      label: 'Column Layout',
      options: [
        { label: '2 Equal (1/2 + 1/2)', value: '2-equal' },
        { label: '3 Equal (1/3 + 1/3 + 1/3)', value: '3-equal' },
        { label: '4 Equal (1/4 × 4)', value: '4-equal' },
        { label: 'Narrow + Wide (1/3 + 2/3)', value: '1-3_2-3' },
        { label: 'Wide + Narrow (2/3 + 1/3)', value: '2-3_1-3' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    customColumns: {
      type: 'text',
      label: 'Custom Columns (CSS grid-template-columns)',
    },
    gap: {
      type: 'text',
      label: 'Gap (px)',
    },
  },
  defaultProps: {
    columns: '2-equal',
    customColumns: '',
    gap: '16',
  },
  render: ({ columns, customColumns, gap, id = 'grid-row' }) => {
    let template: string;
    let count: number;

    if (columns === 'custom') {
      template = customColumns || '1fr 1fr';
      // Simple space-based parsing (supports basic syntax like "1fr 2fr 1fr")
      // Note: Does not support complex CSS like minmax(), repeat(), fit-content(), etc.
      // For complex layouts, use the preset options or ensure proper space-separated values.
      
      // Attempt to parse column count from simple space-separated values
      // This is intentionally simple and will fallback to 2 columns for complex syntax
      const tokens = template.split(/\s+/).filter(Boolean);
      
      // Check if it looks like complex syntax (contains parentheses, commas)
      const hasComplexSyntax = /[(),]/.test(template);
      
      if (hasComplexSyntax) {
        // For complex syntax, default to 2 columns and let CSS handle the layout
        // User should use preset layouts for predictable DropZone generation
        count = 2;
      } else {
        // Simple space-separated values like "1fr 2fr" or "100px 1fr 2fr"
        count = tokens.length;
      }
    } else {
      const config = columnMap[columns];
      template = config.template;
      count = config.count;
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: template,
          gap: `${gap}px`,
        }}
      >
        {Array.from({ length: count }, (_, i) => (
          <div key={i} style={{ minHeight: '40px' }}>
            <DropZone zone={`${id}-column-${i}`} minEmptyHeight={40} />
          </div>
        ))}
      </div>
    );
  },
};
