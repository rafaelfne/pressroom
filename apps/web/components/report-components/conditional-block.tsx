import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type ConditionalBlockProps = {
  expression: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'empty' | 'notEmpty';
  compareValue: string;
  pageBreakBehavior: PageBreakBehavior;
};

export const ConditionalBlock: ComponentConfig<ConditionalBlockProps> = {
  label: 'Conditional Block',
  fields: {
    expression: { type: 'text', label: 'Expression' },
    operator: {
      type: 'select',
      label: 'Operator',
      options: [
        { label: 'Equals (=)', value: 'eq' },
        { label: 'Not Equals (≠)', value: 'neq' },
        { label: 'Greater Than (>)', value: 'gt' },
        { label: 'Less Than (<)', value: 'lt' },
        { label: 'Is Empty', value: 'empty' },
        { label: 'Is Not Empty', value: 'notEmpty' },
      ],
    },
    compareValue: { type: 'text', label: 'Compare Value' },
    pageBreakBehavior: pageBreakField,
  },
  defaultProps: {
    expression: '{{value}}',
    operator: 'notEmpty',
    compareValue: '',
    pageBreakBehavior: 'auto',
  },
  render: ({ expression, operator, compareValue, pageBreakBehavior }) => {
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
      marginBottom: '0.75rem',
    };

    const conditionStyle: React.CSSProperties = {
      fontSize: '0.875rem',
      color: '#6b7280',
      fontFamily: 'monospace',
      backgroundColor: '#f3f4f6',
      padding: '0.75rem',
      borderRadius: '0.25rem',
      marginBottom: '0.5rem',
    };

    const noteStyle: React.CSSProperties = {
      fontSize: '0.75rem',
      color: '#9ca3af',
      fontStyle: 'italic',
    };

    const operatorLabels: Record<string, string> = {
      eq: '=',
      neq: '≠',
      gt: '>',
      lt: '<',
      empty: 'is empty',
      notEmpty: 'is not empty',
    };

    const operatorLabel = operatorLabels[operator] || operator;
    const conditionDisplay =
      operator === 'empty' || operator === 'notEmpty'
        ? `${expression} ${operatorLabel}`
        : `${expression} ${operatorLabel} ${compareValue}`;

    return (
      <div style={containerStyle}>
        <div style={titleStyle}>Conditional Block</div>
        <div style={conditionStyle}>Show if: {conditionDisplay}</div>
        <div style={noteStyle}>
          Content will be rendered only when the condition evaluates to true
        </div>
      </div>
    );
  },
};
