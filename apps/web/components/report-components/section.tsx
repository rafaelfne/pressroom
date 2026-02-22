'use client';

import type { ComponentConfig } from '@puckeditor/core';
import { useStyleGuide } from '@/contexts/style-guide-context';
import { getPageBreakStyle, type PageBreakBehavior } from '@/lib/utils/page-break';
import { textField, toggleField, pageBreakCustomField } from '@/components/puck-fields/field-helpers';
import { resolveStylableValue, type StylableValue } from '@/lib/types/style-system';

export type SectionProps = {
  title: string;
  showDivider: 'true' | 'false';
  backgroundColor: StylableValue | string;
  padding: StylableValue | string;
  pageBreakBehavior: PageBreakBehavior;
};

export const Section: ComponentConfig<SectionProps> = {
  label: 'Section',
  fields: {
    title: textField('Section Title'),
    showDivider: toggleField('Show Divider'),
    backgroundColor: textField('Background Color'),
    padding: textField('Padding (px)'),
    pageBreakBehavior: pageBreakCustomField,
  },
  defaultProps: {
    title: 'Section Title',
    showDivider: 'true',
    backgroundColor: 'transparent',
    padding: '16',
    pageBreakBehavior: 'auto',
  },
  render: (props) => <SectionRender {...props} />,
};

function SectionRender({
  title,
  showDivider,
  backgroundColor,
  padding,
  pageBreakBehavior,
  puck,
  id = 'section',
}: SectionProps & { puck: { renderDropZone: (opts: { zone: string }) => React.ReactNode }; id?: string }) {
  const { tokens } = useStyleGuide();
  const resolvedBackgroundColor = resolveStylableValue(backgroundColor, tokens) ?? 'transparent';
  const resolvedPadding = resolveStylableValue(padding, tokens) ?? '16';
  const paddingCss = /[a-z%]/i.test(resolvedPadding) ? resolvedPadding : `${resolvedPadding}px`;

  return (
    <div
      role="region"
      aria-label={title}
      style={{
        backgroundColor: resolvedBackgroundColor,
        padding: paddingCss,
        ...getPageBreakStyle(pageBreakBehavior),
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
      {puck.renderDropZone({ zone: `${id}-content` })}
    </div>
  );
}
