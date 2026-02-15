import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type DividerProps = {
  color: string;
  thickness: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  pageBreakBehavior: PageBreakBehavior;
};

export const Divider: ComponentConfig<DividerProps> = {
  label: 'Divider',
  fields: {
    color: { type: 'text', label: 'Color' },
    thickness: { type: 'text', label: 'Thickness (px)' },
    lineStyle: {
      type: 'select',
      label: 'Style',
      options: [
        { label: 'Solid', value: 'solid' },
        { label: 'Dashed', value: 'dashed' },
        { label: 'Dotted', value: 'dotted' },
      ],
    },
    pageBreakBehavior: pageBreakField,
  },
  defaultProps: {
    color: '#e5e7eb',
    thickness: '1',
    lineStyle: 'solid',
    pageBreakBehavior: 'auto',
  },
  render: ({ color, thickness, lineStyle, pageBreakBehavior }) => (
    <hr
      style={{
        borderTop: `${thickness}px ${lineStyle} ${color}`,
        borderBottom: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        ...getPageBreakStyle(pageBreakBehavior),
      }}
      className="my-2"
    />
  ),
};
