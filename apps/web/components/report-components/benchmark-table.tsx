import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type BenchmarkTableProps = {
  title: string;
  dataPath: string;
  period1Label: string;
  period1Key: string;
  period2Label: string;
  period2Key: string;
  period3Label: string;
  period3Key: string;
  pageBreakBehavior: PageBreakBehavior;
};

export const BenchmarkTable: ComponentConfig<BenchmarkTableProps> = {
  label: 'Benchmark Table',
  fields: {
    title: { type: 'text', label: 'Title' },
    dataPath: { type: 'text', label: 'Data Path' },
    period1Label: { type: 'text', label: 'Period 1 Label' },
    period1Key: { type: 'text', label: 'Period 1 Key' },
    period2Label: { type: 'text', label: 'Period 2 Label' },
    period2Key: { type: 'text', label: 'Period 2 Key' },
    period3Label: { type: 'text', label: 'Period 3 Label' },
    period3Key: { type: 'text', label: 'Period 3 Key' },
    pageBreakBehavior: pageBreakField,
  },
  defaultProps: {
    title: 'Benchmark Table',
    dataPath: '{{content.summary.benchmarks}}',
    period1Label: 'Mês',
    period1Key: 'monthly',
    period2Label: 'Ano',
    period2Key: 'annual',
    period3Label: 'Início',
    period3Key: 'inception',
    pageBreakBehavior: 'auto',
  },
  render: ({
    title,
    dataPath,
    period1Label,
    period2Label,
    period3Label,
    pageBreakBehavior,
  }) => {
    const containerStyle: React.CSSProperties = {
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      backgroundColor: '#ffffff',
      ...getPageBreakStyle(pageBreakBehavior),
    };

    const titleStyle: React.CSSProperties = {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '1rem',
    };

    const tableStyle: React.CSSProperties = {
      width: '100%',
      borderCollapse: 'collapse',
    };

    const thStyle: React.CSSProperties = {
      textAlign: 'left',
      padding: '0.75rem',
      borderBottom: '2px solid #e5e7eb',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
    };

    const tdStyle: React.CSSProperties = {
      padding: '0.75rem',
      borderBottom: '1px solid #e5e7eb',
      fontSize: '0.875rem',
      color: '#6b7280',
    };

    const noteStyle: React.CSSProperties = {
      marginTop: '1rem',
      fontSize: '0.75rem',
      color: '#9ca3af',
      fontStyle: 'italic',
    };

    return (
      <div style={containerStyle}>
        <div style={titleStyle}>{title}</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Índice</th>
              <th style={thStyle}>{period1Label}</th>
              <th style={thStyle}>{period2Label}</th>
              <th style={thStyle}>{period3Label}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Sample Index 1</td>
              <td style={tdStyle}>+5.2%</td>
              <td style={tdStyle}>+12.8%</td>
              <td style={tdStyle}>+45.3%</td>
            </tr>
            <tr>
              <td style={tdStyle}>Sample Index 2</td>
              <td style={tdStyle}>-2.1%</td>
              <td style={tdStyle}>+8.5%</td>
              <td style={tdStyle}>+32.1%</td>
            </tr>
          </tbody>
        </table>
        <div style={noteStyle}>
          Data binding: {dataPath} (actual benchmark data will be resolved by the rendering engine)
        </div>
      </div>
    );
  },
};
