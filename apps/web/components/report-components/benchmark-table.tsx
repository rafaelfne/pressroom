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

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }
  return String(value);
}

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
    period1Key,
    period2Label,
    period2Key,
    period3Label,
    period3Key,
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

    // After resolveBindings(), dataPath becomes the actual array data
    const rows = Array.isArray(dataPath) ? (dataPath as Record<string, unknown>[]) : null;

    if (rows) {
      // Resolved mode: render actual data
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
              {rows.map((row, index) => (
                <tr key={index}>
                  <td style={tdStyle}>{String(row.name ?? row.label ?? row.index ?? `Item ${index + 1}`)}</td>
                  <td style={tdStyle}>{formatCellValue(row[period1Key])}</td>
                  <td style={tdStyle}>{formatCellValue(row[period2Key])}</td>
                  <td style={tdStyle}>{formatCellValue(row[period3Key])}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }} colSpan={4}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    // Editor mode: show placeholder with binding info
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
              <td style={tdStyle}>+5.20%</td>
              <td style={tdStyle}>+12.80%</td>
              <td style={tdStyle}>+45.30%</td>
            </tr>
            <tr>
              <td style={tdStyle}>Sample Index 2</td>
              <td style={tdStyle}>-2.10%</td>
              <td style={tdStyle}>+8.50%</td>
              <td style={tdStyle}>+32.10%</td>
            </tr>
          </tbody>
        </table>
        <div style={noteStyle}>
          Data binding: {dataPath}
        </div>
      </div>
    );
  },
};
