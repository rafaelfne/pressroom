import type { ComponentConfig } from '@puckeditor/core';
import { DropZone } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type GridRowProps = {
  columns: '2-equal' | '3-equal' | '4-equal' | '1-3_2-3' | '2-3_1-3' | 'custom';
  customColumns: string;
  gap: string;
  pageBreakBehavior: PageBreakBehavior;
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
    pageBreakBehavior: pageBreakField,
  },
  defaultProps: {
    columns: '2-equal',
    customColumns: '',
    gap: '16',
    pageBreakBehavior: 'auto',
  },
  render: ({ columns, customColumns, gap, pageBreakBehavior, id = 'grid-row' }) => {
    let template: string;
    let count: number;

    if (columns === 'custom') {
      template = customColumns || '1fr 1fr';

      // Parse column count from the template string
      const repeatMatch = template.match(/^repeat\(\s*(\d+)\s*,/);
      if (repeatMatch) {
        // Handle repeat(N, ...) syntax
        count = parseInt(repeatMatch[1], 10);
      } else if (/[(),]/.test(template)) {
        // Other complex syntax (minmax, fit-content, etc.) — fall back to 2
        count = 2;
      } else {
        // Simple space-separated values like "1fr 2fr 1fr"
        count = template.split(/\s+/).filter(Boolean).length;
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
          ...getPageBreakStyle(pageBreakBehavior),
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
