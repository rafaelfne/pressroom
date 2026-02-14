import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { puckConfig } from '@/lib/puck/config';

const mockPuckContext = {
  isEditing: false,
  dragRef: null,
  renderDropZone: vi.fn(),
  metadata: {},
};

describe('DataTable component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with default props showing sample data', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} id="test-table" puck={mockPuckContext} />,
    );
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
  });

  it('renders column headers correctly', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    render(
      <Component {...defaultProps} id="test-table" puck={mockPuckContext} />,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
  });

  it('renders sample data rows', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} id="test-table" puck={mockPuckContext} />,
    );
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);
  });

  it('formats currency values correctly', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    render(
      <Component {...defaultProps} id="test-table" puck={mockPuckContext} />,
    );
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });

  it('formats number values correctly', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    render(
      <Component {...defaultProps} id="test-table" puck={mockPuckContext} />,
    );
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('formats date values correctly', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    render(
      <Component {...defaultProps} id="test-table" puck={mockPuckContext} />,
    );
    expect(screen.getByText('1/15/2024')).toBeInTheDocument();
    expect(screen.getByText('2/20/2024')).toBeInTheDocument();
  });

  it('renders text values as-is', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    render(
      <Component {...defaultProps} id="test-table" puck={mockPuckContext} />,
    );
    expect(screen.getByText('Sample Item 1')).toBeInTheDocument();
    expect(screen.getByText('Sample Item 2')).toBeInTheDocument();
  });

  it('applies zebra striping when enabled', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} striped="true" id="test-table" puck={mockPuckContext} />,
    );
    const rows = container.querySelectorAll('tbody tr');
    // Second row (index 1) gets the stripe color
    expect(rows[1]).toHaveStyle({ backgroundColor: '#f9fafb' });
  });

  it('does not apply zebra striping when disabled', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} striped="false" id="test-table" puck={mockPuckContext} />,
    );
    const rows = container.querySelectorAll('tbody tr');
    // No row should have the stripe color
    expect(rows[1]).not.toHaveStyle({ backgroundColor: '#f9fafb' });
  });

  it('applies custom header colors', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        headerBgColor="#1e3a5f"
        headerTextColor="#ffffff"
        id="test-table"
        puck={mockPuckContext}
      />,
    );
    const th = container.querySelector('th');
    expect(th).toHaveStyle({ backgroundColor: '#1e3a5f', color: '#ffffff' });
  });

  it('shows placeholder when columns are empty', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    render(
      <Component
        {...defaultProps}
        columns={[]}
        id="test-table"
        puck={mockPuckContext}
      />,
    );
    expect(screen.getByText('No columns configured. Add columns to display data.')).toBeInTheDocument();
  });

  it('has max-width 100% container', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} id="test-table" puck={mockPuckContext} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ maxWidth: '100%' });
  });

  it('applies compact mode styles', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} compact="true" id="test-table" puck={mockPuckContext} />,
    );
    const table = container.querySelector('table');
    expect(table).toHaveStyle({ fontSize: '12px' });
  });

  it('applies normal mode styles when compact is disabled', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} compact="false" id="test-table" puck={mockPuckContext} />,
    );
    const table = container.querySelector('table');
    expect(table).toHaveStyle({ fontSize: '14px' });
  });
});
