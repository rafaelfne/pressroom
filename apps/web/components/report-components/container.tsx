import type { ComponentConfig } from '@puckeditor/core';
import { DropZone } from '@puckeditor/core';

export type ContainerProps = {
  padding: string;
  borderWidth: string;
  borderColor: string;
  borderRadius: string;
  backgroundColor: string;
  shadow: 'none' | 'sm' | 'md' | 'lg';
  minHeight: string;
};

const shadowMap: Record<ContainerProps['shadow'], string> = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.15)',
};

export const Container: ComponentConfig<ContainerProps> = {
  label: 'Container',
  fields: {
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
    borderRadius: {
      type: 'text',
      label: 'Border Radius (px)',
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color',
    },
    shadow: {
      type: 'select',
      label: 'Shadow',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
    minHeight: {
      type: 'text',
      label: 'Min Height (px)',
    },
  },
  defaultProps: {
    padding: '16',
    borderWidth: '0',
    borderColor: '#e5e7eb',
    borderRadius: '0',
    backgroundColor: 'transparent',
    shadow: 'none',
    minHeight: '40',
  },
  render: ({ padding, borderWidth, borderColor, borderRadius, backgroundColor, shadow, minHeight }) => (
    <div
      style={{
        padding: `${padding}px`,
        borderWidth: `${borderWidth}px`,
        borderStyle: borderWidth !== '0' ? 'solid' : 'none',
        borderColor,
        borderRadius: `${borderRadius}px`,
        backgroundColor,
        boxShadow: shadowMap[shadow],
        minHeight: `${minHeight}px`,
      }}
    >
      <DropZone zone="container-content" minEmptyHeight={40} />
    </div>
  ),
};
