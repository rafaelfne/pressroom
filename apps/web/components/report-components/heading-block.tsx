'use client';

import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, type PageBreakBehavior } from '@/lib/utils/page-break';
import { textField, selectField, textareaField, pageBreakCustomField } from '@/components/puck-fields/field-helpers';
import { useInheritedStyles } from '@/contexts/inherited-styles-context';
import { useStyleGuide } from '@/contexts/style-guide-context';
import { resolveStylableValue, type StylableValue } from '@/lib/types/style-system';

const DEFAULT_HEADING_COLOR = '#000000';

export type HeadingBlockProps = {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  color: StylableValue | string;
  fontFamily: StylableValue | string;
  pageBreakBehavior: PageBreakBehavior;
  visibilityCondition: string;
  styleConditions: string;
  marginTop: StylableValue | string;
  marginRight: StylableValue | string;
  marginBottom: StylableValue | string;
  marginLeft: StylableValue | string;
};

export const HeadingBlock: ComponentConfig<HeadingBlockProps> = {
  label: 'Heading Block',
  fields: {
    text: textField('Heading Text'),
    level: selectField('Heading Level', [
      { label: 'H1', value: 'h1' },
      { label: 'H2', value: 'h2' },
      { label: 'H3', value: 'h3' },
      { label: 'H4', value: 'h4' },
      { label: 'H5', value: 'h5' },
      { label: 'H6', value: 'h6' },
    ]),
    color: textField('Text Color'),
    fontFamily: textField('Font Family'),
    pageBreakBehavior: pageBreakCustomField,
    visibilityCondition: textareaField('Visibility Condition (JSON)'),
    styleConditions: textareaField('Style Conditions (JSON)'),
    marginTop: textField('Margin Top'),
    marginRight: textField('Margin Right'),
    marginBottom: textField('Margin Bottom'),
    marginLeft: textField('Margin Left'),
  },
  defaultProps: {
    text: 'Heading',
    level: 'h2',
    color: DEFAULT_HEADING_COLOR,
    fontFamily: '',
    pageBreakBehavior: 'auto',
    visibilityCondition: '',
    styleConditions: '',
    marginTop: '0',
    marginRight: '0',
    marginBottom: '0',
    marginLeft: '0',
  },
  render: (props) => <HeadingBlockRender {...props} />,
};

// Wrapper component to use hooks
function HeadingBlockRender({ text, level, color, fontFamily, pageBreakBehavior, marginTop, marginRight, marginBottom, marginLeft }: Omit<HeadingBlockProps, 'visibilityCondition' | 'styleConditions'>) {
  const Tag = level;

  // Get inherited styles from context
  const inherited = useInheritedStyles();

  // Resolve StylableValue (supports both plain strings and token references)
  const { tokens } = useStyleGuide();
  const resolvedColor = resolveStylableValue(color, tokens) ?? DEFAULT_HEADING_COLOR;
  const resolvedFontFamily = resolveStylableValue(fontFamily, tokens) ?? '';
  const resolvedMarginTop = resolveStylableValue(marginTop, tokens) ?? '0';
  const resolvedMarginRight = resolveStylableValue(marginRight, tokens) ?? '0';
  const resolvedMarginBottom = resolveStylableValue(marginBottom, tokens) ?? '0';
  const resolvedMarginLeft = resolveStylableValue(marginLeft, tokens) ?? '0';

  // Use inherited values as fallback when own value is the default
  const finalColor = resolvedColor !== DEFAULT_HEADING_COLOR ? resolvedColor : (inherited.color || resolvedColor);
  const finalFontFamily = resolvedFontFamily ? resolvedFontFamily : (inherited.fontFamily || undefined);

  return (
    <Tag
      style={{
        color: finalColor,
        fontFamily: finalFontFamily ? `"${finalFontFamily}", sans-serif` : undefined,
        marginTop: resolvedMarginTop,
        marginRight: resolvedMarginRight,
        marginBottom: resolvedMarginBottom,
        marginLeft: resolvedMarginLeft,
        ...getPageBreakStyle(pageBreakBehavior)
      }}
      className="p-2"
    >
      {text}
    </Tag>
  );
}
