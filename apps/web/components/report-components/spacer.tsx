import type { ComponentConfig } from '@puckeditor/core';

export type SpacerProps = {
  height: string;
};

export const Spacer: ComponentConfig<SpacerProps> = {
  label: 'Spacer',
  fields: {
    height: {
      type: 'text',
      label: 'Height (px)',
    },
  },
  defaultProps: {
    height: '32',
  },
  render: ({ height }) => (
    <div style={{ height: `${height}px` }} aria-hidden="true" />
  ),
};
