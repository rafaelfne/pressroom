import type { ComponentConfig } from '@puckeditor/core';

export type ReportFooterProps = {
  text: string;
  showPageNumber: string;
  pageBreakBehavior: 'auto' | 'avoid' | 'before' | 'after';
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
    text: '© Company Name',
    showPageNumber: 'true',
    pageBreakBehavior: 'auto',
  },
  render: ({ text, showPageNumber, pageBreakBehavior }) => {
    const pageBreakStyle: React.CSSProperties = {};
    if (pageBreakBehavior === 'avoid') {
      pageBreakStyle.pageBreakInside = 'avoid';
    } else if (pageBreakBehavior === 'before') {
      pageBreakStyle.pageBreakBefore = 'always';
    } else if (pageBreakBehavior === 'after') {
      pageBreakStyle.pageBreakAfter = 'always';
    }

    return (
      <div className="flex items-center justify-between p-4 border-t text-sm text-gray-500" style={pageBreakStyle}>
        <span>{text}</span>
        {showPageNumber === 'true' && <span className="page-number">Page</span>}
      </div>
    );
  },
};
