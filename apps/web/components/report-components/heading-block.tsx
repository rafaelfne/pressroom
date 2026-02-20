import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type HeadingBlockProps = {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  color: string;
  pageBreakBehavior: PageBreakBehavior;
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
    pageBreakBehavior: pageBreakField,
  },
  defaultProps: {
    text: 'Heading',
    level: 'h2',
    color: '#000000',
    pageBreakBehavior: 'auto',
  },
  render: ({ text, level, color, pageBreakBehavior }) => {
    const Tag = level;
    return <Tag style={{ color, ...getPageBreakStyle(pageBreakBehavior) }} className="p-2">{text}</Tag>;
  },
};
