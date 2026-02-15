import type { ComponentConfig } from '@puckeditor/core';

export type DataTableColumn = {
  field: string;
  header: string;
  width: string;
  align: 'left' | 'center' | 'right';
  format: 'text' | 'number' | 'currency' | 'date';
};

export type DataTableProps = {
  dataExpression: string;
  columns: DataTableColumn[];
  striped: string;
  bordered: string;
  compact: string;
  headerBgColor: string;
  headerTextColor: string;
  pageBreakBehavior: 'auto' | 'avoid' | 'before' | 'after';
};

// Sample data for Studio preview
const SAMPLE_DATA = [
  { name: 'Sample Item 1', quantity: 10, price: 29.99, date: '2024-01-15' },
  { name: 'Sample Item 2', quantity: 5, price: 49.99, date: '2024-02-20' },
  { name: 'Sample Item 3', quantity: 8, price: 19.99, date: '2024-03-10' },
];

/**
 * Format a cell value based on the specified format type
 */
function formatValue(value: unknown, format: DataTableColumn['format']): string {
  if (value === null || value === undefined) {
    return '';
  }

  try {
    switch (format) {
      case 'number':
        return Number(value).toLocaleString('en-US');
      
      case 'currency':
        return Number(value).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        });
      
      case 'date':
        if (typeof value === 'string' || typeof value === 'number') {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-US');
          }
        }
        return String(value);
      
      case 'text':
      default:
        return String(value);
    }
  } catch {
    return String(value);
  }
}

/**
 * Extract nested field value from an object using dot notation
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }

  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return current;
}

export const DataTable: ComponentConfig<DataTableProps> = {
  label: 'Data Table',
  fields: {
    dataExpression: {
      type: 'text',
      label: 'Data Source',
    },
    columns: {
      type: 'array',
      label: 'Columns',
      arrayFields: {
        field: {
          type: 'text',
          label: 'Field Path',
        },
        header: {
          type: 'text',
          label: 'Header Label',
        },
        width: {
          type: 'text',
          label: 'Width',
        },
        align: {
          type: 'select',
          label: 'Alignment',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
        },
        format: {
          type: 'select',
          label: 'Format',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Number', value: 'number' },
            { label: 'Currency', value: 'currency' },
            { label: 'Date', value: 'date' },
          ],
        },
      },
      defaultItemProps: {
        field: 'field',
        header: 'Column',
        width: 'auto',
        align: 'left' as const,
        format: 'text' as const,
      },
    },
    striped: {
      type: 'radio',
      label: 'Zebra Striping',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
    bordered: {
      type: 'radio',
      label: 'Borders',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
    compact: {
      type: 'radio',
      label: 'Compact Mode',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
    headerBgColor: {
      type: 'text',
      label: 'Header Background Color',
    },
    headerTextColor: {
      type: 'text',
      label: 'Header Text Color',
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
    dataExpression: '{{data.items}}',
    columns: [
      { field: 'name', header: 'Name', width: 'auto', align: 'left', format: 'text' },
      { field: 'quantity', header: 'Quantity', width: '100px', align: 'center', format: 'number' },
      { field: 'price', header: 'Price', width: '120px', align: 'right', format: 'currency' },
      { field: 'date', header: 'Date', width: '120px', align: 'center', format: 'date' },
    ],
    striped: 'true',
    bordered: 'true',
    compact: 'false',
    headerBgColor: '#f3f4f6',
    headerTextColor: '#111827',
    pageBreakBehavior: 'auto',
  },
  render: ({
    dataExpression,
    columns,
    striped,
    bordered,
    compact,
    headerBgColor,
    headerTextColor,
    pageBreakBehavior,
  }) => {
    const pageBreakStyle: React.CSSProperties = {};
    if (pageBreakBehavior === 'avoid') {
      pageBreakStyle.pageBreakInside = 'avoid';
    } else if (pageBreakBehavior === 'before') {
      pageBreakStyle.pageBreakBefore = 'always';
    } else if (pageBreakBehavior === 'after') {
      pageBreakStyle.pageBreakAfter = 'always';
    }

    // Use sample data for preview (in real rendering, binding resolution will replace this)
    const data = SAMPLE_DATA;

    // Validate that we have data to display
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div
          style={{
            padding: '16px',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            color: '#6b7280',
            textAlign: 'center',
            maxWidth: '100%',
          }}
        >
          No data available. Configure data source: {dataExpression}
        </div>
      );
    }

    // Validate columns
    if (!columns || columns.length === 0) {
      return (
        <div
          style={{
            padding: '16px',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            color: '#6b7280',
            textAlign: 'center',
            maxWidth: '100%',
          }}
        >
          No columns configured. Add columns to display data.
        </div>
      );
    }

    const isStriped = striped === 'true';
    const isBordered = bordered === 'true';
    const isCompact = compact === 'true';

    // Table container styles
    const containerStyle: React.CSSProperties = {
      maxWidth: '100%',
      overflowX: 'auto',
      ...pageBreakStyle,
    };

    // Table styles
    const tableStyle: React.CSSProperties = {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: isCompact ? '12px' : '14px',
      lineHeight: isCompact ? '1.4' : '1.5',
    };

    // Header cell styles
    const thStyle: React.CSSProperties = {
      backgroundColor: headerBgColor || '#f3f4f6',
      color: headerTextColor || '#111827',
      fontWeight: 600,
      padding: isCompact ? '8px 12px' : '12px 16px',
      textAlign: 'left',
      borderBottom: isBordered ? '2px solid #d1d5db' : 'none',
      borderRight: isBordered ? '1px solid #e5e7eb' : 'none',
    };

    // Body cell styles
    const tdStyle: React.CSSProperties = {
      padding: isCompact ? '6px 12px' : '10px 16px',
      borderBottom: isBordered ? '1px solid #e5e7eb' : 'none',
      borderRight: isBordered ? '1px solid #e5e7eb' : 'none',
    };

    return (
      <div style={containerStyle}>
        <table style={tableStyle}>
          <thead style={{ display: 'table-header-group' }}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={`header-${index}`}
                  style={{
                    ...thStyle,
                    width: column.width || 'auto',
                    textAlign: column.align || 'left',
                    borderRight: isBordered && index === columns.length - 1 ? 'none' : thStyle.borderRight,
                  }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={`row-${rowIndex}`}
                style={{
                  backgroundColor:
                    isStriped && rowIndex % 2 === 1 ? '#f9fafb' : 'transparent',
                }}
              >
                {columns.map((column, colIndex) => {
                  const value = getNestedValue(row, column.field);
                  const formattedValue = formatValue(value, column.format);

                  return (
                    <td
                      key={`cell-${rowIndex}-${colIndex}`}
                      style={{
                        ...tdStyle,
                        textAlign: column.align || 'left',
                        borderRight: isBordered && colIndex === columns.length - 1 ? 'none' : tdStyle.borderRight,
                      }}
                    >
                      {formattedValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
};
