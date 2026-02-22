'use client';

import type { ComponentConfig } from '@puckeditor/core';
import { useStyleGuide } from '@/contexts/style-guide-context';
import { getPageBreakStyle, type PageBreakBehavior } from '@/lib/utils/page-break';
import { textField, selectField, radioField, toggleField, textareaField, pageBreakCustomField } from '@/components/puck-fields/field-helpers';
import { resolveStylableValue, type StylableValue } from '@/lib/types/style-system';
import { Database } from 'lucide-react';
import { resolveBindings } from '@/lib/binding';

export type DataTableColumn = {
  field: string;
  header: string;
  width: string;
  align: 'left' | 'center' | 'right';
  bold: string;
  italic: string;
  fontColor: string;
  fontSize: string;
  headerFontSize: string;
  padding: string;
};

export type FooterColumn = {
  content: string;
  align: 'left' | 'center' | 'right';
  bold: string;
  italic: string;
  fontColor: string;
};

export type DataTableProps = {
  dataExpression: string | unknown[];
  columns: DataTableColumn[];
  striped: string;
  bordered: string;
  density: 'dense' | 'compact' | 'normal' | 'custom';
  customRowHeight: string;
  // Header styling
  headerBgColor: StylableValue | string;
  headerTextColor: StylableValue | string;
  headerFontSize: StylableValue | string;
  headerFontWeight: StylableValue | string;
  headerFontFamily: StylableValue | string;
  headerPadding: StylableValue | string;
  headerBorderColor: StylableValue | string;
  headerTextTransform: string;
  // Group header styling
  showGroupHeaders: string;
  groupHeaderBgColor: StylableValue | string;
  groupHeaderTextColor: StylableValue | string;
  groupHeaderFontSize: StylableValue | string;
  groupHeaderFontWeight: StylableValue | string;
  groupHeaderFontFamily: StylableValue | string;
  groupHeaderPadding: StylableValue | string;
  groupHeaderBorderColor: StylableValue | string;
  groupHeaderTextTransform: string;
  groupHeaderTextAlign: string;
  // Footer
  showFooterRow: string;
  footerMode: 'columns' | 'freetext';
  footerLabel: string;
  footerColumns: FooterColumn[];
  footerBgColor: StylableValue | string;
  footerTextColor: StylableValue | string;
  footerFontSize: StylableValue | string;
  footerFontWeight: StylableValue | string;
  footerFontFamily: StylableValue | string;
  footerPadding: StylableValue | string;
  footerBorderColor: StylableValue | string;
  footerTextTransform: string;
  // Rows
  evenRowColor: StylableValue | string;
  oddRowColor: StylableValue | string;
  verticalBorders: string;
  pageBreakBehavior: PageBreakBehavior;
  visibilityCondition: string;
};

/** Pre-resolved color and typography values for reuse by server-config (no hooks needed). */
export type ResolvedDataTableColors = {
  rHeaderBgColor: string;
  rHeaderTextColor: string;
  rHeaderBorderColor: string;
  rHeaderFontSize: string;
  rHeaderFontWeight: string;
  rHeaderFontFamily: string;
  rHeaderPadding: string;
  rGroupHeaderBgColor: string;
  rGroupHeaderTextColor: string;
  rGroupHeaderBorderColor: string;
  rGroupHeaderFontSize: string;
  rGroupHeaderFontWeight: string;
  rGroupHeaderFontFamily: string;
  rGroupHeaderPadding: string;
  rFooterBgColor: string;
  rFooterTextColor: string;
  rFooterBorderColor: string;
  rFooterFontSize: string;
  rFooterFontWeight: string;
  rFooterFontFamily: string;
  rFooterPadding: string;
  rEvenRowColor: string;
  rOddRowColor: string;
};

/** Pixels added per indent level for sub-item rows */
const INDENT_STEP_PX = 12;

/**
 * Parse a column field expression into a data path and optional pipe expression.
 * Examples:
 *   "name"                    → { path: "name", pipes: undefined }
 *   "price | currency:'BRL'"  → { path: "price", pipes: "currency:'BRL'" }
 *   "value | percent:2 | sign" → { path: "value", pipes: "percent:2 | sign" }
 */
