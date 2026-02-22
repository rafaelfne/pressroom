'use client';

import type { ComponentConfig } from '@puckeditor/core';
import { InheritedStylesProvider } from '@/contexts/inherited-styles-context';
import { useStyleGuide } from '@/contexts/style-guide-context';
import { getPageBreakStyle, type PageBreakBehavior } from '@/lib/utils/page-break';
import { textField, selectField, textareaField, pageBreakCustomField } from '@/components/puck-fields/field-helpers';
import { resolveStylableValue, resolveSpacing, type StylableValue, type SpacingValue } from '@/lib/types/style-system';

const DEFAULT_PADDING = '0';

export type FlexBoxProps = {
  direction: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  wrap: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gap: StylableValue | string;
  padding: StylableValue | string;
  paddingTop: StylableValue | string;
  paddingRight: StylableValue | string;
  paddingBottom: StylableValue | string;
  paddingLeft: StylableValue | string;
  backgroundColor: StylableValue | string;
  borderWidth: StylableValue | string;
  borderColor: StylableValue | string;
  borderRadius: StylableValue | string;
  minHeight: string;
  color: StylableValue | string;
  fontSize: StylableValue | string;
  fontFamily: StylableValue | string;
  pageBreakBehavior: PageBreakBehavior;
  visibilityCondition: string;
  styleConditions: string;
};

export const FlexBox: ComponentConfig<FlexBoxProps> = {
  label: 'FlexBox',
  fields: {
    direction: selectField('Direction', [
      { label: 'Row', value: 'row' },
      { label: 'Column', value: 'column' },
      { label: 'Row Reverse', value: 'row-reverse' },
      { label: 'Column Reverse', value: 'column-reverse' },
    ]),
    wrap: selectField('Wrap', [
      { label: 'No Wrap', value: 'nowrap' },
      { label: 'Wrap', value: 'wrap' },
      { label: 'Wrap Reverse', value: 'wrap-reverse' },
    ]),
    justifyContent: selectField('Justify Content', [
      { label: 'Flex Start', value: 'flex-start' },
      { label: 'Flex End', value: 'flex-end' },
      { label: 'Center', value: 'center' },
      { label: 'Space Between', value: 'space-between' },
      { label: 'Space Around', value: 'space-around' },
      { label: 'Space Evenly', value: 'space-evenly' },
    ]),
    alignItems: selectField('Align Items', [
      { label: 'Flex Start', value: 'flex-start' },
      { label: 'Flex End', value: 'flex-end' },
      { label: 'Center', value: 'center' },
      { label: 'Stretch', value: 'stretch' },
      { label: 'Baseline', value: 'baseline' },
    ]),
    gap: textField('Gap (px)'),
    padding: textField('Padding (px)'),
    paddingTop: textField('Padding Top (px)'),
    paddingRight: textField('Padding Right (px)'),
    paddingBottom: textField('Padding Bottom (px)'),
    paddingLeft: textField('Padding Left (px)'),
    backgroundColor: textField('Background Color'),
    borderWidth: textField('Border Width (px)'),
    borderColor: textField('Border Color'),
    borderRadius: textField('Border Radius (px)'),
    minHeight: textField('Min Height (px)'),
    color: textField('Text Color'),
    fontSize: textField('Font Size'),
    fontFamily: textField('Font Family'),
    pageBreakBehavior: pageBreakCustomField,
    visibilityCondition: textareaField('Visibility Condition (JSON)'),
    styleConditions: textareaField('Style Conditions (JSON)'),
  },
  defaultProps: {
    direction: 'column',
    wrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    gap: '0',
    padding: DEFAULT_PADDING,
    paddingTop: '',
    paddingRight: '',
    paddingBottom: '',
    paddingLeft: '',
    backgroundColor: 'transparent',
    borderWidth: '0',
    borderColor: '#e5e7eb',
    borderRadius: '0',
    minHeight: '0',
    color: '',
    fontSize: '',
    fontFamily: '',
    pageBreakBehavior: 'auto',
    visibilityCondition: '',
    styleConditions: '',
  },
  render: (props) => <FlexBoxRender {...props} />,
};

