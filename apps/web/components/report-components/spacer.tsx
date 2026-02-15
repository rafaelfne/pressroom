import type { ComponentConfig } from '@puckeditor/core';

export type SpacerProps = {
  height: string;
  pageBreakBehavior: 'auto' | 'avoid' | 'before' | 'after';
};

export const Spacer: ComponentConfig<SpacerProps> = {
  label: 'Spacer',
  fields: {
    height: {
      type: 'text',
      label: 'Height (px)',
    },
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
    height: '32',
    pageBreakBehavior: 'auto',
  },
  render: ({ height, pageBreakBehavior }) => {
    const pageBreakStyle: React.CSSProperties = {};
    if (pageBreakBehavior === 'avoid') {
      pageBreakStyle.pageBreakInside = 'avoid';
    } else if (pageBreakBehavior === 'before') {
      pageBreakStyle.pageBreakBefore = 'always';
    } else if (pageBreakBehavior === 'after') {
      pageBreakStyle.pageBreakAfter = 'always';
    }

    return (
      <div style={{ height: `${height}px`, ...pageBreakStyle }} aria-hidden="true" />
    );
  },
};