function parseFieldExpression(field: string): { path: string; pipes: string | undefined } {
  const pipeIndex = field.indexOf('|');
  if (pipeIndex === -1) {
    return { path: field.trim(), pipes: undefined };
  }
  return {
    path: field.slice(0, pipeIndex).trim(),
    pipes: field.slice(pipeIndex + 1).trim(),
  };
}

/**
 * Resolve a column value from a data row, applying optional pipe formatting.
 * The field string can contain pipes: "price | currency:'BRL'"
 */
function resolveColumnValue(row: Record<string, unknown>, field: string): string {
  const { path, pipes } = parseFieldExpression(field);
  const rawValue = getNestedValue(row, path);

  if (rawValue === null || rawValue === undefined) {
    return '';
  }

  // No pipes — return plain string
  if (!pipes) {
    return String(rawValue);
  }

  // Build a synthetic binding expression and resolve it using the binding engine.
  // e.g. field = "price | currency:'BRL'" → expression = "{{__val | currency:'BRL'}}"
  try {
    const expression = `{{__val | ${pipes}}}`;
    const result = resolveBindings(expression, { __val: rawValue });
    return result !== null && result !== undefined ? String(result) : String(rawValue);
  } catch {
    return String(rawValue);
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

/**
 * Calculate total table width from column widths.
 * Returns null if any column uses 'auto' or '%' (cannot determine fixed width).
 */
function calculateTableWidth(columns: DataTableColumn[]): number | null {
  let totalPx = 0;

  for (const col of columns) {
    const width = col.width || 'auto';

    if (width === 'auto' || width.includes('%')) {
      return null; // Cannot determine fixed width
    }

    // Parse px values (e.g., "120px" → 120)
    const match = width.match(/^(\d+(?:\.\d+)?)px$/);
    if (match) {
      totalPx += parseFloat(match[1]);
    } else {
      return null; // Unsupported unit
    }
  }

  return totalPx;
}

/**
 * Convert column widths array into a CSS grid-template-columns value.
 * - "auto" → "1fr"
 * - "120px" → "120px"
 * - "30%" → "30%"
 */
function buildGridTemplateColumns(columns: DataTableColumn[]): string {
  return columns
    .map((col) => {
      const w = col.width?.trim();
      if (!w || w === 'auto') return '1fr';
      return w;
    })
    .join(' ');
}

export const DataTable: ComponentConfig<DataTableProps> = {
  label: 'Data Table',
  fields: {
    dataExpression: textField('Data Source'),
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
        fontSize: {
          type: 'text',
          label: 'Font Size',
        },
        headerFontSize: {
          type: 'text',
          label: 'Header Font Size',
        },
        padding: {
          type: 'text',
          label: 'Cell Padding',
        },
      },
      defaultItemProps: {
        field: 'field',
        header: 'Column',
        width: 'auto',
        align: 'left' as const,
        bold: 'false',
        italic: 'false',
        fontColor: '',
        fontSize: '',
        headerFontSize: '',
        padding: '',
      },
    },
    striped: toggleField('Zebra Striping'),
    bordered: toggleField('Borders'),
    density: selectField('Density', [
      { label: 'Dense', value: 'dense' },
      { label: 'Compact', value: 'compact' },
      { label: 'Normal', value: 'normal' },
      { label: 'Custom', value: 'custom' },
    ]),
    customRowHeight: textField('Custom Row Height (px)'),
    // --- Header styling fields ---
    headerBgColor: textField('Header Background Color'),
    headerTextColor: textField('Header Text Color'),
    headerFontSize: textField('Header Font Size'),
    headerFontWeight: textField('Header Font Weight'),
    headerFontFamily: textField('Header Font Family'),
    headerPadding: textField('Header Padding'),
    headerBorderColor: textField('Header Border Color'),
    headerTextTransform: selectField('Header Text Transform', [
      { label: 'None', value: 'none' },
      { label: 'Uppercase', value: 'uppercase' },
      { label: 'Lowercase', value: 'lowercase' },
      { label: 'Capitalize', value: 'capitalize' },
    ]),
    // --- Group header fields ---
    showGroupHeaders: toggleField('Show Group Headers'),
    groupHeaderBgColor: textField('Group Header Background Color'),
    groupHeaderTextColor: textField('Group Header Text Color'),
    groupHeaderFontSize: textField('Group Header Font Size'),
    groupHeaderFontWeight: textField('Group Header Font Weight'),
    groupHeaderFontFamily: textField('Group Header Font Family'),
    groupHeaderPadding: textField('Group Header Padding'),
    groupHeaderBorderColor: textField('Group Header Border Color'),
    groupHeaderTextTransform: selectField('Group Header Text Transform', [
      { label: 'None', value: 'none' },
      { label: 'Uppercase', value: 'uppercase' },
      { label: 'Lowercase', value: 'lowercase' },
      { label: 'Capitalize', value: 'capitalize' },
    ]),
    groupHeaderTextAlign: selectField('Group Header Text Align', [
      { label: 'Left', value: 'left' },
      { label: 'Center', value: 'center' },
      { label: 'Right', value: 'right' },
    ]),
    // --- Footer fields ---
    showFooterRow: toggleField('Show Footer Row'),
    footerMode: radioField('Footer Mode', [
      { label: 'Per Column', value: 'columns' },
      { label: 'Free Text (Full Width)', value: 'freetext' },
    ]),
    footerLabel: textField('Footer Label'),
    footerColumns: {
      type: 'array',
      label: 'Footer Columns',
      arrayFields: {
        content: {
          type: 'text',
          label: 'Content / Expression',
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
        content: '',
        align: 'left' as const,
        bold: 'false',
        italic: 'false',
        fontColor: '',
      },
    },
    footerBgColor: textField('Footer Background Color'),
    footerTextColor: textField('Footer Text Color'),
    footerFontSize: textField('Footer Font Size'),
    footerFontWeight: textField('Footer Font Weight'),
    footerFontFamily: textField('Footer Font Family'),
    footerPadding: textField('Footer Padding'),
    footerBorderColor: textField('Footer Border Color'),
    footerTextTransform: selectField('Footer Text Transform', [
      { label: 'None', value: 'none' },
      { label: 'Uppercase', value: 'uppercase' },
      { label: 'Lowercase', value: 'lowercase' },
      { label: 'Capitalize', value: 'capitalize' },
    ]),
    // --- Row colors ---
    evenRowColor: textField('Even Row Color'),
    oddRowColor: textField('Odd Row Color'),
    verticalBorders: toggleField('Vertical Borders'),
    pageBreakBehavior: pageBreakCustomField,
    visibilityCondition: textareaField('Visibility Condition (JSON)'),
  },
  defaultProps: {
    dataExpression: '{{data.items}}',
    columns: [
      { field: 'name', header: 'Name', width: 'auto', align: 'left', bold: 'false', italic: 'false', fontColor: '', fontSize: '', headerFontSize: '', padding: '' },
      { field: 'quantity', header: 'Quantity', width: '100px', align: 'center', bold: 'false', italic: 'false', fontColor: '', fontSize: '', headerFontSize: '', padding: '' },
      { field: 'price | currency:\'BRL\'', header: 'Price', width: '120px', align: 'right', bold: 'false', italic: 'false', fontColor: '', fontSize: '', headerFontSize: '', padding: '' },
      { field: 'date | date:\'DD/MM/YYYY\'', header: 'Date', width: '120px', align: 'center', bold: 'false', italic: 'false', fontColor: '', fontSize: '', headerFontSize: '', padding: '' },
    ],
    striped: 'true',
    bordered: 'true',
    density: 'normal',
    customRowHeight: '',
    headerBgColor: '#f3f4f6',
    headerTextColor: '#111827',
    headerFontSize: '',
    headerFontWeight: '600',
    headerFontFamily: '',
    headerPadding: '',
    headerBorderColor: '',
    headerTextTransform: 'none',
    showGroupHeaders: 'true',
    groupHeaderBgColor: '#1a5632',
    groupHeaderTextColor: '#ffffff',
    groupHeaderFontSize: '',
    groupHeaderFontWeight: 'bold',
    groupHeaderFontFamily: '',
    groupHeaderPadding: '',
    groupHeaderBorderColor: '',
    groupHeaderTextTransform: 'none',
    groupHeaderTextAlign: 'left',
    showFooterRow: 'false',
    footerMode: 'columns',
    footerLabel: 'Total',
    footerColumns: [],
    footerBgColor: '#f3f4f6',
    footerTextColor: '#111827',
    footerFontSize: '',
    footerFontWeight: 'bold',
    footerFontFamily: '',
    footerPadding: '',
    footerBorderColor: '',
    footerTextTransform: 'none',
    evenRowColor: 'transparent',
    oddRowColor: '#f9fafb',
    verticalBorders: 'false',
    pageBreakBehavior: 'auto',
    visibilityCondition: '',
  },
  render: (props) => <DataTableRender {...props} />,
};

/** Shared render logic for client and server rendering (no React hooks). */
export function renderDataTableBody(
  props: Omit<DataTableProps, 'visibilityCondition'>,
  colors: ResolvedDataTableColors,
): React.ReactNode {
    const {
      dataExpression, columns, striped, bordered, density, customRowHeight,
      headerTextTransform,
      showGroupHeaders, groupHeaderTextTransform, groupHeaderTextAlign,
      showFooterRow, footerMode, footerLabel, footerColumns,
      footerTextTransform,
      verticalBorders, pageBreakBehavior,
    } = props;
    const {
      rHeaderBgColor, rHeaderTextColor, rHeaderBorderColor,
      rHeaderFontSize, rHeaderFontWeight, rHeaderFontFamily, rHeaderPadding,
      rGroupHeaderBgColor, rGroupHeaderTextColor, rGroupHeaderBorderColor,
      rGroupHeaderFontSize, rGroupHeaderFontWeight, rGroupHeaderFontFamily, rGroupHeaderPadding,
      rFooterBgColor, rFooterTextColor, rFooterBorderColor,
      rFooterFontSize, rFooterFontWeight, rFooterFontFamily, rFooterPadding,
      rEvenRowColor, rOddRowColor,
    } = colors;
    const pageBreakStyle = getPageBreakStyle(pageBreakBehavior);

    // After resolveBindings() in the PDF pipeline, dataExpression becomes the actual array.
    // In the Studio, the HOC wrapper in config.ts resolves bindings before rendering.
    const data = Array.isArray(dataExpression)
      ? (dataExpression as Record<string, unknown>[])
      : null;

    // When binding is not resolved yet (Studio preview), show placeholder
    if (!data) {
      return (
        <div
          style={{
            padding: '24px 16px',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            color: '#6b7280',
            textAlign: 'center',
            maxWidth: '100%',
            fontSize: '14px',
            lineHeight: '1.6',
          }}
        >
          <div className='flex justify-center py-4'>
            <Database size={36} />
          </div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            Configure a data source to render the table
          </div>
          <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#9ca3af' }}>
            {typeof dataExpression === 'string' ? dataExpression : 'No expression set'}
          </div>
        </div>
      );
    }

    // Validate that we have rows
    if (data.length === 0) {
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
          No data available. The data source returned an empty array.
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

    const colCount = columns.length;
    const isStriped = striped === 'true';
    const isBordered = bordered === 'true';
    const hasVerticalBorders = verticalBorders === 'true';
    const shouldShowFooter = showFooterRow === 'true';
    const shouldShowGroupHeaders = showGroupHeaders !== 'false';

    // Density-based styles
    let baseFontSize: string;
    let baseLineHeight: string;
    let bodyCellPadding: string;
    let defaultHeaderCellPadding: string;

    switch (density) {
      case 'dense':
        baseFontSize = '11px';
        baseLineHeight = '1.2';
        bodyCellPadding = '2px 6px';
        defaultHeaderCellPadding = '4px 6px';
        break;
      case 'compact':
        baseFontSize = '12px';
        baseLineHeight = '1.4';
        bodyCellPadding = '4px 8px';
        defaultHeaderCellPadding = '6px 8px';
        break;
      case 'custom': {
        const h = parseInt(customRowHeight, 10);
        const rowH = !isNaN(h) && h > 0 ? h : 32;
        const vPad = Math.max(1, Math.round((rowH - 14 * 1.5) / 2));
        baseFontSize = '14px';
        baseLineHeight = '1.5';
        bodyCellPadding = `${vPad}px 12px`;
        defaultHeaderCellPadding = `${vPad}px 12px`;
        break;
      }
      case 'normal':
      default:
        baseFontSize = '14px';
        baseLineHeight = '1.5';
        bodyCellPadding = '8px 12px';
        defaultHeaderCellPadding = '10px 12px';
        break;
    }

    // Calculate table width for PDF optimization and auto-scaling
    const totalTableWidth = calculateTableWidth(columns);
    const MAX_PAGE_WIDTH = 1067;

    let scaleTransform: string | undefined;
    if (totalTableWidth && totalTableWidth > MAX_PAGE_WIDTH) {
      const scaleFactor = MAX_PAGE_WIDTH / totalTableWidth;
      scaleTransform = `scale(${scaleFactor.toFixed(3)})`;

      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `DataTable width (${totalTableWidth}px) exceeds page width. ` +
          `Scaling to ${(scaleFactor * 100).toFixed(1)}%.`
        );
      }
    }

    // Grid template columns from column definitions
    const gridTemplateColumns = buildGridTemplateColumns(columns);

    // Container styles
    const containerStyle: React.CSSProperties = {
      maxWidth: '100%',
      overflowX: 'visible',
      transform: scaleTransform,
      transformOrigin: 'top left',
      ...pageBreakStyle,
    };

    // CSS Grid layout
    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns,
      width: '100%',
      fontSize: baseFontSize,
      lineHeight: baseLineHeight,
    };

    // Resolved border colors
    const resolvedHeaderBorderColor = rHeaderBorderColor || '#d1d5db';
    const resolvedFooterBorderColor = rFooterBorderColor || '#d1d5db';

    // ── Header cell base style ──
    const thBaseStyle: React.CSSProperties = {
      backgroundColor: rHeaderBgColor,
      color: rHeaderTextColor,
      fontWeight: rHeaderFontWeight || 600,
      padding: rHeaderPadding || defaultHeaderCellPadding,
      textAlign: 'left',
      borderBottom: isBordered ? `2px solid ${resolvedHeaderBorderColor}` : 'none',
      borderRight: (isBordered || hasVerticalBorders) ? '1px solid #e5e7eb' : 'none',
    };
    if (rHeaderFontSize) thBaseStyle.fontSize = rHeaderFontSize;
    if (rHeaderFontFamily) thBaseStyle.fontFamily = rHeaderFontFamily;
    if (headerTextTransform && headerTextTransform !== 'none') {
      thBaseStyle.textTransform = headerTextTransform as React.CSSProperties['textTransform'];
    }

    // ── Body cell base style ──
    const tdBaseStyle: React.CSSProperties = {
      padding: bodyCellPadding,
      borderBottom: isBordered ? '1px solid #e5e7eb' : 'none',
      borderRight: (isBordered || hasVerticalBorders) ? '1px solid #e5e7eb' : 'none',
    };

    // ── Footer row base style ──
    const footerRowBaseStyle: React.CSSProperties = {
      backgroundColor: rFooterBgColor,
      color: rFooterTextColor,
      fontWeight: rFooterFontWeight || 'bold',
      borderTop: `2px solid ${resolvedFooterBorderColor}`,
    };
    if (rFooterFontSize) footerRowBaseStyle.fontSize = rFooterFontSize;
    if (rFooterFontFamily) footerRowBaseStyle.fontFamily = rFooterFontFamily;
    if (footerTextTransform && footerTextTransform !== 'none') {
      footerRowBaseStyle.textTransform = footerTextTransform as React.CSSProperties['textTransform'];
    }
    const footerCellPadding = rFooterPadding || bodyCellPadding;

    // ── Build body rows ──
    let dataRowIndex = 0;
    const bodyRows: React.ReactNode[] = [];

    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const rowData = data[rowIndex] as Record<string, unknown>;
      const isGroupHeader = rowData._isGroupHeader === true;

      if (isGroupHeader) {
        if (!shouldShowGroupHeaders) continue;

        const groupLabel = (rowData._groupLabel || getNestedValue(rowData, parseFieldExpression(columns[0].field).path)) as string;

        const ghCellStyle: React.CSSProperties = {
          ...tdBaseStyle,
          gridColumn: '1 / -1',
          fontWeight: rGroupHeaderFontWeight || 'bold',
          backgroundColor: rGroupHeaderBgColor,
          color: rGroupHeaderTextColor,
          borderRight: 'none',
          textAlign: (groupHeaderTextAlign as React.CSSProperties['textAlign']) || 'left',
        };
        if (rGroupHeaderFontSize) ghCellStyle.fontSize = rGroupHeaderFontSize;
        if (rGroupHeaderFontFamily) ghCellStyle.fontFamily = rGroupHeaderFontFamily;
        if (rGroupHeaderPadding) ghCellStyle.padding = rGroupHeaderPadding;
        if (rGroupHeaderBorderColor) ghCellStyle.borderBottom = `1px solid ${rGroupHeaderBorderColor}`;
        if (groupHeaderTextTransform && groupHeaderTextTransform !== 'none') {
          ghCellStyle.textTransform = groupHeaderTextTransform as React.CSSProperties['textTransform'];
        }

        bodyRows.push(
          <div
            key={`row-${rowIndex}`}
            role="row"
            data-group-header="true"
            style={{ display: 'contents' }}
          >
            <div
              role="cell"
              data-colspan={colCount}
              style={ghCellStyle}
            >
              {groupLabel}
            </div>
          </div>
        );
      } else {
        const currentDataRowIndex = dataRowIndex;
        dataRowIndex++;

        const rowBgColor = isStriped
          ? currentDataRowIndex % 2 === 0
            ? rEvenRowColor
            : rOddRowColor
          : 'transparent';

        bodyRows.push(
          <div
            key={`row-${rowIndex}`}
            role="row"
            style={{ display: 'contents' }}
          >
            {columns.map((column, colIndex) => {
              const formattedValue = resolveColumnValue(rowData, column.field);
              const indent = (rowData._indent as number) || 0;

              const cellStyle: React.CSSProperties = {
                ...tdBaseStyle,
                backgroundColor: rowBgColor,
                textAlign: column.align || 'left',
                borderRight: ((isBordered || hasVerticalBorders) && colIndex === colCount - 1) ? 'none' : tdBaseStyle.borderRight,
              };

              if (column.bold === 'true') cellStyle.fontWeight = 'bold';
              if (column.italic === 'true') cellStyle.fontStyle = 'italic';
              if (column.fontColor && column.fontColor.trim() !== '') cellStyle.color = column.fontColor;
              if (column.fontSize && column.fontSize.trim() !== '') cellStyle.fontSize = column.fontSize;
              if (column.padding && column.padding.trim() !== '') cellStyle.padding = column.padding;

              // Apply indentation to first column
              if (colIndex === 0 && indent > 0) {
                const currentPadding = bodyCellPadding.split(' ');
                const verticalPadding = currentPadding[0];
                const horizontalPadding = currentPadding[1] || currentPadding[0];
                const additionalIndent = indent * INDENT_STEP_PX;
                const paddingValue = parseInt(horizontalPadding, 10);

                if (!isNaN(paddingValue)) {
                  const totalPaddingLeft = paddingValue + additionalIndent;
                  cellStyle.paddingLeft = `${totalPaddingLeft}px`;
                  cellStyle.paddingRight = horizontalPadding;
                  cellStyle.paddingTop = verticalPadding;
                  cellStyle.paddingBottom = verticalPadding;
                }
              }

              return (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  role="cell"
                  style={cellStyle}
                >
                  {formattedValue}
                </div>
              );
            })}
          </div>
        );
      }
    }

    // ── Assemble the full CSS Grid layout ──
    return (
      <div style={containerStyle} data-testid="data-table-grid">
        <div style={gridStyle} role="table">
          {/* Header */}
          <div role="rowgroup" data-section="header" style={{ display: 'contents' }}>
            <div role="row" style={{ display: 'contents' }}>
              {columns.map((column, index) => (
                <div
                  key={`header-${index}`}
                  role="columnheader"
                  style={{
                    ...thBaseStyle,
                    textAlign: column.align || 'left',
                    borderRight: ((isBordered || hasVerticalBorders) && index === colCount - 1) ? 'none' : thBaseStyle.borderRight,
                    ...(column.headerFontSize && column.headerFontSize.trim() !== '' ? { fontSize: column.headerFontSize } : {}),
                  }}
                >
                  {column.header}
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div role="rowgroup" data-section="body" style={{ display: 'contents' }}>
            {bodyRows}
          </div>

          {/* Footer */}
          {shouldShowFooter && (
            <div role="rowgroup" data-section="footer" style={{ display: 'contents' }}>
              <div role="row" style={{ display: 'contents' }}>
                {footerMode === 'freetext' ? (
                  <div
                    role="cell"
                    data-colspan={colCount}
                    style={{
                      ...tdBaseStyle,
                      ...footerRowBaseStyle,
                      gridColumn: '1 / -1',
                      padding: footerCellPadding,
                      borderRight: 'none',
                    }}
                  >
                    {footerLabel || 'Total'}
                  </div>
                ) : (
                  columns.map((column, colIndex) => {
                    const fc = footerColumns?.[colIndex];
                    const cellContent = fc?.content ?? (colIndex === 0 ? (footerLabel || 'Total') : '');

                    const fCellStyle: React.CSSProperties = {
                      ...tdBaseStyle,
                      ...footerRowBaseStyle,
                      padding: footerCellPadding,
                      textAlign: fc?.align || column.align || 'left',
                      borderRight: ((isBordered || hasVerticalBorders) && colIndex === colCount - 1) ? 'none' : tdBaseStyle.borderRight,
                    };

                    if (fc?.bold === 'true') fCellStyle.fontWeight = 'bold';
                    if (fc?.italic === 'true') fCellStyle.fontStyle = 'italic';
                    if (fc?.fontColor && fc.fontColor.trim() !== '') fCellStyle.color = fc.fontColor;

                    return (
                      <div key={`footer-${colIndex}`} role="cell" style={fCellStyle}>
                        {cellContent}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
}

function DataTableRender(props: Omit<DataTableProps, 'visibilityCondition'>) {
  const { tokens } = useStyleGuide();
  return renderDataTableBody(props, {
    rHeaderBgColor: resolveStylableValue(props.headerBgColor, tokens) ?? '#f3f4f6',
    rHeaderTextColor: resolveStylableValue(props.headerTextColor, tokens) ?? '#111827',
    rHeaderBorderColor: resolveStylableValue(props.headerBorderColor, tokens) ?? '#d1d5db',
    rHeaderFontSize: resolveStylableValue(props.headerFontSize, tokens) ?? '',
    rHeaderFontWeight: resolveStylableValue(props.headerFontWeight, tokens) ?? '600',
    rHeaderFontFamily: resolveStylableValue(props.headerFontFamily, tokens) ?? '',
    rHeaderPadding: resolveStylableValue(props.headerPadding, tokens) ?? '',
    rGroupHeaderBgColor: resolveStylableValue(props.groupHeaderBgColor, tokens) ?? '#1a5632',
    rGroupHeaderTextColor: resolveStylableValue(props.groupHeaderTextColor, tokens) ?? '#ffffff',
    rGroupHeaderBorderColor: resolveStylableValue(props.groupHeaderBorderColor, tokens) ?? '',
    rGroupHeaderFontSize: resolveStylableValue(props.groupHeaderFontSize, tokens) ?? '',
    rGroupHeaderFontWeight: resolveStylableValue(props.groupHeaderFontWeight, tokens) ?? 'bold',
    rGroupHeaderFontFamily: resolveStylableValue(props.groupHeaderFontFamily, tokens) ?? '',
    rGroupHeaderPadding: resolveStylableValue(props.groupHeaderPadding, tokens) ?? '',
    rFooterBgColor: resolveStylableValue(props.footerBgColor, tokens) ?? '#f3f4f6',
    rFooterTextColor: resolveStylableValue(props.footerTextColor, tokens) ?? '#111827',
    rFooterBorderColor: resolveStylableValue(props.footerBorderColor, tokens) ?? '#d1d5db',
    rFooterFontSize: resolveStylableValue(props.footerFontSize, tokens) ?? '',
    rFooterFontWeight: resolveStylableValue(props.footerFontWeight, tokens) ?? 'bold',
    rFooterFontFamily: resolveStylableValue(props.footerFontFamily, tokens) ?? '',
    rFooterPadding: resolveStylableValue(props.footerPadding, tokens) ?? '',
    rEvenRowColor: resolveStylableValue(props.evenRowColor, tokens) ?? 'transparent',
    rOddRowColor: resolveStylableValue(props.oddRowColor, tokens) ?? '#f9fafb',
  });
}
