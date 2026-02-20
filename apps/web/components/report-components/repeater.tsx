import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type RepeaterProps = {
  dataPath: string;
  emptyMessage: string;
  pageBreakBehavior: PageBreakBehavior;
};

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

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
      ...getPageBreakStyle(pageBreakBehavior),
    };

    // After resolveBindings(), dataPath becomes the actual array
    const items = Array.isArray(dataPath) ? dataPath : null;

    if (items) {
      // Resolved mode: render the array items
      if (items.length === 0) {
        return (
          <div style={{ ...containerStyle, padding: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
            {emptyMessage}
          </div>
        );
      }

      // Render items as a table if they are objects, or as a list otherwise
      const firstItem = items[0];
      if (firstItem && typeof firstItem === 'object' && !Array.isArray(firstItem)) {
        const keys = Object.keys(firstItem as Record<string, unknown>);
        const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
        const thStyle: React.CSSProperties = {
          textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #e5e7eb',
          fontSize: '0.875rem', fontWeight: '600', color: '#374151',
        };
        const tdStyle: React.CSSProperties = {
          padding: '0.75rem', borderBottom: '1px solid #e5e7eb',
          fontSize: '0.875rem', color: '#6b7280',
        };

        return (
          <div style={containerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  {keys.map((key) => (
                    <th key={key} style={thStyle}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const row = item as Record<string, unknown>;
                  return (
                    <tr key={index}>
                      {keys.map((key) => (
                        <td key={key} style={tdStyle}>{renderValue(row[key])}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }

      // Simple list for non-object items
      const listItemStyle: React.CSSProperties = {
        padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb',
        fontSize: '0.875rem', color: '#374151',
      };

      return (
        <div style={containerStyle}>
          {items.map((item, index) => (
            <div key={index} style={listItemStyle}>{renderValue(item)}</div>
          ))}
        </div>
      );
    }

    // Editor mode: show placeholder
    const placeholderStyle: React.CSSProperties = {
      ...containerStyle,
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: '2px dashed #d1d5db',
      backgroundColor: '#f9fafb',
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
      <div style={placeholderStyle}>
        <div style={titleStyle}>Repeater</div>
        <div style={pathStyle}>Iterates over: {dataPath}</div>
        <div style={messageStyle}>Empty state: {emptyMessage}</div>
      </div>
    );
  },
};
