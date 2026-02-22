'use client';

import type { ComponentConfig } from '@puckeditor/core';
import { useStyleGuide } from '@/contexts/style-guide-context';
import { getPageBreakStyle, type PageBreakBehavior } from '@/lib/utils/page-break';
import { textField, selectField, pageBreakCustomField } from '@/components/puck-fields/field-helpers';
import { resolveStylableValue, type StylableValue } from '@/lib/types/style-system';

export type GridColumnProps = {
  backgroundColor: StylableValue | string;
  padding: StylableValue | string;
  borderWidth: StylableValue | string;
  borderColor: StylableValue | string;
  verticalAlign: 'top' | 'center' | 'bottom';
  pageBreakBehavior: PageBreakBehavior;
};

const verticalAlignMap: Record<GridColumnProps['verticalAlign'], string> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
};

export const GridColumn: ComponentConfig<GridColumnProps> = {
  label: 'Grid Column',
  fields: {
    backgroundColor: textField('Background Color'),
    padding: textField('Padding (px)'),
    borderWidth: textField('Border Width (px)'),
    borderColor: textField('Border Color'),
    verticalAlign: selectField('Vertical Alignment', [
      { label: 'Top', value: 'top' },
      { label: 'Center', value: 'center' },
      { label: 'Bottom', value: 'bottom' },
    ]),
    pageBreakBehavior: pageBreakCustomField,
  },
  defaultProps: {
    backgroundColor: 'transparent',
    padding: '0',
    borderWidth: '0',
    borderColor: '#e5e7eb',
    verticalAlign: 'top',
    pageBreakBehavior: 'auto',
  },
  render: (props) => <GridColumnRender {...props} />,
};

function GridColumnRender({
  backgroundColor,
  padding,
  borderWidth,
  borderColor,
  verticalAlign,
  pageBreakBehavior,
  puck,
  id = 'grid-column',
}: GridColumnProps & { puck: { renderDropZone: (opts: { zone: string }) => React.ReactNode }; id?: string }) {
  const { tokens } = useStyleGuide();
  const resolvedBackgroundColor = resolveStylableValue(backgroundColor, tokens) ?? 'transparent';
  const resolvedBorderColor = resolveStylableValue(borderColor, tokens) ?? '#e5e7eb';
  const resolvedBorderWidth = resolveStylableValue(borderWidth, tokens) ?? '0';
  const resolvedPadding = resolveStylableValue(padding, tokens) ?? '0';

  const addPx = (v: string) => /[a-z%]/i.test(v) ? v : `${v}px`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: verticalAlignMap[verticalAlign],
        backgroundColor: resolvedBackgroundColor,
        padding: addPx(resolvedPadding),
        borderWidth: addPx(resolvedBorderWidth),
        borderStyle: resolvedBorderWidth !== '0' ? 'solid' : 'none',
        borderColor: resolvedBorderColor,
        ...getPageBreakStyle(pageBreakBehavior),
      }}
    >
      {puck.renderDropZone({ zone: `${id}-content` })}
    </div>
  );
}
