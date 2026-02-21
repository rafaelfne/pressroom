import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import { puckConfig } from '@/lib/puck/config';

const mockPuckContext = {
  isEditing: false,
  dragRef: null,
  renderDropZone: ({ zone }: { zone: string }) =>
    React.createElement('div', { 'data-testid': `dropzone-${zone}` }),
  metadata: {},
};

describe('FlexBox component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with default props - check display: flex, flexDirection: column', () => {
    const Component = puckConfig.components.FlexBox.render;
    const defaultProps = puckConfig.components.FlexBox.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} id="test-flexbox" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
    });
  });

  it('renders DropZone with unique zone name', () => {
    const Component = puckConfig.components.FlexBox.render;
    const defaultProps = puckConfig.components.FlexBox.defaultProps!;
    render(
      <Component {...defaultProps} id="test-flexbox" puck={mockPuckContext} />,
    );
    expect(screen.getByTestId('dropzone-test-flexbox-content')).toBeInTheDocument();
  });

  it('applies custom direction (row)', () => {
    const Component = puckConfig.components.FlexBox.render;
    const { container } = render(
      <Component
        direction="row"
        wrap="nowrap"
        justifyContent="flex-start"
        alignItems="stretch"
        gap="0"
        padding="0"
        paddingTop=""
        paddingRight=""
        paddingBottom=""
        paddingLeft=""
        backgroundColor="transparent"
        borderWidth="0"
        borderColor="#e5e7eb"
        borderRadius="0"
        minHeight="0"
        color=""
        fontSize=""
        fontFamily=""
        pageBreakBehavior="auto"
        visibilityCondition=""
        id="test-flexbox"
        puck={mockPuckContext}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ flexDirection: 'row' });
  });

  it('applies wrap prop', () => {
    const Component = puckConfig.components.FlexBox.render;
    const { container } = render(
      <Component
        direction="column"
        wrap="wrap"
        justifyContent="flex-start"
        alignItems="stretch"
        gap="0"
        padding="0"
        paddingTop=""
        paddingRight=""
        paddingBottom=""
        paddingLeft=""
        backgroundColor="transparent"
        borderWidth="0"
        borderColor="#e5e7eb"
        borderRadius="0"
        minHeight="0"
        color=""
        fontSize=""
        fontFamily=""
        pageBreakBehavior="auto"
        visibilityCondition=""
        id="test-flexbox"
        puck={mockPuckContext}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ flexWrap: 'wrap' });
  });

  it('applies justifyContent and alignItems', () => {
    const Component = puckConfig.components.FlexBox.render;
    const { container } = render(
      <Component
        direction="column"
        wrap="nowrap"
        justifyContent="center"
        alignItems="center"
        gap="0"
        padding="0"
        backgroundColor="transparent"
        borderWidth="0"
        borderColor="#e5e7eb"
        borderRadius="0"
        minHeight="0"
        color=""
        fontSize=""
        fontFamily=""
        pageBreakBehavior="auto"
        paddingTop=""
        paddingRight=""
        paddingBottom=""
        paddingLeft=""
        visibilityCondition=""
        id="test-flexbox"
        puck={mockPuckContext}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({
      justifyContent: 'center',
      alignItems: 'center',
    });
  });

  it('applies gap, padding, and minHeight as px values', () => {
    const Component = puckConfig.components.FlexBox.render;
    const { container } = render(
      <Component
        direction="column"
        wrap="nowrap"
        justifyContent="flex-start"
        alignItems="stretch"
        gap="16"
        padding="24"
        backgroundColor="transparent"
        borderWidth="0"
        borderColor="#e5e7eb"
        borderRadius="0"
        minHeight="100"
        color=""
        fontSize=""
        fontFamily=""
        pageBreakBehavior="auto"
        paddingTop=""
        paddingRight=""
        paddingBottom=""
        paddingLeft=""
        visibilityCondition=""
        id="test-flexbox"
        puck={mockPuckContext}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({
      gap: '16px',
      padding: '24px',
      minHeight: '100px',
    });
  });

  it('applies backgroundColor, borderWidth, borderColor, borderRadius', () => {
    const Component = puckConfig.components.FlexBox.render;
    const { container } = render(
      <Component
        direction="column"
        wrap="nowrap"
        justifyContent="flex-start"
        alignItems="stretch"
        gap="0"
        padding="0"
        backgroundColor="#f0f0f0"
        borderWidth="2"
        borderColor="#ff0000"
        borderRadius="8"
        minHeight="0"
        color=""
        fontSize=""
        fontFamily=""
        pageBreakBehavior="auto"
        paddingTop=""
        paddingRight=""
        paddingBottom=""
        paddingLeft=""
        visibilityCondition=""
        id="test-flexbox"
        puck={mockPuckContext}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({
      backgroundColor: '#f0f0f0',
      borderWidth: '2px',
      borderColor: '#ff0000',
      borderRadius: '8px',
    });
  });

  it('does not set border style when borderWidth is 0', () => {
    const Component = puckConfig.components.FlexBox.render;
    const { container } = render(
      <Component
        direction="column"
        wrap="nowrap"
        justifyContent="flex-start"
        alignItems="stretch"
        gap="0"
        padding="0"
        backgroundColor="transparent"
        borderWidth="0"
        borderColor="#e5e7eb"
        borderRadius="0"
        minHeight="0"
        color=""
        fontSize=""
        fontFamily=""
        pageBreakBehavior="auto"
        paddingTop=""
        paddingRight=""
        paddingBottom=""
        paddingLeft=""
        visibilityCondition=""
        id="test-flexbox"
        puck={mockPuckContext}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ borderStyle: 'none' });
  });
});
