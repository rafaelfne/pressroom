'use client';

import type { ComponentConfig } from '@puckeditor/core';
import { useStyleGuide } from '@/contexts/style-guide-context';
import { getPageBreakStyle, type PageBreakBehavior } from '@/lib/utils/page-break';
import { textField, selectField, textareaField, pageBreakCustomField } from '@/components/puck-fields/field-helpers';
import { resolveStylableValue, type StylableValue } from '@/lib/types/style-system';

export type ContainerProps = {
  padding: StylableValue | string;
  borderWidth: StylableValue | string;
  borderColor: StylableValue | string;
  borderRadius: StylableValue | string;
  backgroundColor: StylableValue | string;
  shadow: 'none' | 'sm' | 'md' | 'lg';
  minHeight: string;
  pageBreakBehavior: PageBreakBehavior;
  visibilityCondition: string;
  styleConditions: string;
};

const shadowMap: Record<ContainerProps['shadow'], string> = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.15)',
};

export const Container: ComponentConfig<ContainerProps> = {
  label: 'Container',
  fields: {
    padding: textField('Padding (px)'),
    borderWidth: textField('Border Width (px)'),
    borderColor: textField('Border Color'),
    borderRadius: textField('Border Radius (px)'),
    backgroundColor: textField('Background Color'),
    shadow: selectField('Shadow', [
      { label: 'None', value: 'none' },
      { label: 'Small', value: 'sm' },
      { label: 'Medium', value: 'md' },
      { label: 'Large', value: 'lg' },
    ]),
    minHeight: textField('Min Height (px)'),
    pageBreakBehavior: pageBreakCustomField,
    visibilityCondition: textareaField('Visibility Condition (JSON)'),
    styleConditions: textareaField('Style Conditions (JSON)'),
  },
  defaultProps: {
    padding: '16',
    borderWidth: '0',
    borderColor: '#e5e7eb',
    borderRadius: '0',
    backgroundColor: 'transparent',
    shadow: 'none',
    minHeight: '40',
    pageBreakBehavior: 'auto',
    visibilityCondition: '',
    styleConditions: '',
  },
  render: (props) => <ContainerRender {...props} />,
};

function ContainerRender({
  padding,
  borderWidth,
  borderColor,
  borderRadius,
  backgroundColor,
  shadow,
  minHeight,
  pageBreakBehavior,
  puck,
  id = 'container',
}: Omit<ContainerProps, 'visibilityCondition' | 'styleConditions'> & { puck: { renderDropZone: (opts: { zone: string }) => React.ReactNode }; id?: string }) {
  const { tokens } = useStyleGuide();
  const resolvedBackgroundColor = resolveStylableValue(backgroundColor, tokens) ?? 'transparent';
  const resolvedBorderColor = resolveStylableValue(borderColor, tokens) ?? '#e5e7eb';
  const resolvedBorderRadius = resolveStylableValue(borderRadius, tokens) ?? '0';
  const resolvedBorderWidth = resolveStylableValue(borderWidth, tokens) ?? '0';
  const resolvedPadding = resolveStylableValue(padding, tokens) ?? '16';

  const addPx = (v: string) => /[a-z%]/i.test(v) ? v : `${v}px`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: addPx(resolvedPadding),
        borderWidth: addPx(resolvedBorderWidth),
        borderStyle: resolvedBorderWidth !== '0' ? 'solid' : 'none',
        borderColor: resolvedBorderColor,
        borderRadius: resolvedBorderRadius.includes('px') ? resolvedBorderRadius : `${resolvedBorderRadius}px`,
        backgroundColor: resolvedBackgroundColor,
        boxShadow: shadowMap[shadow],
        minHeight: `${minHeight}px`,
        ...getPageBreakStyle(pageBreakBehavior),
      }}
    >
      {puck.renderDropZone({ zone: `${id}-content` })}
    </div>
  );
}
