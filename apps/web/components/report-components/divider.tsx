import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type DividerProps = {
  orientation: 'horizontal' | 'vertical';
  color: string;
  thickness: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  pageBreakBehavior: PageBreakBehavior;
  visibilityCondition: string;
};

export const Divider: ComponentConfig<DividerProps> = {
  label: 'Divider',
  fields: {
    orientation: {
      type: 'select',
      label: 'Orientation',
      options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ],
    },
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
    visibilityCondition: {
      type: 'textarea',
      label: 'Visibility Condition (JSON)',
    },
  },
  defaultProps: {
    orientation: 'horizontal',
    color: '#e5e7eb',
    thickness: '1',
    lineStyle: 'solid',
    pageBreakBehavior: 'auto',
    visibilityCondition: '',
  },
  render: ({ orientation, color, thickness, lineStyle, pageBreakBehavior }) => {
    if (orientation === 'vertical') {
      return (
        <div
          style={{
            display: 'inline-block',
            width: `${thickness}px`,
            alignSelf: 'stretch',
            minHeight: '24px',
            borderLeft: `${thickness}px ${lineStyle} ${color}`,
            ...getPageBreakStyle(pageBreakBehavior),
          }}
          className="mx-2"
          role="separator"
          aria-orientation="vertical"
        />
      );
    }

    return (
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
    );
  },
};
