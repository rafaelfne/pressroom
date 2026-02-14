import type { ComponentConfig } from '@puckeditor/core';

export type TextBlockProps = {
  text: string;
  fontSize: string;
  color: string;
  alignment: string;
  bold: string;
  italic: string;
};

export const TextBlock: ComponentConfig<TextBlockProps> = {
  label: 'Text Block',
  fields: {
    text: { type: 'textarea', label: 'Text' },
    fontSize: {
      type: 'select',
      label: 'Font Size',
      options: [
        { label: 'Small', value: '0.875rem' },
        { label: 'Base', value: '1rem' },
        { label: 'Large', value: '1.25rem' },
        { label: 'Extra Large', value: '1.5rem' },
      ],
    },
    color: { type: 'text', label: 'Text Color' },
    alignment: {
      type: 'select',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
        { label: 'Justify', value: 'justify' },
      ],
    },
    bold: {
      type: 'radio',
      label: 'Bold',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
    italic: {
      type: 'radio',
      label: 'Italic',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
  },
  defaultProps: {
    text: 'Enter your text here',
    fontSize: '1rem',
    color: '#000000',
    alignment: 'left',
    bold: 'false',
    italic: 'false',
  },
  render: ({ text, fontSize, color, alignment, bold, italic }) => (
    <div
      style={{
        fontSize,
        color,
        textAlign: alignment as 'left' | 'center' | 'right' | 'justify',
        fontWeight: bold === 'true' ? 'bold' : 'normal',
        fontStyle: italic === 'true' ? 'italic' : 'normal',
      }}
      className="p-2"
    >
      {text}
    </div>
  ),
};
