import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type DataTableColumn = {
  field: string;
  header: string;
  width: string;
  align: 'left' | 'center' | 'right';
  format: 'text' | 'number' | 'currency' | 'date';
  bold: string;
  italic: string;
  fontColor: string;
};

export type DataTableProps = {
  dataExpression: string;
  columns: DataTableColumn[];
  striped: string;
  bordered: string;
  density: 'dense' | 'compact' | 'normal';
  headerBgColor: string;
  headerTextColor: string;
  groupHeaderBgColor: string;
  groupHeaderTextColor: string;
  showFooterRow: string;
  footerLabel: string;
  footerBgColor: string;
  footerTextColor: string;
  evenRowColor: string;
  oddRowColor: string;
  verticalBorders: string;
  pageBreakBehavior: PageBreakBehavior;
};

// Sample data for Studio preview
const SAMPLE_DATA = [
  { _isGroupHeader: true, _groupLabel: 'Onshore (R$)', name: 'Onshore (R$)' },
  { name: 'Treasury Bond IPCA+', quantity: 10, price: 29.99, date: '2024-01-15' },
  { name: '  CDB Bank XYZ', quantity: 5, price: 49.99, date: '2024-02-20', _indent: 1 },
  { _isGroupHeader: true, _groupLabel: 'Offshore (USD)', name: 'Offshore (USD)' },
  { name: 'S&P 500 ETF', quantity: 8, price: 19.99, date: '2024-03-10' },
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
        bold: {
          type: 'radio',
          label: 'Bold',
          options: [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ],
        },
        italic: {
          type: 'radio',
          label: 'Italic',
          options: [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ],
        },
        fontColor: {
          type: 'text',
          label: 'Text Color',
        },
      },
      defaultItemProps: {
        field: 'field',
        header: 'Column',
        width: 'auto',
        align: 'left' as const,
        format: 'text' as const,
        bold: 'false',
        italic: 'false',
        fontColor: '',
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
    density: {
      type: 'select',
      label: 'Density',
      options: [
        { label: 'Dense', value: 'dense' },
        { label: 'Compact', value: 'compact' },
        { label: 'Normal', value: 'normal' },
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
    groupHeaderBgColor: {
      type: 'text',
      label: 'Group Header Background Color',
    },
    groupHeaderTextColor: {
      type: 'text',
      label: 'Group Header Text Color',
    },
    showFooterRow: {
      type: 'radio',
      label: 'Show Footer Row',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
    footerLabel: {
      type: 'text',
      label: 'Footer Label',
    },
    footerBgColor: {
      type: 'text',
      label: 'Footer Background Color',
    },
    footerTextColor: {
      type: 'text',
      label: 'Footer Text Color',
    },
    evenRowColor: {
      type: 'text',
      label: 'Even Row Color',
    },
    oddRowColor: {
      type: 'text',
      label: 'Odd Row Color',
    },
    verticalBorders: {
      type: 'radio',
      label: 'Vertical Borders',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
    pageBreakBehavior: pageBreakField,
  },
  defaultProps: {
    dataExpression: '{{data.items}}',
    columns: [
      { field: 'name', header: 'Name', width: 'auto', align: 'left', format: 'text', bold: 'false', italic: 'false', fontColor: '' },
      { field: 'quantity', header: 'Quantity', width: '100px', align: 'center', format: 'number', bold: 'false', italic: 'false', fontColor: '' },
      { field: 'price', header: 'Price', width: '120px', align: 'right', format: 'currency', bold: 'false', italic: 'false', fontColor: '' },
      { field: 'date', header: 'Date', width: '120px', align: 'center', format: 'date', bold: 'false', italic: 'false', fontColor: '' },
    ],
    striped: 'true',
    bordered: 'true',
    density: 'normal',
    headerBgColor: '#f3f4f6',
    headerTextColor: '#111827',
    groupHeaderBgColor: '#1a5632',
    groupHeaderTextColor: '#ffffff',
    showFooterRow: 'false',
    footerLabel: 'Total',
    footerBgColor: '#f3f4f6',
    footerTextColor: '#111827',
    evenRowColor: 'transparent',
    oddRowColor: '#f9fafb',
    verticalBorders: 'false',
    pageBreakBehavior: 'auto',
  },
  render: ({
    dataExpression,
    columns,
    striped,
    bordered,
    density,
    headerBgColor,
    headerTextColor,
    groupHeaderBgColor,
    groupHeaderTextColor,
    showFooterRow,
    footerLabel,
    footerBgColor,
    footerTextColor,
    evenRowColor,
    oddRowColor,
    verticalBorders,
    pageBreakBehavior,
  }) => {
    const pageBreakStyle = getPageBreakStyle(pageBreakBehavior);

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
    const hasVerticalBorders = verticalBorders === 'true';
    const shouldShowFooter = showFooterRow === 'true';

    // Density-based styles
    let fontSize: string;
    let lineHeight: string;
    let bodyCellPadding: string;
    let headerCellPadding: string;

    switch (density) {
      case 'dense':
        fontSize = '11px';
        lineHeight = '1.2';
        bodyCellPadding = '2px 6px';
        headerCellPadding = '4px 6px';
        break;
      case 'compact':
        fontSize = '12px';
        lineHeight = '1.4';
        bodyCellPadding = '4px 8px';
        headerCellPadding = '6px 8px';
        break;
      case 'normal':
      default:
        fontSize = '14px';
        lineHeight = '1.5';
        bodyCellPadding = '8px 12px';
        headerCellPadding = '10px 12px';
        break;
    }

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
      fontSize,
      lineHeight,
    };

    // Header cell styles
    const thStyle: React.CSSProperties = {
      backgroundColor: headerBgColor || '#f3f4f6',
      color: headerTextColor || '#111827',
      fontWeight: 600,
      padding: headerCellPadding,
      textAlign: 'left',
      borderBottom: isBordered ? '2px solid #d1d5db' : 'none',
      borderRight: (isBordered || hasVerticalBorders) ? '1px solid #e5e7eb' : 'none',
    };

    // Body cell styles
    const tdStyle: React.CSSProperties = {
      padding: bodyCellPadding,
      borderBottom: isBordered ? '1px solid #e5e7eb' : 'none',
      borderRight: (isBordered || hasVerticalBorders) ? '1px solid #e5e7eb' : 'none',
    };

    // Count only data rows (not group headers) for striping
    let dataRowIndex = 0;

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
                    borderRight: ((isBordered || hasVerticalBorders) && index === columns.length - 1) ? 'none' : thStyle.borderRight,
                  }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => {
              const rowData = row as Record<string, unknown>;
              const isGroupHeader = rowData._isGroupHeader === true;

              // If it's a group header row, render spanning cell
              if (isGroupHeader) {
                const groupLabel = (rowData._groupLabel || getNestedValue(row, columns[0].field)) as string;
                return (
                  <tr key={`row-${rowIndex}`}>
                    <td
                      colSpan={columns.length}
                      style={{
                        ...tdStyle,
                        fontWeight: 'bold',
                        backgroundColor: groupHeaderBgColor || '#1a5632',
                        color: groupHeaderTextColor || '#ffffff',
                        borderRight: 'none',
                      }}
                    >
                      {groupLabel}
                    </td>
                  </tr>
                );
              }

              // Regular data row - apply striping
              const currentDataRowIndex = dataRowIndex;
              dataRowIndex++;

              const rowBgColor = isStriped
                ? currentDataRowIndex % 2 === 0
                  ? evenRowColor || 'transparent'
                  : oddRowColor || '#f9fafb'
                : 'transparent';

              return (
                <tr
                  key={`row-${rowIndex}`}
                  style={{
                    backgroundColor: rowBgColor,
                  }}
                >
                  {columns.map((column, colIndex) => {
                    const value = getNestedValue(row, column.field);
                    const formattedValue = formatValue(value, column.format);
                    const indent = (rowData._indent as number) || 0;

                    // Apply column-level styling
                    const cellStyle: React.CSSProperties = {
                      ...tdStyle,
                      textAlign: column.align || 'left',
                      borderRight: ((isBordered || hasVerticalBorders) && colIndex === columns.length - 1) ? 'none' : tdStyle.borderRight,
                    };

                    // Apply bold if specified
                    if (column.bold === 'true') {
                      cellStyle.fontWeight = 'bold';
                    }

                    // Apply italic if specified
                    if (column.italic === 'true') {
                      cellStyle.fontStyle = 'italic';
                    }

                    // Apply font color if specified
                    if (column.fontColor && column.fontColor.trim() !== '') {
                      cellStyle.color = column.fontColor;
                    }

                    // Apply indentation to first column
                    if (colIndex === 0 && indent > 0) {
                      const currentPadding = bodyCellPadding.split(' ');
                      const verticalPadding = currentPadding[0];
                      const horizontalPadding = currentPadding[1] || currentPadding[0];
                      const additionalIndent = indent * 12;
                      
                      // Parse the horizontal padding and add indent
                      const paddingValue = parseInt(horizontalPadding, 10);
                      const totalPaddingLeft = paddingValue + additionalIndent;
                      
                      cellStyle.paddingLeft = `${totalPaddingLeft}px`;
                      cellStyle.paddingRight = horizontalPadding;
                      cellStyle.paddingTop = verticalPadding;
                      cellStyle.paddingBottom = verticalPadding;
                    }

                    return (
                      <td
                        key={`cell-${rowIndex}-${colIndex}`}
                        style={cellStyle}
                      >
                        {formattedValue}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          {shouldShowFooter && (
            <tfoot>
              <tr
                style={{
                  backgroundColor: footerBgColor || '#f3f4f6',
                  color: footerTextColor || '#111827',
                  fontWeight: 'bold',
                  borderTop: '2px solid #d1d5db',
                }}
              >
                <td
                  style={{
                    ...tdStyle,
                    borderRight: ((isBordered || hasVerticalBorders) && columns.length === 1) ? 'none' : tdStyle.borderRight,
                  }}
                >
                  {footerLabel || 'Total'}
                </td>
                {columns.slice(1).map((column, index) => (
                  <td
                    key={`footer-${index}`}
                    style={{
                      ...tdStyle,
                      textAlign: column.align || 'left',
                      borderRight: ((isBordered || hasVerticalBorders) && index === columns.length - 2) ? 'none' : tdStyle.borderRight,
                    }}
                  >
                    {/* Empty cells - binding engine fills these at render time */}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    );
  },
};
