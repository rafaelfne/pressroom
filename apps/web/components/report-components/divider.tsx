import type { ComponentConfig } from '@puckeditor/core';

export type DividerProps = {
  color: string;
  thickness: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
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
  },
  defaultProps: {
    color: '#e5e7eb',
    thickness: '1',
    lineStyle: 'solid',
  },
  render: ({ color, thickness, lineStyle }) => (
    <hr
      style={{
        borderTop: `${thickness}px ${lineStyle} ${color}`,
        borderBottom: 'none',
        borderLeft: 'none',
        borderRight: 'none',
      }}
      className="my-2"
    />
  ),
};
