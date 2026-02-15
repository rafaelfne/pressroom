import type { ComponentConfig } from '@puckeditor/core';
import { DropZone } from '@puckeditor/core';

export type SectionProps = {
  title: string;
  showDivider: 'true' | 'false';
  backgroundColor: string;
  padding: string;
  pageBreakBehavior: 'auto' | 'avoid' | 'before' | 'after';
};

export const Section: ComponentConfig<SectionProps> = {
  label: 'Section',
  fields: {
    title: {
      type: 'text',
      label: 'Section Title',
    },
    showDivider: {
      type: 'radio',
      label: 'Show Divider',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color',
    },
    padding: {
      type: 'text',
      label: 'Padding (px)',
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
    title: 'Section Title',
    showDivider: 'true',
    backgroundColor: 'transparent',
    padding: '16',
    pageBreakBehavior: 'auto',
  },
  render: ({ title, showDivider, backgroundColor, padding, pageBreakBehavior, id = 'section' }) => {
    const pageBreakStyle: React.CSSProperties = {};
    if (pageBreakBehavior === 'avoid') {
      pageBreakStyle.pageBreakInside = 'avoid';
    } else if (pageBreakBehavior === 'before') {
      pageBreakStyle.pageBreakBefore = 'always';
    } else if (pageBreakBehavior === 'after') {
      pageBreakStyle.pageBreakAfter = 'always';
    }

    return (
      <div
        role="region"
        aria-label={title}
        style={{
          backgroundColor,
          padding: `${padding}px`,
          ...pageBreakStyle,
        }}
      >
        {/* h2 is used as the default section heading level for report structure.
            For nested sections, consider document hierarchy or use Container instead. */}
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '8px',
            pageBreakAfter: 'avoid',
          }}
        >
          {title}
        </h2>
        {showDivider === 'true' && (
          <hr
            style={{
              borderTop: '1px solid #e5e7eb',
              borderBottom: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              marginBottom: '12px',
              marginTop: 0,
            }}
          />
        )}
        <DropZone zone={`${id}-content`} minEmptyHeight={40} />
      </div>
    );
  },
};
