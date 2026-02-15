import type { ComponentConfig } from '@puckeditor/core';
import { DropZone } from '@puckeditor/core';

export type GridColumnProps = {
  backgroundColor: string;
  padding: string;
  borderWidth: string;
  borderColor: string;
  verticalAlign: 'top' | 'center' | 'bottom';
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
  },
  defaultProps: {
    backgroundColor: 'transparent',
    padding: '0',
    borderWidth: '0',
    borderColor: '#e5e7eb',
    verticalAlign: 'top',
  },
  render: ({ backgroundColor, padding, borderWidth, borderColor, verticalAlign, id = 'grid-column' }) => (
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
      }}
    >
      <DropZone zone={`${id}-content`} minEmptyHeight={40} />
    </div>
  ),
};
