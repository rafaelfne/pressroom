import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type StatCardProps = {
  label: string;
  value: string;
  sublabel: string;
  trend: 'up' | 'down' | 'neutral';
  pageBreakBehavior: PageBreakBehavior;
};

export const StatCard: ComponentConfig<StatCardProps> = {
  label: 'Stat Card',
  fields: {
    label: { type: 'text', label: 'Label' },
    value: { type: 'text', label: 'Value' },
    sublabel: { type: 'text', label: 'Sub-label' },
    trend: {
      type: 'select',
      label: 'Trend',
      options: [
        { label: 'Up', value: 'up' },
        { label: 'Down', value: 'down' },
        { label: 'Neutral', value: 'neutral' },
      ],
    },
    pageBreakBehavior: pageBreakField,
  },
  defaultProps: {
    label: 'Stat Label',
    value: '{{value}}',
    sublabel: '',
    trend: 'neutral',
    pageBreakBehavior: 'auto',
  },
  render: ({ label, value, sublabel, trend, pageBreakBehavior }) => {
    const trendColors: Record<string, string> = {
      up: '#059669',
      down: '#dc2626',
      neutral: '#374151',
    };

    const containerStyle: React.CSSProperties = {
      padding: '1rem',
      borderRadius: '0.375rem',
      border: '1px solid #e5e7eb',
      backgroundColor: '#ffffff',
      textAlign: 'center',
      ...getPageBreakStyle(pageBreakBehavior),
    };

    return (
      <div style={containerStyle}>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500', marginBottom: '0.5rem' }}>
          {label}
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: trendColors[trend] || '#374151', lineHeight: '1.2' }}>
          {value}
        </div>
        {sublabel && (
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            {sublabel}
          </div>
        )}
      </div>
    );
  },
};
