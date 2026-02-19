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

describe('Container component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with default props', () => {
    const Component = puckConfig.components.Container.render;
    const defaultProps = puckConfig.components.Container.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} id="test-container" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ padding: '16px', minHeight: '40px' });
  });

  it('renders DropZone with unique zone name', () => {
    const Component = puckConfig.components.Container.render;
    const defaultProps = puckConfig.components.Container.defaultProps!;
    render(
      <Component {...defaultProps} id="test-container" puck={mockPuckContext} />,
    );
    expect(screen.getByTestId('dropzone-test-container-content')).toBeInTheDocument();
  });

  it('applies border when borderWidth is non-zero', () => {
    const Component = puckConfig.components.Container.render;
    const { container } = render(
      <Component
        padding="8"
        borderWidth="2"
        borderColor="#ff0000"
        borderRadius="4"
        backgroundColor="#ffffff"
        shadow="none"
        minHeight="100"
        pageBreakBehavior="auto"
        id="test-container"
        puck={mockPuckContext}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({
      padding: '8px',
      borderWidth: '2px',
      borderColor: '#ff0000',
      borderRadius: '4px',
      backgroundColor: '#ffffff',
      minHeight: '100px',
    });
  });

  it('applies box shadow based on shadow prop', () => {
    const Component = puckConfig.components.Container.render;
    const { container } = render(
      <Component
        padding="16"
        borderWidth="0"
        borderColor="#e5e7eb"
        borderRadius="0"
        backgroundColor="transparent"
        shadow="md"
        minHeight="40"
        pageBreakBehavior="auto"
        id="test-container"
        puck={mockPuckContext}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' });
  });
});

describe('GridRow component', () => {
  afterEach(() => {
    cleanup();
  });

  /** Helper: shorthand for all default props so each test only overrides what it needs. */
  const gridDefaults = () => puckConfig.components.GridRow.defaultProps!;

  it('renders 2 equal columns by default', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      columnGap: '16px',
    });
    expect(screen.getByTestId('dropzone-test-grid-column-0')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-test-grid-column-1')).toBeInTheDocument();
  });

  it('renders 3 equal columns', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} columns="3-equal" columnGap="8" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ gridTemplateColumns: '1fr 1fr 1fr' });
    expect(screen.getByTestId('dropzone-test-grid-column-0')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-test-grid-column-1')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-test-grid-column-2')).toBeInTheDocument();
  });

  it('renders 4 equal columns', () => {
    const Component = puckConfig.components.GridRow.render;
    render(
      <Component {...gridDefaults()} columns="4-equal" id="test-grid" puck={mockPuckContext} />,
    );
    expect(screen.getByTestId('dropzone-test-grid-column-0')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-test-grid-column-1')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-test-grid-column-2')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-test-grid-column-3')).toBeInTheDocument();
  });

  it('renders asymmetric columns (1/3 + 2/3)', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} columns="1-3_2-3" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ gridTemplateColumns: '1fr 2fr' });
  });

  it('renders asymmetric columns (2/3 + 1/3)', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} columns="2-3_1-3" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ gridTemplateColumns: '2fr 1fr' });
  });

  it('supports custom column template', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} columns="custom" customColumns="1fr 2fr 1fr" columnGap="12" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ gridTemplateColumns: '1fr 2fr 1fr', columnGap: '12px' });
    expect(screen.getByTestId('dropzone-test-grid-column-0')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-test-grid-column-1')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-test-grid-column-2')).toBeInTheDocument();
  });

  it('falls back to 1fr 1fr when custom is empty', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} columns="custom" customColumns="" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ gridTemplateColumns: '1fr 1fr' });
  });

  it('parses repeat() syntax for column count', () => {
    const Component = puckConfig.components.GridRow.render;
    render(
      <Component {...gridDefaults()} columns="custom" customColumns="repeat(3, 1fr)" id="test-grid" puck={mockPuckContext} />,
    );
    expect(screen.getByTestId('dropzone-test-grid-column-0')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-test-grid-column-1')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-test-grid-column-2')).toBeInTheDocument();
  });

  /* --- grid-template-rows --- */

  it('applies gridTemplateRows when set', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} gridTemplateRows="100px auto" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ gridTemplateRows: '100px auto' });
  });

  it('does not set gridTemplateRows when empty', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.gridTemplateRows).toBe('');
  });

  /* --- Gap (column & row) --- */

  it('applies separate columnGap and rowGap', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} columnGap="24" rowGap="12" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ columnGap: '24px', rowGap: '12px' });
  });

  /* --- Alignment: items --- */

  it('applies justifyItems and alignItems', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} justifyItems="center" alignItems="end" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ justifyItems: 'center', alignItems: 'end' });
  });

  /* --- Alignment: content --- */

  it('applies justifyContent and alignContent', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} justifyContent="space-between" alignContent="center" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ justifyContent: 'space-between', alignContent: 'center' });
  });

  /* --- Auto flow --- */

  it('applies gridAutoFlow', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} gridAutoFlow="column" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ gridAutoFlow: 'column' });
  });

  it('applies gridAutoRows and gridAutoColumns when set', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} gridAutoRows="minmax(100px, auto)" gridAutoColumns="200px" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ gridAutoRows: 'minmax(100px, auto)', gridAutoColumns: '200px' });
  });

  /* --- Sizing --- */

  it('applies height, minHeight, and maxHeight when set', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} height="400" minHeight="200" maxHeight="600" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ height: '400px', minHeight: '200px', maxHeight: '600px' });
  });

  it('does not set sizing props when empty', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.height).toBe('');
    expect(wrapper.style.minHeight).toBe('');
    expect(wrapper.style.maxHeight).toBe('');
  });

  /* --- Padding --- */

  it('applies padding when set', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} padding="24" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ padding: '24px' });
  });

  it('does not set padding when empty', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component {...gridDefaults()} id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.padding).toBe('');
  });
});

