import type { ComponentConfig } from '@puckeditor/core';

export type DividerProps = {
  color: string;
  thickness: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  pageBreakBehavior: 'auto' | 'avoid' | 'before' | 'after';
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
    pageBreakBehavior: {
      type: 'select',
      label: 'Page Break',
      options: [
        { label: 'Auto', value: 'auto' },
        { label: 'Avoid Split', value: 'avoid' },
        { label: 'Break Before', value: 'before' },
        { label: 'Break After', value: 'after' },
      ],
    },
  },
  defaultProps: {
    color: '#e5e7eb',
    thickness: '1',
    lineStyle: 'solid',
    pageBreakBehavior: 'auto',
  },
  render: ({ color, thickness, lineStyle, pageBreakBehavior }) => {
    const pageBreakStyle: React.CSSProperties = {};
    if (pageBreakBehavior === 'avoid') {
      pageBreakStyle.pageBreakInside = 'avoid';
    } else if (pageBreakBehavior === 'before') {
      pageBreakStyle.pageBreakBefore = 'always';
    } else if (pageBreakBehavior === 'after') {
      pageBreakStyle.pageBreakAfter = 'always';
    }

    return (
      <hr
        style={{
          borderTop: `${thickness}px ${lineStyle} ${color}`,
          borderBottom: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          ...pageBreakStyle,
        }}
        className="my-2"
      />
    );
  },
};
