import type { ComponentConfig } from '@puckeditor/core';

export type ReportHeaderProps = {
  logoSrc: string;
  title: string;
  date: string;
  pageBreakBehavior: 'auto' | 'avoid' | 'before' | 'after';
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
    logoSrc: '',
    title: 'Report Title',
    date: '',
    pageBreakBehavior: 'auto',
  },
  render: ({ logoSrc, title, date, pageBreakBehavior }) => {
    const pageBreakStyle: React.CSSProperties = {};
    if (pageBreakBehavior === 'avoid') {
      pageBreakStyle.pageBreakInside = 'avoid';
    } else if (pageBreakBehavior === 'before') {
      pageBreakStyle.pageBreakBefore = 'always';
    } else if (pageBreakBehavior === 'after') {
      pageBreakStyle.pageBreakAfter = 'always';
    }

    return (
      <div className="flex items-center justify-between p-4 border-b" style={pageBreakStyle}>
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {logoSrc && <img src={logoSrc} alt="Logo" style={{ height: '40px', width: 'auto' }} />}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <span className="text-sm text-gray-500">{date}</span>
      </div>
    );
  },
};
