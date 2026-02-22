'use client';

import type { ComponentConfig } from '@puckeditor/core';
import { useStyleGuide } from '@/contexts/style-guide-context';
import { textField, selectField, radioField, toggleField, textareaField, pageBreakCustomField } from '@/components/puck-fields/field-helpers';
import { resolveStylableValue } from '@/lib/types/style-system';
import {
  renderDataTableBody,
  type DataTableColumn,
  type FooterColumn,
  type DataTableProps,
  type ResolvedDataTableColors,
} from '@/components/report-components/data-table-body';

// Re-export types and renderDataTableBody for backward compatibility
export { renderDataTableBody, type DataTableColumn, type FooterColumn, type DataTableProps, type ResolvedDataTableColors };

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
