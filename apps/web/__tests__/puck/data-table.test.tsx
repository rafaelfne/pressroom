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
    // 5 rows = 2 group headers + 3 data rows from SAMPLE_DATA
    expect(rows.length).toBe(5);
  });

  it('formats currency values correctly', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    render(
      <Component {...defaultProps} id="test-table" puck={mockPuckContext} />,
    );
    // Note: Sample data has been updated with group headers
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
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
    // Date formatting is timezone-dependent, so we check for either possible date
    // (2024-01-15 UTC may appear as 1/14 or 1/15 depending on local timezone)
    const dateCell1 = screen.getAllByRole('cell').find(cell =>
      cell.textContent?.match(/1\/1[45]\/2024/)
    );
    const dateCell2 = screen.getAllByRole('cell').find(cell =>
      cell.textContent?.match(/2\/(19|20)\/2024/)
    );
    expect(dateCell1).toBeInTheDocument();
    expect(dateCell2).toBeInTheDocument();
  });

  it('renders text values as-is', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    render(
      <Component {...defaultProps} id="test-table" puck={mockPuckContext} />,
    );
    expect(screen.getByText('Treasury Bond IPCA+')).toBeInTheDocument();
    expect(screen.getByText('S&P 500 ETF')).toBeInTheDocument();
  });

  it('applies zebra striping when enabled', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} striped="true" id="test-table" puck={mockPuckContext} />,
    );
    const rows = container.querySelectorAll('tbody tr');
    // Find only data rows (not group headers)
    const dataRows = Array.from(rows).filter((row) => {
      const firstCell = row.querySelector('td');
      return firstCell && !firstCell.hasAttribute('colspan');
    });
    // Second data row (odd index 1) should have oddRowColor
    expect(dataRows[1]).toHaveStyle({ backgroundColor: '#f9fafb' });
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

  it('applies density mode styles - dense', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} density="dense" id="test-table" puck={mockPuckContext} />,
    );
    const table = container.querySelector('table');
    expect(table).toHaveStyle({ fontSize: '11px' });
  });

  it('applies density mode styles - compact', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} density="compact" id="test-table" puck={mockPuckContext} />,
    );
    const table = container.querySelector('table');
    expect(table).toHaveStyle({ fontSize: '12px' });
  });

  it('applies density mode styles - normal', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} density="normal" id="test-table" puck={mockPuckContext} />,
    );
    const table = container.querySelector('table');
    expect(table).toHaveStyle({ fontSize: '14px' });
  });

  it('renders group header rows spanning all columns', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} id="test-table" puck={mockPuckContext} />,
    );
    // Find cells with colspan attribute
    const groupHeaderCells = container.querySelectorAll('td[colspan]');
    expect(groupHeaderCells.length).toBe(2);
    expect(groupHeaderCells[0]).toHaveAttribute('colspan', '4');
    expect(groupHeaderCells[0].textContent).toBe('Onshore (R$)');
    expect(groupHeaderCells[1].textContent).toBe('Offshore (USD)');
  });

  it('applies group header row colors', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        groupHeaderBgColor="#1a5632"
        groupHeaderTextColor="#ffffff"
        id="test-table"
        puck={mockPuckContext}
      />,
    );
    const groupHeaderCells = container.querySelectorAll('td[colspan]');
    expect(groupHeaderCells[0]).toHaveStyle({
      backgroundColor: '#1a5632',
      color: '#ffffff',
    });
  });

  it('renders footer row when enabled', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        showFooterRow="true"
        footerLabel="Total"
        id="test-table"
        puck={mockPuckContext}
      />,
    );
    const tfoot = container.querySelector('tfoot');
    expect(tfoot).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('does not render footer row when disabled', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} showFooterRow="false" id="test-table" puck={mockPuckContext} />,
    );
    const tfoot = container.querySelector('tfoot');
    expect(tfoot).not.toBeInTheDocument();
  });

  it('applies vertical borders when enabled', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        verticalBorders="true"
        bordered="false"
        id="test-table"
        puck={mockPuckContext}
      />,
    );
    // Find data rows (not group headers)
    const rows = Array.from(container.querySelectorAll('tbody tr'));
    const dataRows = rows.filter((row) => {
      const firstCell = row.querySelector('td');
      return firstCell && !firstCell.hasAttribute('colspan');
    });
    // Check that non-last cells in data rows have vertical borders
    const firstDataCell = dataRows[0].querySelector('td');
    expect(firstDataCell).toHaveStyle({ borderRight: '1px solid #e5e7eb' });
  });

  it('applies column-level bold styling', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const columnsWithBold = [
      { ...defaultProps.columns[0], bold: 'true' },
      ...defaultProps.columns.slice(1),
    ];
    const { container } = render(
      <Component
        {...defaultProps}
        columns={columnsWithBold}
        id="test-table"
        puck={mockPuckContext}
      />,
    );
    // Find first data row's first cell (skip group header)
    const dataRows = Array.from(container.querySelectorAll('tbody tr')).filter((row) => {
      const firstCell = row.querySelector('td');
      return firstCell && !firstCell.hasAttribute('colspan');
    });
    const firstDataCell = dataRows[0].querySelector('td');
    expect(firstDataCell).toHaveStyle({ fontWeight: 'bold' });
  });

  it('applies indentation on sub-items', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} density="normal" id="test-table" puck={mockPuckContext} />,
    );
    // Find the row with _indent: 1 (CDB Bank XYZ)
    const rows = Array.from(container.querySelectorAll('tbody tr'));
    const indentedRow = rows.find((row) => {
      const firstCell = row.querySelector('td');
      return firstCell && firstCell.textContent?.includes('CDB Bank XYZ');
    });
    expect(indentedRow).toBeTruthy();
    const firstCell = indentedRow?.querySelector('td');
    // With normal density (8px 12px) and _indent: 1, paddingLeft should be 12 + 12 = 24px
    expect(firstCell).toHaveStyle({ paddingLeft: '24px' });
  });
});
