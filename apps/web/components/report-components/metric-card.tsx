import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type MetricCardProps = {
  label: string;
  value: string;
  subMetric1Label: string;
  subMetric1Value: string;
  subMetric2Label: string;
  subMetric2Value: string;
  subMetric3Label: string;
  subMetric3Value: string;
  variant: 'default' | 'highlight';
  pageBreakBehavior: PageBreakBehavior;
};

export const MetricCard: ComponentConfig<MetricCardProps> = {
  label: 'Metric Card',
  fields: {
    label: { type: 'text', label: 'Label' },
    value: { type: 'text', label: 'Value' },
    subMetric1Label: { type: 'text', label: 'Sub-Metric 1 Label' },
    subMetric1Value: { type: 'text', label: 'Sub-Metric 1 Value' },
    subMetric2Label: { type: 'text', label: 'Sub-Metric 2 Label' },
    subMetric2Value: { type: 'text', label: 'Sub-Metric 2 Value' },
    subMetric3Label: { type: 'text', label: 'Sub-Metric 3 Label' },
    subMetric3Value: { type: 'text', label: 'Sub-Metric 3 Value' },
    variant: {
      type: 'select',
      label: 'Variant',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Highlight', value: 'highlight' },
      ],
    },
    pageBreakBehavior: pageBreakField,
  },
  defaultProps: {
    label: 'Metric Label',
    value: '{{value}}',
    subMetric1Label: '',
    subMetric1Value: '',
    subMetric2Label: '',
    subMetric2Value: '',
    subMetric3Label: '',
    subMetric3Value: '',
    variant: 'default',
    pageBreakBehavior: 'auto',
  },
  render: ({
    label,
    value,
    subMetric1Label,
    subMetric1Value,
    subMetric2Label,
    subMetric2Value,
    subMetric3Label,
    subMetric3Value,
    variant,
    pageBreakBehavior,
  }) => {
    // Filter out empty sub-metrics
    const subMetrics = [
      { label: subMetric1Label, value: subMetric1Value },
      { label: subMetric2Label, value: subMetric2Value },
      { label: subMetric3Label, value: subMetric3Value },
    ].filter((metric) => metric.label || metric.value);

    const containerStyle: React.CSSProperties = {
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      backgroundColor: variant === 'highlight' ? '#f9fafb' : '#ffffff',
      ...getPageBreakStyle(pageBreakBehavior),
    };

    const labelStyle: React.CSSProperties = {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.5rem',
      fontWeight: '500',
    };

    const valueStyle: React.CSSProperties = {
      fontSize: '2.25rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: subMetrics.length > 0 ? '1rem' : '0',
      lineHeight: '1.2',
    };

    const subMetricsContainerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      gap: '1.5rem',
      flexWrap: 'wrap',
      borderTop: '1px solid #e5e7eb',
      paddingTop: '1rem',
    };

    const subMetricStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    };

    const subMetricLabelStyle: React.CSSProperties = {
      fontSize: '0.75rem',
      color: '#9ca3af',
      fontWeight: '500',
    };

    const subMetricValueStyle: React.CSSProperties = {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#374151',
    };

    return (
      <div style={containerStyle}>
        <div style={labelStyle}>{label}</div>
        <div style={valueStyle}>{value}</div>
        {subMetrics.length > 0 && (
          <div style={subMetricsContainerStyle}>
            {subMetrics.map((metric, index) => (
              <div key={index} style={subMetricStyle}>
                <div style={subMetricLabelStyle}>{metric.label}</div>
                <div style={subMetricValueStyle}>{metric.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
};
