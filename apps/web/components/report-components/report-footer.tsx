import type { ComponentConfig } from '@puckeditor/core';

export type ReportFooterProps = {
  text: string;
  showPageNumber: string;
};

export const ReportFooter: ComponentConfig<ReportFooterProps> = {
  label: 'Report Footer',
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
  },
  defaultProps: {
    text: '© Company Name',
    showPageNumber: 'true',
  },
  render: ({ text, showPageNumber }) => (
    <div className="flex items-center justify-between p-4 border-t text-sm text-gray-500">
      <span>{text}</span>
      {showPageNumber === 'true' && <span className="page-number">Page</span>}
    </div>
  ),
};
