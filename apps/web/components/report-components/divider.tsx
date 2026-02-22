'use client';

import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';
import { useStyleGuide } from '@/contexts/style-guide-context';
import { resolveStylableValue, type StylableValue } from '@/lib/types/style-system';

export type DividerProps = {
  orientation: 'horizontal' | 'vertical';
  color: StylableValue | string;
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
  render: (props) => <DividerRender {...props} />,
};

// Wrapper component to use hooks for token resolution
function DividerRender({ orientation, color, thickness, lineStyle, pageBreakBehavior }: Omit<DividerProps, 'visibilityCondition'>) {
  const { tokens } = useStyleGuide();
  const resolvedColor = resolveStylableValue(color, tokens) ?? '#e5e7eb';

  if (orientation === 'vertical') {
    return (
      <div
        style={{
          display: 'inline-block',
          width: `${thickness}px`,
          alignSelf: 'stretch',
          minHeight: '24px',
          borderLeft: `${thickness}px ${lineStyle} ${resolvedColor}`,
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
        borderTop: `${thickness}px ${lineStyle} ${resolvedColor}`,
        borderBottom: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        ...getPageBreakStyle(pageBreakBehavior),
      }}
      className="my-2"
    />
  );
}
