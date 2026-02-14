import type { ComponentConfig } from '@puckeditor/core';

export type HeadingBlockProps = {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  color: string;
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
  },
  defaultProps: {
    text: 'Heading',
    level: 'h2',
    color: '#000000',
  },
  render: ({ text, level, color }) => {
    const Tag = level;
    return <Tag style={{ color }} className="p-2">{text}</Tag>;
  },
};
