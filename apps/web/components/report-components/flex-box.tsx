import type { ComponentConfig } from '@puckeditor/core';
import { InheritedStylesProvider } from '@/contexts/inherited-styles-context';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type FlexBoxProps = {
  direction: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  wrap: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gap: string;
  padding: string;
  paddingTop: string;
  paddingRight: string;
  paddingBottom: string;
  paddingLeft: string;
  backgroundColor: string;
  borderWidth: string;
  borderColor: string;
  borderRadius: string;
  minHeight: string;
  color: string;
  fontSize: string;
  fontFamily: string;
  pageBreakBehavior: PageBreakBehavior;
  visibilityCondition: string;
};

export const FlexBox: ComponentConfig<FlexBoxProps> = {
  label: 'FlexBox',
  fields: {
    direction: {
      type: 'select',
      label: 'Direction',
      options: [
        { label: 'Row', value: 'row' },
        { label: 'Column', value: 'column' },
        { label: 'Row Reverse', value: 'row-reverse' },
        { label: 'Column Reverse', value: 'column-reverse' },
      ],
    },
    wrap: {
      type: 'select',
      label: 'Wrap',
      options: [
        { label: 'No Wrap', value: 'nowrap' },
        { label: 'Wrap', value: 'wrap' },
        { label: 'Wrap Reverse', value: 'wrap-reverse' },
      ],
    },
    justifyContent: {
      type: 'select',
      label: 'Justify Content',
      options: [
        { label: 'Flex Start', value: 'flex-start' },
        { label: 'Flex End', value: 'flex-end' },
        { label: 'Center', value: 'center' },
        { label: 'Space Between', value: 'space-between' },
        { label: 'Space Around', value: 'space-around' },
        { label: 'Space Evenly', value: 'space-evenly' },
      ],
    },
    alignItems: {
      type: 'select',
      label: 'Align Items',
      options: [
        { label: 'Flex Start', value: 'flex-start' },
        { label: 'Flex End', value: 'flex-end' },
        { label: 'Center', value: 'center' },
        { label: 'Stretch', value: 'stretch' },
        { label: 'Baseline', value: 'baseline' },
      ],
    },
    gap: {
      type: 'text',
      label: 'Gap (px)',
    },
    padding: {
      type: 'text',
      label: 'Padding (px)',
    },
    paddingTop: {
      type: 'text',
      label: 'Padding Top (px)',
    },
    paddingRight: {
      type: 'text',
      label: 'Padding Right (px)',
    },
    paddingBottom: {
      type: 'text',
      label: 'Padding Bottom (px)',
    },
    paddingLeft: {
      type: 'text',
      label: 'Padding Left (px)',
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color',
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
    minHeight: {
      type: 'text',
      label: 'Min Height (px)',
    },
    color: {
      type: 'text',
      label: 'Text Color',
    },
    fontSize: {
      type: 'text',
      label: 'Font Size',
    },
    fontFamily: {
      type: 'text',
      label: 'Font Family',
    },
    pageBreakBehavior: pageBreakField,
    visibilityCondition: {
      type: 'textarea',
      label: 'Visibility Condition (JSON)',
    },
  },
  defaultProps: {
    direction: 'column',
    wrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    gap: '0',
    padding: '0',
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
  },
  render: ({
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
  }) => {
    // Build inheritable styles object, only including non-empty values
    const inheritableStyles: Record<string, string> = {};
    if (color) inheritableStyles.color = color;
    if (fontSize) inheritableStyles.fontSize = fontSize;
    if (fontFamily) inheritableStyles.fontFamily = fontFamily;

    const content = puck.renderDropZone({ zone: `${id}-content` });

    // Resolve padding: individual values override the "all sides" value
    let finalPadding: string;
    if (paddingTop || paddingRight || paddingBottom || paddingLeft) {
      // At least one individual padding is set - use CSS shorthand
      finalPadding = `${paddingTop || '0'}px ${paddingRight || '0'}px ${paddingBottom || '0'}px ${paddingLeft || '0'}px`;
    } else {
      // Use the "all sides" padding value
      finalPadding = `${padding}px`;
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: direction,
          flexWrap: wrap,
          justifyContent,
          alignItems,
          gap: `${gap}px`,
          padding: finalPadding,
          backgroundColor,
          borderWidth: `${borderWidth}px`,
          borderStyle: borderWidth !== '0' ? 'solid' : 'none',
          borderColor,
          borderRadius: `${borderRadius}px`,
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
  },
};
