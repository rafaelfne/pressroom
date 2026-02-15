import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type ReportFooterProps = {
  text: string;
  showPageNumber: string;
  pageBreakBehavior: PageBreakBehavior;
};

/**
 * @deprecated Use template-level footer configuration instead.
 * This component is kept for backward compatibility with existing templates.
 * New templates should use the HeaderFooterConfig in template settings.
 */
export const ReportFooter: ComponentConfig<ReportFooterProps> = {
  label: 'Report Footer (Legacy)',
  fields: {
    text: { type: 'text', label: 'Footer Text' },
    showPageNumber: {
      type: 'radio',
      label: 'Show Page Number',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
    pageBreakBehavior: pageBreakField,
  },
  defaultProps: {
    text: '© Company Name',
    showPageNumber: 'true',
    pageBreakBehavior: 'auto',
  },
  render: ({ text, showPageNumber, pageBreakBehavior }) => (
    <div className="flex items-center justify-between p-4 border-t text-sm text-gray-500" style={getPageBreakStyle(pageBreakBehavior)}>
      <span>{text}</span>
      {showPageNumber === 'true' && <span className="page-number">Page</span>}
    </div>
  ),
};
