'use client';

import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';
import { useInheritedStyles } from '@/contexts/inherited-styles-context';

const DEFAULT_HEADING_COLOR = '#000000';

export type HeadingBlockProps = {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  color: string;
  fontFamily: string;
  pageBreakBehavior: PageBreakBehavior;
  visibilityCondition: string;
  marginTop: string;
  marginRight: string;
  marginBottom: string;
  marginLeft: string;
};

export const HeadingBlock: ComponentConfig<HeadingBlockProps> = {
  label: 'Heading Block',
  fields: {
    text: { type: 'text', label: 'Heading Text' },
    level: {
      type: 'select',
      label: 'Heading Level',
      options: [
        { label: 'H1', value: 'h1' },
        { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' },
        { label: 'H5', value: 'h5' },
        { label: 'H6', value: 'h6' },
      ],
    },
    color: { type: 'text', label: 'Text Color' },
    fontFamily: { type: 'text', label: 'Font Family' },
    pageBreakBehavior: pageBreakField,
    visibilityCondition: {
      type: 'textarea',
      label: 'Visibility Condition (JSON)',
    },
    marginTop: {
      type: 'text',
      label: 'Margin Top',
    },
    marginRight: {
      type: 'text',
      label: 'Margin Right',
    },
    marginBottom: {
      type: 'text',
      label: 'Margin Bottom',
    },
    marginLeft: {
      type: 'text',
      label: 'Margin Left',
    },
  },
  defaultProps: {
    text: 'Heading',
    level: 'h2',
    color: DEFAULT_HEADING_COLOR,
    fontFamily: '',
    pageBreakBehavior: 'auto',
    visibilityCondition: '',
    marginTop: '0',
    marginRight: '0',
    marginBottom: '0',
    marginLeft: '0',
  },
  render: (props) => <HeadingBlockRender {...props} />,
};

// Wrapper component to use hooks
function HeadingBlockRender({ text, level, color, fontFamily, pageBreakBehavior, marginTop, marginRight, marginBottom, marginLeft }: Omit<HeadingBlockProps, 'visibilityCondition'>) {
  const Tag = level;

  // Get inherited styles from context
  const inherited = useInheritedStyles();

  // Use inherited values as fallback when own value is the default
  const finalColor = color !== DEFAULT_HEADING_COLOR ? color : (inherited.color || color);
  const finalFontFamily = fontFamily ? fontFamily : (inherited.fontFamily || undefined);

  return (
    <Tag 
      style={{ 
        color: finalColor, 
        fontFamily: finalFontFamily ? `"${finalFontFamily}", sans-serif` : undefined,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        ...getPageBreakStyle(pageBreakBehavior) 
      }} 
      className="p-2"
    >
      {text}
    </Tag>
  );
}
