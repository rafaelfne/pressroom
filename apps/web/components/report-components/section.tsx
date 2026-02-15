import type { ComponentConfig } from '@puckeditor/core';
import { DropZone } from '@puckeditor/core';

export type SectionProps = {
  title: string;
  showDivider: 'true' | 'false';
  backgroundColor: string;
  padding: string;
  id?: string;
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
  },
  defaultProps: {
    title: 'Section Title',
    showDivider: 'true',
    backgroundColor: 'transparent',
    padding: '16',
  },
  render: ({ title, showDivider, backgroundColor, padding, id = 'section' }) => (
    <div
      role="region"
      aria-label={title}
      style={{
        backgroundColor,
        padding: `${padding}px`,
      }}
    >
      {/* h2 is used as the default section heading level for report structure.
          For nested sections, consider document hierarchy or use Container instead. */}
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          marginBottom: '8px',
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
  ),
};
