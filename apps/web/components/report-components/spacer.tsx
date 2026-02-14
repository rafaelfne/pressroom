import type { ComponentConfig } from '@puckeditor/core';

export type SpacerProps = {
  height: string;
};

export const Spacer: ComponentConfig<SpacerProps> = {
  label: 'Spacer',
  fields: {
    height: {
      type: 'select',
      label: 'Height',
      options: [
        { label: 'Small (16px)', value: '16px', key: 'small' },
        { label: 'Medium (32px)', value: '32px', key: 'medium' },
        { label: 'Large (64px)', value: '64px', key: 'large' },
        { label: 'Extra Large (96px)', value: '96px', key: 'xlarge' },
      ],
    },
  },
  defaultProps: {
    height: '32px',
  },
  render: ({ height }) => (
    <div style={{ height }} aria-hidden="true" />
  ),
};
