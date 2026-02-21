import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

/**
 * Popular Google Fonts available for selection.
 * The value is the font family name as it appears on Google Fonts.
 * Use '' (empty) for the default system font stack.
 */
export const GOOGLE_FONT_OPTIONS = [
  { label: 'Default (System)', value: '' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Lato', value: 'Lato' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Raleway', value: 'Raleway' },
  { label: 'Nunito', value: 'Nunito' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Merriweather', value: 'Merriweather' },
  { label: 'Source Sans 3', value: 'Source Sans 3' },
  { label: 'PT Sans', value: 'PT Sans' },
  { label: 'Noto Sans', value: 'Noto Sans' },
  { label: 'Ubuntu', value: 'Ubuntu' },
  { label: 'Oswald', value: 'Oswald' },
  { label: 'Fira Sans', value: 'Fira Sans' },
  { label: 'Barlow', value: 'Barlow' },
  { label: 'Libre Baskerville', value: 'Libre Baskerville' },
  { label: 'Custom...', value: 'custom' },
] as const;

/** Build the Google Fonts CSS URL for a given font family name. */
export function googleFontUrl(family: string): string {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:ital,wght@0,100..900;1,100..900&display=swap`;
}

export type TextBlockProps = {
  text: string;
  fontSize: string;
  customFontSize: number;
  lineHeight: string;
  customLineHeight: number;
  letterSpacing: string;
  customLetterSpacing: number;
  fontFamily: string;
  customFontFamily: string;
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
    fontFamily: {
      type: 'select',
      label: 'Font Family',
      options: GOOGLE_FONT_OPTIONS.map(o => ({ label: o.label, value: o.value })),
    },
    customFontFamily: {
      type: 'text',
      label: 'Custom Font (Google Fonts name)',
    },
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
    letterSpacing: {
      type: 'select',
      label: 'Letter Spacing',
      options: [
        { label: 'Tighter', value: '-0.05em' },
        { label: 'Tight', value: '-0.025em' },
        { label: 'Normal', value: '0em' },
        { label: 'Wide', value: '0.025em' },
        { label: 'Wider', value: '0.05em' },
        { label: 'Widest', value: '0.1em' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    customLetterSpacing: {
      type: 'number',
      label: 'Custom Letter Spacing (px)',
      min: -10,
      max: 50,
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
    fontFamily: '',
    customFontFamily: '',
    fontSize: '1rem',
    customFontSize: 16,
    lineHeight: '1.5',
    customLineHeight: 1.5,
    letterSpacing: '0em',
    customLetterSpacing: 0,
    color: '#000000',
    alignment: 'left',
    bold: 'false',
    italic: 'false',
    pageBreakBehavior: 'auto',
  },
  render: ({ text, fontSize, customFontSize, lineHeight, customLineHeight, letterSpacing, customLetterSpacing, fontFamily, customFontFamily, color, alignment, bold, italic, pageBreakBehavior }) => {
    const resolvedFontSize = fontSize === 'custom' ? `${customFontSize}px` : fontSize;
    const resolvedLineHeight = lineHeight === 'custom' ? customLineHeight : Number(lineHeight);
    const resolvedLetterSpacing = letterSpacing === 'custom' ? `${customLetterSpacing}px` : letterSpacing;
    const resolvedFontFamily = fontFamily === 'custom' ? customFontFamily : fontFamily;

    return (
      <>
        {resolvedFontFamily && (
          <link
            rel="stylesheet"
            href={googleFontUrl(resolvedFontFamily)}
          />
        )}
        <div
          style={{
            fontSize: resolvedFontSize,
            lineHeight: resolvedLineHeight,
            letterSpacing: resolvedLetterSpacing,
            fontFamily: resolvedFontFamily ? `"${resolvedFontFamily}", sans-serif` : undefined,
            color,
            textAlign: alignment,
            fontWeight: bold === 'true' ? 'bold' : 'normal',
            fontStyle: italic === 'true' ? 'italic' : 'normal',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            ...getPageBreakStyle(pageBreakBehavior),
          }}
          className="p-2"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </>
    );
  },
};
