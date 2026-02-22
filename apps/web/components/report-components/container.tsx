'use client';

import type { ComponentConfig } from '@puckeditor/core';
import { useStyleGuide } from '@/contexts/style-guide-context';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';
import { resolveStylableValue, type StylableValue } from '@/lib/types/style-system';

export type ContainerProps = {
  padding: string;
  borderWidth: string;
  borderColor: StylableValue | string;
  borderRadius: string;
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
    padding: {
      type: 'text',
      label: 'Padding (px)',
    },
    borderWidth: {
      type: 'text',
      label: 'Border Width (px)',
    },
    borderColor: {
      type: 'text',
      label: 'Border Color',
    },
    borderRadius: {
      type: 'text',
      label: 'Border Radius (px)',
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color',
    },
    shadow: {
      type: 'select',
      label: 'Shadow',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
    minHeight: {
      type: 'text',
      label: 'Min Height (px)',
    },
    pageBreakBehavior: pageBreakField,
    visibilityCondition: {
      type: 'textarea',
      label: 'Visibility Condition (JSON)',
    },
    styleConditions: {
      type: 'textarea',
      label: 'Style Conditions (JSON)',
    },
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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: `${padding}px`,
        borderWidth: `${borderWidth}px`,
        borderStyle: borderWidth !== '0' ? 'solid' : 'none',
        borderColor: resolvedBorderColor,
        borderRadius: `${borderRadius}px`,
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
