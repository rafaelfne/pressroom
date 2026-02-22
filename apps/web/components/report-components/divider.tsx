'use client';

import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, type PageBreakBehavior } from '@/lib/utils/page-break';
import { textField, selectField, textareaField, pageBreakCustomField } from '@/components/puck-fields/field-helpers';
import { useStyleGuide } from '@/contexts/style-guide-context';
import { resolveStylableValue, type StylableValue } from '@/lib/types/style-system';

export type DividerProps = {
  orientation: 'horizontal' | 'vertical';
  color: StylableValue | string;
  thickness: StylableValue | string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  pageBreakBehavior: PageBreakBehavior;
  visibilityCondition: string;
};

export const Divider: ComponentConfig<DividerProps> = {
  label: 'Divider',
  fields: {
    orientation: selectField('Orientation', [
      { label: 'Horizontal', value: 'horizontal' },
      { label: 'Vertical', value: 'vertical' },
    ]),
    color: textField('Color'),
    thickness: textField('Thickness (px)'),
    lineStyle: selectField('Style', [
      { label: 'Solid', value: 'solid' },
      { label: 'Dashed', value: 'dashed' },
      { label: 'Dotted', value: 'dotted' },
    ]),
    pageBreakBehavior: pageBreakCustomField,
    visibilityCondition: textareaField('Visibility Condition (JSON)'),
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
  const resolvedThickness = resolveStylableValue(thickness, tokens) ?? '1';
  const thicknessCss = /[a-z%]/i.test(resolvedThickness) ? resolvedThickness : `${resolvedThickness}px`;

  if (orientation === 'vertical') {
    return (
      <div
        style={{
          display: 'inline-block',
          width: thicknessCss,
          alignSelf: 'stretch',
          minHeight: '24px',
          borderLeft: `${thicknessCss} ${lineStyle} ${resolvedColor}`,
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
        borderTop: `${thicknessCss} ${lineStyle} ${resolvedColor}`,
        borderBottom: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        ...getPageBreakStyle(pageBreakBehavior),
      }}
      className="my-2"
    />
  );
}
