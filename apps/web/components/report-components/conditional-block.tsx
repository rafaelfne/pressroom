import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type ConditionalBlockProps = {
  expression: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'empty' | 'notEmpty';
  compareValue: string;
  pageBreakBehavior: PageBreakBehavior;
};

/**
 * Evaluate the condition after binding resolution.
 * In editor mode, expression is a string like "{{value}}" (unresolved).
 * After resolveBindings(), expression becomes the actual value.
 */
function evaluateCondition(
  expression: unknown,
  operator: string,
  compareValue: string,
): boolean {
  const exprStr = expression === null || expression === undefined ? '' : String(expression);
  switch (operator) {
    case 'empty':
      return exprStr === '' || expression === null || expression === undefined;
    case 'notEmpty':
      return exprStr !== '' && expression !== null && expression !== undefined;
    case 'eq':
      return exprStr === compareValue;
    case 'neq':
      return exprStr !== compareValue;
    case 'gt': {
      const num = Number(expression);
      const cmp = Number(compareValue);
      return !isNaN(num) && !isNaN(cmp) && num > cmp;
    }
    case 'lt': {
      const num = Number(expression);
      const cmp = Number(compareValue);
      return !isNaN(num) && !isNaN(cmp) && num < cmp;
    }
    default:
      return true;
  }
}

/** Check if the expression looks like an unresolved binding */
function isUnresolvedBinding(value: unknown): boolean {
  return typeof value === 'string' && /\{\{.*\}\}/.test(value);
}

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
  render: ({ expression, operator, compareValue, pageBreakBehavior, puck }) => {
    const pageBreakStyles = getPageBreakStyle(pageBreakBehavior);

    // If expression is still an unresolved binding, show editor placeholder
    if (isUnresolvedBinding(expression)) {
      const containerStyle: React.CSSProperties = {
        padding: '1.5rem',
        borderRadius: '0.5rem',
        border: '2px dashed #d1d5db',
        backgroundColor: '#f9fafb',
        ...pageBreakStyles,
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
        eq: '=', neq: '≠', gt: '>', lt: '<',
        empty: 'is empty', notEmpty: 'is not empty',
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
          {puck?.renderDropZone && puck.renderDropZone({ zone: 'conditional-content' })}
        </div>
      );
    }

    // Resolved mode: evaluate the condition
    const conditionMet = evaluateCondition(expression, operator, compareValue);

    if (!conditionMet) {
      // Condition is false — render nothing
      return <></>;
    }

    // Condition is true — render children if available
    return (
      <div style={pageBreakStyles}>
        {puck?.renderDropZone ? puck.renderDropZone({ zone: 'conditional-content' }) : (
          <div style={{ padding: '1rem', fontSize: '0.875rem', color: '#059669' }}>
            Condition met (value: {String(expression)})
          </div>
        )}
      </div>
    );
  },
};
