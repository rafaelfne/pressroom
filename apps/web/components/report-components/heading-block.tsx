import type { ComponentConfig } from '@puckeditor/core';

export type HeadingBlockProps = {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  color: string;
  pageBreakBehavior: 'auto' | 'avoid' | 'before' | 'after';
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
    pageBreakBehavior: {
      type: 'select',
      label: 'Page Break',
      options: [
        { label: 'Auto', value: 'auto' },
        { label: 'Avoid Split', value: 'avoid' },
        { label: 'Break Before', value: 'before' },
        { label: 'Break After', value: 'after' },
      ],
    },
  },
  defaultProps: {
    text: 'Heading',
    level: 'h2',
    color: '#000000',
    pageBreakBehavior: 'auto',
  },
  render: ({ text, level, color, pageBreakBehavior }) => {
    const pageBreakStyle: React.CSSProperties = {};
    if (pageBreakBehavior === 'avoid') {
      pageBreakStyle.pageBreakInside = 'avoid';
    } else if (pageBreakBehavior === 'before') {
      pageBreakStyle.pageBreakBefore = 'always';
    } else if (pageBreakBehavior === 'after') {
      pageBreakStyle.pageBreakAfter = 'always';
    }

    const Tag = level;
    return <Tag style={{ color, ...pageBreakStyle }} className="p-2">{text}</Tag>;
  },
};
