'use client';

import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, type PageBreakBehavior } from '@/lib/utils/page-break';
import { textField, pageBreakCustomField } from '@/components/puck-fields/field-helpers';

export type SpacerProps = {
  height: string;
  pageBreakBehavior: PageBreakBehavior;
};

export const Spacer: ComponentConfig<SpacerProps> = {
  label: 'Spacer',
  fields: {
    height: textField('Height (px)'),
    pageBreakBehavior: pageBreakCustomField,
  },
  defaultProps: {
    height: '32',
    pageBreakBehavior: 'auto',
  },
  render: ({ height, pageBreakBehavior }) => (
    <div style={{ height: `${height}px`, ...getPageBreakStyle(pageBreakBehavior) }} aria-hidden="true" />
  ),
};
