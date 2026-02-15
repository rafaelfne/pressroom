import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type SpacerProps = {
  height: string;
  pageBreakBehavior: PageBreakBehavior;
};

export const Spacer: ComponentConfig<SpacerProps> = {
  label: 'Spacer',
  fields: {
    height: {
      type: 'text',
      label: 'Height (px)',
    },
    pageBreakBehavior: pageBreakField,
  },
  defaultProps: {
    height: '32',
    pageBreakBehavior: 'auto',
  },
  render: ({ height, pageBreakBehavior }) => (
    <div style={{ height: `${height}px`, ...getPageBreakStyle(pageBreakBehavior) }} aria-hidden="true" />
  ),
};
