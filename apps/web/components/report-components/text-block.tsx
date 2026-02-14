import type { ComponentConfig } from '@puckeditor/core';

export type TextBlockProps = {
  text: string;
  fontSize: string;
  color: string;
};

export const TextBlock: ComponentConfig<TextBlockProps> = {
  label: 'Text Block',
  fields: {
    text: { type: 'textarea', label: 'Text' },
    fontSize: {
      type: 'select',
      label: 'Font Size',
      options: [
        { label: 'Small', value: '0.875rem', key: 'small' },
        { label: 'Base', value: '1rem', key: 'base' },
        { label: 'Large', value: '1.25rem', key: 'large' },
        { label: 'Extra Large', value: '1.5rem', key: 'xlarge' },
      ],
    },
    color: { type: 'text', label: 'Text Color' },
  },
  defaultProps: {
    text: 'Enter your text here',
    fontSize: '1rem',
    color: '#000000',
  },
  render: ({ text, fontSize, color }) => (
    <div style={{ fontSize, color }} className="p-2">
      {text}
    </div>
  ),
};
