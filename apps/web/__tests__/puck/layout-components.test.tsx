import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// Mock DropZone before importing components
vi.mock('@puckeditor/core', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@puckeditor/core');
  return {
    ...actual,
    DropZone: ({ zone }: { zone: string }) => (
      <div data-testid={`dropzone-${zone}`} />
    ),
  };
});

import { puckConfig } from '@/lib/puck/config';

const mockPuckContext = {
  isEditing: false,
  dragRef: null,
  renderDropZone: vi.fn(),
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

  it('renders 2 equal columns by default', () => {
    const Component = puckConfig.components.GridRow.render;
    const defaultProps = puckConfig.components.GridRow.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
    });
    expect(screen.getByTestId('dropzone-test-grid-column-0')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-test-grid-column-1')).toBeInTheDocument();
  });

  it('renders 3 equal columns', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component columns="3-equal" customColumns="" gap="8" id="test-grid" puck={mockPuckContext} />,
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
      <Component columns="4-equal" customColumns="" gap="16" id="test-grid" puck={mockPuckContext} />,
    );
    expect(screen.getByTestId('dropzone-test-grid-column-0')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-test-grid-column-1')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-test-grid-column-2')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-test-grid-column-3')).toBeInTheDocument();
  });

  it('renders asymmetric columns (1/3 + 2/3)', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component columns="1-3_2-3" customColumns="" gap="16" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ gridTemplateColumns: '1fr 2fr' });
  });

  it('renders asymmetric columns (2/3 + 1/3)', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component columns="2-3_1-3" customColumns="" gap="16" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ gridTemplateColumns: '2fr 1fr' });
  });

  it('supports custom column template', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component columns="custom" customColumns="1fr 2fr 1fr" gap="12" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ gridTemplateColumns: '1fr 2fr 1fr', gap: '12px' });
    expect(screen.getByTestId('dropzone-test-grid-column-0')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-test-grid-column-1')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-test-grid-column-2')).toBeInTheDocument();
  });

  it('falls back to 1fr 1fr when custom is empty', () => {
    const Component = puckConfig.components.GridRow.render;
    const { container } = render(
      <Component columns="custom" customColumns="" gap="16" id="test-grid" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ gridTemplateColumns: '1fr 1fr' });
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
