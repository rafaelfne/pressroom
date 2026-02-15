import type { ComponentConfig } from '@puckeditor/core';
import { DropZone } from '@puckeditor/core';

export type GridColumnProps = {
  backgroundColor: string;
  padding: string;
  borderWidth: string;
  borderColor: string;
  verticalAlign: 'top' | 'center' | 'bottom';
  pageBreakBehavior: 'auto' | 'avoid' | 'before' | 'after';
};

const verticalAlignMap: Record<GridColumnProps['verticalAlign'], string> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
};

export const GridColumn: ComponentConfig<GridColumnProps> = {
  label: 'Grid Column',
  fields: {
    backgroundColor: {
      type: 'text',
      label: 'Background Color',
    },
    padding: {
      type: 'text',
      label: 'Padding (px)',
    },
    borderWidth: {
      type: 'text',
      label: 'Border Width (px)',
    },
    borderColor: {
      type: 'text',
      label: 'Border Color',
    },
    verticalAlign: {
      type: 'select',
      label: 'Vertical Alignment',
      options: [
        { label: 'Top', value: 'top' },
        { label: 'Center', value: 'center' },
        { label: 'Bottom', value: 'bottom' },
      ],
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
    backgroundColor: 'transparent',
    padding: '0',
    borderWidth: '0',
    borderColor: '#e5e7eb',
    verticalAlign: 'top',
    pageBreakBehavior: 'auto',
  },
  render: ({ backgroundColor, padding, borderWidth, borderColor, verticalAlign, pageBreakBehavior, id = 'grid-column' }) => {
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
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: verticalAlignMap[verticalAlign],
          backgroundColor,
          padding: `${padding}px`,
          borderWidth: `${borderWidth}px`,
          borderStyle: borderWidth !== '0' ? 'solid' : 'none',
          borderColor,
          ...pageBreakStyle,
        }}
      >
        <DropZone zone={`${id}-content`} minEmptyHeight={40} />
      </div>
    );
  },
};