describe('GridColumn component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with default props', () => {
    const Component = puckConfig.components.GridColumn.render;
    const defaultProps = puckConfig.components.GridColumn.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} id="test-col" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
    });
  });

  it('renders DropZone with unique zone name', () => {
    const Component = puckConfig.components.GridColumn.render;
    const defaultProps = puckConfig.components.GridColumn.defaultProps!;
    render(
      <Component {...defaultProps} id="test-col" puck={mockPuckContext} />,
    );
    expect(screen.getByTestId('dropzone-test-col-content')).toBeInTheDocument();
  });

  it('applies vertical center alignment', () => {
    const Component = puckConfig.components.GridColumn.render;
    const { container } = render(
      <Component
        backgroundColor="transparent"
        padding="0"
        borderWidth="0"
        borderColor="#e5e7eb"
        verticalAlign="center"
        pageBreakBehavior="auto"
        id="test-col"
        puck={mockPuckContext}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ justifyContent: 'center' });
  });

  it('applies vertical bottom alignment', () => {
    const Component = puckConfig.components.GridColumn.render;
    const { container } = render(
      <Component
        backgroundColor="transparent"
        padding="0"
        borderWidth="0"
        borderColor="#e5e7eb"
        verticalAlign="bottom"
        pageBreakBehavior="auto"
        id="test-col"
        puck={mockPuckContext}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ justifyContent: 'flex-end' });
  });

  it('applies background and padding', () => {
    const Component = puckConfig.components.GridColumn.render;
    const { container } = render(
      <Component
        backgroundColor="#f0f0f0"
        padding="12"
        borderWidth="1"
        borderColor="#ccc"
        verticalAlign="top"
        pageBreakBehavior="auto"
        id="test-col"
        puck={mockPuckContext}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({
      backgroundColor: '#f0f0f0',
      padding: '12px',
      borderWidth: '1px',
      borderColor: '#ccc',
    });
  });
});

describe('Section component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders title with default props', () => {
    const Component = puckConfig.components.Section.render;
    const defaultProps = puckConfig.components.Section.defaultProps!;
    render(
      <Component {...defaultProps} id="test-section" puck={mockPuckContext} />,
    );
    expect(screen.getByText('Section Title')).toBeInTheDocument();
  });

  it('renders DropZone with unique zone name', () => {
    const Component = puckConfig.components.Section.render;
    const defaultProps = puckConfig.components.Section.defaultProps!;
    render(
      <Component {...defaultProps} id="test-section" puck={mockPuckContext} />,
    );
    expect(screen.getByTestId('dropzone-test-section-content')).toBeInTheDocument();
  });

  it('renders divider when showDivider is true', () => {
    const Component = puckConfig.components.Section.render;
    const { container } = render(
      <Component
        title="My Section"
        showDivider="true"
        backgroundColor="transparent"
        padding="16"
        pageBreakBehavior="auto"
        id="test-section"
        puck={mockPuckContext}
      />,
    );
    const hr = container.querySelector('hr');
    expect(hr).toBeInTheDocument();
  });

  it('does not render divider when showDivider is false', () => {
    const Component = puckConfig.components.Section.render;
    const { container } = render(
      <Component
        title="My Section"
        showDivider="false"
        backgroundColor="transparent"
        padding="16"
        pageBreakBehavior="auto"
        id="test-section"
        puck={mockPuckContext}
      />,
    );
    const hr = container.querySelector('hr');
    expect(hr).not.toBeInTheDocument();
  });

  it('has accessible region role and label', () => {
    const Component = puckConfig.components.Section.render;
    render(
      <Component
        title="Revenue Summary"
        showDivider="true"
        backgroundColor="transparent"
        padding="16"
        pageBreakBehavior="auto"
        id="test-section"
        puck={mockPuckContext}
      />,
    );
    const region = screen.getByRole('region', { name: 'Revenue Summary' });
    expect(region).toBeInTheDocument();
  });

  it('applies custom background and padding', () => {
    const Component = puckConfig.components.Section.render;
    const { container } = render(
      <Component
        title="Styled Section"
        showDivider="false"
        backgroundColor="#f5f5f5"
        padding="24"
        pageBreakBehavior="auto"
        id="test-section"
        puck={mockPuckContext}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({
      backgroundColor: '#f5f5f5',
      padding: '24px',
    });
  });
});