// Wrapper component to use hooks for token resolution
function FlexBoxRender({
  direction,
  wrap,
  justifyContent,
  alignItems,
  gap,
  padding,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  backgroundColor,
  borderWidth,
  borderColor,
  borderRadius,
  minHeight,
  color,
  fontSize,
  fontFamily,
  pageBreakBehavior,
  puck,
  id = 'flexbox',
}: Omit<FlexBoxProps, 'visibilityCondition' | 'styleConditions'> & { puck: { renderDropZone: (opts: { zone: string }) => React.ReactNode }; id?: string }) {
  // Resolve StylableValue properties
  const { tokens } = useStyleGuide();
  const resolvedBackgroundColor = resolveStylableValue(backgroundColor, tokens) ?? 'transparent';
  const resolvedBorderColor = resolveStylableValue(borderColor, tokens) ?? '#e5e7eb';
  const resolvedColor = resolveStylableValue(color, tokens) ?? '';
  const resolvedBorderWidth = resolveStylableValue(borderWidth, tokens) ?? '0';
  const resolvedBorderRadius = resolveStylableValue(borderRadius, tokens) ?? '0';
  const resolvedGap = resolveStylableValue(gap, tokens) ?? '0';
  const resolvedFontSize = resolveStylableValue(fontSize, tokens) ?? '';
  const resolvedFontFamily = resolveStylableValue(fontFamily, tokens) ?? '';

  // Build inheritable styles object, only including non-empty values
  const inheritableStyles: Record<string, string> = {};
  if (resolvedColor) inheritableStyles.color = resolvedColor;
  if (resolvedFontSize) inheritableStyles.fontSize = resolvedFontSize;
  if (resolvedFontFamily) inheritableStyles.fontFamily = resolvedFontFamily;

  const content = puck.renderDropZone({ zone: `${id}-content` });

  // Resolve padding using SpacingValue utility
  const rPadding = resolveStylableValue(padding, tokens) ?? DEFAULT_PADDING;
  const rPaddingTop = resolveStylableValue(paddingTop, tokens) ?? '';
  const rPaddingRight = resolveStylableValue(paddingRight, tokens) ?? '';
  const rPaddingBottom = resolveStylableValue(paddingBottom, tokens) ?? '';
  const rPaddingLeft = resolveStylableValue(paddingLeft, tokens) ?? '';

  const addPx = (v: string) => /[a-z%]/i.test(v) ? v : `${v}px`;

  const spacingValue: SpacingValue = (rPaddingTop || rPaddingRight || rPaddingBottom || rPaddingLeft)
    ? { mode: 'individual', top: addPx(rPaddingTop || '0'), right: addPx(rPaddingRight || '0'), bottom: addPx(rPaddingBottom || '0'), left: addPx(rPaddingLeft || '0') }
    : { mode: 'all', all: addPx(rPadding) };
  const finalPadding = resolveSpacing(spacingValue) ?? '0px';

  const borderWidthCss = /[a-z%]/i.test(resolvedBorderWidth) ? resolvedBorderWidth : `${resolvedBorderWidth}px`;
  const borderRadiusCss = /[a-z%]/i.test(resolvedBorderRadius) ? resolvedBorderRadius : `${resolvedBorderRadius}px`;
  const gapCss = /[a-z%]/i.test(resolvedGap) ? resolvedGap : `${resolvedGap}px`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction,
        flexWrap: wrap,
        justifyContent,
        alignItems,
        gap: gapCss,
        padding: finalPadding,
        backgroundColor: resolvedBackgroundColor,
        borderWidth: borderWidthCss,
        borderStyle: resolvedBorderWidth !== '0' ? 'solid' : 'none',
        borderColor: resolvedBorderColor,
        borderRadius: borderRadiusCss,
        minHeight: `${minHeight}px`,
        ...getPageBreakStyle(pageBreakBehavior),
      }}
    >
      {Object.keys(inheritableStyles).length > 0 ? (
        <InheritedStylesProvider styles={inheritableStyles}>{content}</InheritedStylesProvider>
      ) : (
        content
      )}
    </div>
  );
}
