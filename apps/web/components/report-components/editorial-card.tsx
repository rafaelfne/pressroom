import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';
import { useResolvedValue } from '@/hooks/use-resolved-value';

export type EditorialCardProps = {
  title: string;
  description: string;
  pageBreakBehavior: PageBreakBehavior;
};

export const EditorialCard: ComponentConfig<EditorialCardProps> = {
  label: 'Editorial Card',
  fields: {
    title: { type: 'text', label: 'Title' },
    description: { type: 'textarea', label: 'Description' },
    pageBreakBehavior: pageBreakField,
  },
  defaultProps: {
    title: 'Card Title',
    description: 'Card description text',
    pageBreakBehavior: 'auto',
  },
  render: ({ title, description, pageBreakBehavior }) => {
    const resolvedTitle = useResolvedValue(title);
    const resolvedDescription = useResolvedValue(description);
    const containerStyle: React.CSSProperties = {
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      backgroundColor: '#ffffff',
      ...getPageBreakStyle(pageBreakBehavior),
    };

    const titleStyle: React.CSSProperties = {
      fontSize: '1.125rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.75rem',
    };

    const descriptionStyle: React.CSSProperties = {
      fontSize: '0.875rem',
      color: '#6b7280',
      lineHeight: '1.6',
    };

    return (
      <div style={containerStyle}>
        <div style={titleStyle}>{resolvedTitle}</div>
        <div style={descriptionStyle}>{resolvedDescription}</div>
      </div>
    );
  },
};
