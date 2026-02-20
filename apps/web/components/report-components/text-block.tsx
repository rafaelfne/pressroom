import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';
import { useResolvedValue } from '@/hooks/use-resolved-value';

export type TextBlockProps = {
  text: string;
  fontSize: string;
  customFontSize: number;
  lineHeight: string;
  customLineHeight: number;
  color: string;
  alignment: 'left' | 'center' | 'right' | 'justify';
  bold: string;
  italic: string;
  pageBreakBehavior: PageBreakBehavior;
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
        { label: 'Custom', value: 'custom' },
      ],
    },
    customFontSize: {
      type: 'number',
      label: 'Custom Size (px)',
      min: 8,
      max: 200,
    },
    lineHeight: {
      type: 'select',
      label: 'Line Height',
      options: [
        { label: 'Tight', value: '1' },
        { label: 'Snug', value: '1.25' },
        { label: 'Normal', value: '1.5' },
        { label: 'Relaxed', value: '1.75' },
        { label: 'Loose', value: '2' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    customLineHeight: {
      type: 'number',
      label: 'Custom Line Height',
      min: 0.5,
      max: 5,
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
    pageBreakBehavior: pageBreakField,
  },
  defaultProps: {
    text: 'Enter your text here',
    fontSize: '1rem',
    customFontSize: 16,
    lineHeight: '1.5',
    customLineHeight: 1.5,
    color: '#000000',
    alignment: 'left',
    bold: 'false',
    italic: 'false',
    pageBreakBehavior: 'auto',
  },
  render: ({ text, fontSize, customFontSize, lineHeight, customLineHeight, color, alignment, bold, italic, pageBreakBehavior }) => {
    const resolvedText = useResolvedValue(text);
    const resolvedFontSize = fontSize === 'custom' ? `${customFontSize}px` : fontSize;
    const resolvedLineHeight = lineHeight === 'custom' ? customLineHeight : Number(lineHeight);

    return (
      <div
        style={{
          fontSize: resolvedFontSize,
          lineHeight: resolvedLineHeight,
          color,
          textAlign: alignment,
          fontWeight: bold === 'true' ? 'bold' : 'normal',
          fontStyle: italic === 'true' ? 'italic' : 'normal',
          ...getPageBreakStyle(pageBreakBehavior),
        }}
        className="p-2"
        dangerouslySetInnerHTML={{ __html: resolvedText }}
      />
    );
  },
};
