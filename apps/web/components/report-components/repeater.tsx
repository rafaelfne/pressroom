import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type RepeaterProps = {
  dataPath: string;
  emptyMessage: string;
  pageBreakBehavior: PageBreakBehavior;
};

export const Repeater: ComponentConfig<RepeaterProps> = {
  label: 'Repeater',
  fields: {
    dataPath: { type: 'text', label: 'Data Path' },
    emptyMessage: { type: 'text', label: 'Empty Message' },
    pageBreakBehavior: pageBreakField,
  },
  defaultProps: {
    dataPath: '{{items}}',
    emptyMessage: 'No data available',
    pageBreakBehavior: 'auto',
  },
  render: ({ dataPath, emptyMessage, pageBreakBehavior }) => {
    const containerStyle: React.CSSProperties = {
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: '2px dashed #d1d5db',
      backgroundColor: '#f9fafb',
      ...getPageBreakStyle(pageBreakBehavior),
    };

    const titleStyle: React.CSSProperties = {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
    };

    const pathStyle: React.CSSProperties = {
      fontSize: '0.875rem',
      color: '#6b7280',
      fontFamily: 'monospace',
      backgroundColor: '#f3f4f6',
      padding: '0.5rem',
      borderRadius: '0.25rem',
      marginBottom: '0.5rem',
    };

    const messageStyle: React.CSSProperties = {
      fontSize: '0.875rem',
      color: '#9ca3af',
      fontStyle: 'italic',
    };

    return (
      <div style={containerStyle}>
        <div style={titleStyle}>Repeater Component</div>
        <div style={pathStyle}>Iterates over: {dataPath}</div>
        <div style={messageStyle}>Empty state: {emptyMessage}</div>
      </div>
    );
  },
};
