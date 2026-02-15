import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type ReportHeaderProps = {
  logoSrc: string;
  title: string;
  date: string;
  pageBreakBehavior: PageBreakBehavior;
};

/**
 * @deprecated Use template-level header configuration instead.
 * This component is kept for backward compatibility with existing templates.
 * New templates should use the HeaderFooterConfig in template settings.
 */
export const ReportHeader: ComponentConfig<ReportHeaderProps> = {
  label: 'Report Header (Legacy)',
  fields: {
    logoSrc: { type: 'text', label: 'Logo URL' },
    title: { type: 'text', label: 'Report Title' },
    date: { type: 'text', label: 'Date' },
    pageBreakBehavior: pageBreakField,
  },
  defaultProps: {
    logoSrc: '',
    title: 'Report Title',
    date: '',
    pageBreakBehavior: 'auto',
  },
  render: ({ logoSrc, title, date, pageBreakBehavior }) => (
    <div className="flex items-center justify-between p-4 border-b" style={getPageBreakStyle(pageBreakBehavior)}>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {logoSrc && <img src={logoSrc} alt="Logo" style={{ height: '40px', width: 'auto' }} />}
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <span className="text-sm text-gray-500">{date}</span>
    </div>
  ),
};
