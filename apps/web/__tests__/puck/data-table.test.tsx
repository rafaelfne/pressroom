import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { puckConfig } from '@/lib/puck/config';

const mockPuckContext = {
  isEditing: false,
  dragRef: null,
  renderDropZone: vi.fn(),
  metadata: {},
};

// Resolved sample data (simulates what resolveBindings() would produce)
const RESOLVED_DATA = [
  { _isGroupHeader: true, _groupLabel: 'Onshore (R$)', name: 'Onshore (R$)' },
  { name: 'Treasury Bond IPCA+', quantity: 10, price: 29.99, date: '2024-01-15' },
  { name: 'CDB Bank XYZ', quantity: 5, price: 49.99, date: '2024-02-20', _indent: 1 },
  { _isGroupHeader: true, _groupLabel: 'Offshore (USD)', name: 'Offshore (USD)' },
  { name: 'S&P 500 ETF', quantity: 8, price: 19.99, date: '2024-03-10' },
];

// Helper to render with resolved data
function renderWithData(overrides: Record<string, unknown> = {}) {
  const Component = puckConfig.components.DataTable.render;
  const defaultProps = puckConfig.components.DataTable.defaultProps!;
  return render(
    <Component
      {...defaultProps}
      dataExpression={RESOLVED_DATA as unknown as string}
      {...overrides}
      id="test-table"
      puck={mockPuckContext}
    />,
  );
}

describe('DataTable component', () => {
  afterEach(() => {
    cleanup();
  });

  // ── Binding / Data source ──────────────────────────────────────────

  describe('data binding', () => {
    it('shows placeholder when dataExpression is a string (unresolved binding)', () => {
      const Component = puckConfig.components.DataTable.render;
      const defaultProps = puckConfig.components.DataTable.defaultProps!;
      render(
        <Component {...defaultProps} id="test-table" puck={mockPuckContext} />,
      );
      expect(
        screen.getByText('Configure a data source to render the table'),
      ).toBeInTheDocument();
      expect(screen.getByText('{{data.items}}')).toBeInTheDocument();
    });

    it('renders table when dataExpression is a resolved array', () => {
      const { container } = renderWithData();
      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
    });

    it('shows empty array message when data is empty array', () => {
      const Component = puckConfig.components.DataTable.render;
      const defaultProps = puckConfig.components.DataTable.defaultProps!;
      render(
        <Component
          {...defaultProps}
          dataExpression={[] as unknown as string}
          id="test-table"
          puck={mockPuckContext}
        />,
      );
      expect(
        screen.getByText('No data available. The data source returned an empty array.'),
      ).toBeInTheDocument();
    });
  });

  // ── Column rendering ───────────────────────────────────────────────

  describe('columns', () => {
    it('renders column headers correctly', () => {
      renderWithData();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
    });

    it('shows placeholder when columns are empty', () => {
      renderWithData({ columns: [] });
      expect(
        screen.getByText('No columns configured. Add columns to display data.'),
      ).toBeInTheDocument();
    });

    it('renders data rows', () => {
      const { container } = renderWithData();
      const rows = container.querySelectorAll('tbody tr');
      // 5 rows = 2 group headers + 3 data rows
      expect(rows.length).toBe(5);
    });
  });

  // ── Formatting ─────────────────────────────────────────────────────

  describe('formatting', () => {
    it('formats currency values via pipe expression', () => {
      const { container } = renderWithData();
      const cells = Array.from(container.querySelectorAll('td:not([colspan])'));
      const currencyCells = cells.filter((c) => c.textContent?.includes('R$'));
      expect(currencyCells).toHaveLength(3);
      expect(currencyCells.map((c) => c.textContent?.replace(/\s/g, ' ').trim())).toEqual([
        'R$ 29,99',
        'R$ 49,99',
        'R$ 19,99',
      ]);
    });

    it('formats number values correctly', () => {
      renderWithData();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('formats date values via pipe expression (DD/MM/YYYY)', () => {
      renderWithData();
      expect(screen.getByText('15/01/2024')).toBeInTheDocument();
      expect(screen.getByText('20/02/2024')).toBeInTheDocument();
      expect(screen.getByText('10/03/2024')).toBeInTheDocument();
    });

    it('renders text values as-is', () => {
      renderWithData();
      expect(screen.getByText('Treasury Bond IPCA+')).toBeInTheDocument();
      expect(screen.getByText('S&P 500 ETF')).toBeInTheDocument();
    });

    it('renders plain field without pipes as raw value', () => {
      const columns = [
        { field: 'name', header: 'Name', width: 'auto', align: 'left' as const, bold: 'false', italic: 'false', fontColor: '', fontSize: '', headerFontSize: '', padding: '' },
        { field: 'price', header: 'Price', width: '120px', align: 'right' as const, bold: 'false', italic: 'false', fontColor: '', fontSize: '', headerFontSize: '', padding: '' },
      ];
      renderWithData({ columns });
      // price without pipe renders as plain number string
      expect(screen.getByText('29.99')).toBeInTheDocument();
      expect(screen.getByText('49.99')).toBeInTheDocument();
    });

    it('supports custom pipe expression in column field', () => {
      const columns = [
        { field: 'name | uppercase', header: 'Name', width: 'auto', align: 'left' as const, bold: 'false', italic: 'false', fontColor: '', fontSize: '', headerFontSize: '', padding: '' },
      ];
      renderWithData({ columns });
      expect(screen.getByText('TREASURY BOND IPCA+')).toBeInTheDocument();
      expect(screen.getByText('S&P 500 ETF')).toBeInTheDocument();
    });

    it('handles null/undefined values gracefully in pipe fields', () => {
      const data = [
        { name: 'Item A', value: null },
        { name: 'Item B' },
      ];
      const columns = [
        { field: 'name', header: 'Name', width: 'auto', align: 'left' as const, bold: 'false', italic: 'false', fontColor: '', fontSize: '', headerFontSize: '', padding: '' },
        { field: 'value | currency:\'BRL\'', header: 'Value', width: '120px', align: 'right' as const, bold: 'false', italic: 'false', fontColor: '', fontSize: '', headerFontSize: '', padding: '' },
      ];
      const { container } = renderWithData({ dataExpression: data as unknown as string, columns });
      const valueCells = container.querySelectorAll('tbody td:nth-child(2)');
      // Null/undefined values should render as empty string
      expect(valueCells[0].textContent).toBe('');
      expect(valueCells[1].textContent).toBe('');
    });
  });

  // ── Striping ───────────────────────────────────────────────────────

  describe('zebra striping', () => {
    it('applies zebra striping when enabled', () => {
      const { container } = renderWithData({ striped: 'true' });
      const rows = container.querySelectorAll('tbody tr');
      const dataRows = Array.from(rows).filter((row) => {
        const firstCell = row.querySelector('td');
        return firstCell && !firstCell.hasAttribute('colspan');
      });
      // Second data row (odd index 1) should have oddRowColor
      expect(dataRows[1]).toHaveStyle({ backgroundColor: '#f9fafb' });
    });

    it('does not apply zebra striping when disabled', () => {
      const { container } = renderWithData({ striped: 'false' });
      const rows = container.querySelectorAll('tbody tr');
      expect(rows[1]).not.toHaveStyle({ backgroundColor: '#f9fafb' });
    });
  });

  // ── Header styling ─────────────────────────────────────────────────

  describe('header styling', () => {
    it('applies custom header colors', () => {
      const { container } = renderWithData({
        headerBgColor: '#1e3a5f',
        headerTextColor: '#ffffff',
      });
      const th = container.querySelector('th');
      expect(th).toHaveStyle({ backgroundColor: '#1e3a5f', color: '#ffffff' });
    });

    it('applies custom header font size', () => {
      const { container } = renderWithData({ headerFontSize: '16px' });
      const th = container.querySelector('th');
      expect(th).toHaveStyle({ fontSize: '16px' });
    });

    it('applies custom header font weight', () => {
      const { container } = renderWithData({ headerFontWeight: '800' });
      const th = container.querySelector('th');
      expect(th).toHaveStyle({ fontWeight: '800' });
    });

    it('applies custom header font family', () => {
      const { container } = renderWithData({ headerFontFamily: 'Georgia, serif' });
      const th = container.querySelector('th');
      expect(th).toHaveStyle({ fontFamily: 'Georgia, serif' });
    });

    it('applies custom header padding', () => {
      const { container } = renderWithData({ headerPadding: '20px 30px' });
      const th = container.querySelector('th');
      expect(th).toHaveStyle({ padding: '20px 30px' });
    });

    it('applies custom header border color', () => {
      const { container } = renderWithData({
        headerBorderColor: '#ff0000',
        bordered: 'true',
      });
      const th = container.querySelector('th');
      expect(th).toHaveStyle({ borderBottom: '2px solid #ff0000' });
    });

    it('applies header text transform', () => {
      const { container } = renderWithData({ headerTextTransform: 'uppercase' });
      const th = container.querySelector('th');
      expect(th).toHaveStyle({ textTransform: 'uppercase' });
    });
  });

  // ── Density ────────────────────────────────────────────────────────

  describe('density modes', () => {
    it('applies dense mode styles', () => {
      const { container } = renderWithData({ density: 'dense' });
      const table = container.querySelector('table');
      expect(table).toHaveStyle({ fontSize: '11px' });
    });

    it('applies compact mode styles', () => {
      const { container } = renderWithData({ density: 'compact' });
      const table = container.querySelector('table');
      expect(table).toHaveStyle({ fontSize: '12px' });
    });

    it('applies normal mode styles', () => {
      const { container } = renderWithData({ density: 'normal' });
      const table = container.querySelector('table');
      expect(table).toHaveStyle({ fontSize: '14px' });
    });

    it('applies custom density with specified row height', () => {
      const { container } = renderWithData({ density: 'custom', customRowHeight: '40' });
      const dataRows = Array.from(container.querySelectorAll('tbody tr')).filter((row) => {
        const firstCell = row.querySelector('td');
        return firstCell && !firstCell.hasAttribute('colspan');
      });
      const firstCell = dataRows[0].querySelector('td') as HTMLElement;
      // Custom row height 40px: vPad = max(1, round((40 - 14*1.5)/2)) = max(1, round((40 - 21)/2)) = max(1, 10) = 10
      expect(firstCell).toHaveStyle({ padding: '10px 12px' });
    });

    it('applies custom density with small row height', () => {
      const { container } = renderWithData({ density: 'custom', customRowHeight: '20' });
      const dataRows = Array.from(container.querySelectorAll('tbody tr')).filter((row) => {
        const firstCell = row.querySelector('td');
        return firstCell && !firstCell.hasAttribute('colspan');
      });
      const firstCell = dataRows[0].querySelector('td') as HTMLElement;
      // Custom row height 20px: vPad = max(1, round((20 - 21)/2)) = max(1, round(-0.5)) = max(1, 0) = 1
      expect(firstCell).toHaveStyle({ padding: '1px 12px' });
    });

    it('falls back to default 32px when customRowHeight is empty', () => {
      const { container } = renderWithData({ density: 'custom', customRowHeight: '' });
      const dataRows = Array.from(container.querySelectorAll('tbody tr')).filter((row) => {
        const firstCell = row.querySelector('td');
        return firstCell && !firstCell.hasAttribute('colspan');
      });
      const firstCell = dataRows[0].querySelector('td') as HTMLElement;
      // Default 32px: vPad = max(1, round((32 - 21)/2)) = max(1, round(5.5)) = max(1, 6) = 6
      expect(firstCell).toHaveStyle({ padding: '6px 12px' });
    });
  });

  // ── Group headers ──────────────────────────────────────────────────

  describe('group headers', () => {
    it('renders group header rows spanning all columns', () => {
      const { container } = renderWithData();
      const groupHeaderCells = container.querySelectorAll('td[colspan]');
      expect(groupHeaderCells.length).toBe(2);
      expect(groupHeaderCells[0]).toHaveAttribute('colspan', '4');
      expect(groupHeaderCells[0].textContent).toBe('Onshore (R$)');
      expect(groupHeaderCells[1].textContent).toBe('Offshore (USD)');
    });

    it('applies group header row colors', () => {
      const { container } = renderWithData({
        groupHeaderBgColor: '#1a5632',
        groupHeaderTextColor: '#ffffff',
      });
      const groupHeaderCells = container.querySelectorAll('td[colspan]');
      expect(groupHeaderCells[0]).toHaveStyle({
        backgroundColor: '#1a5632',
        color: '#ffffff',
      });
    });

    it('hides group headers when showGroupHeaders is false', () => {
      const { container } = renderWithData({ showGroupHeaders: 'false' });
      const groupHeaderCells = container.querySelectorAll('td[colspan]');
      expect(groupHeaderCells.length).toBe(0);
      // Data rows are still there
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(3); // only data rows
    });

    it('shows group headers by default', () => {
      const { container } = renderWithData();
      const groupHeaderCells = container.querySelectorAll('td[colspan]');
      expect(groupHeaderCells.length).toBe(2);
    });

    it('applies custom group header font size', () => {
      const { container } = renderWithData({ groupHeaderFontSize: '18px' });
      const groupHeaderCells = container.querySelectorAll('td[colspan]');
      expect(groupHeaderCells[0]).toHaveStyle({ fontSize: '18px' });
    });

    it('applies custom group header font weight', () => {
      const { container } = renderWithData({ groupHeaderFontWeight: '400' });
      const groupHeaderCells = container.querySelectorAll('td[colspan]');
      expect(groupHeaderCells[0]).toHaveStyle({ fontWeight: '400' });
    });

    it('applies custom group header font family', () => {
      const { container } = renderWithData({ groupHeaderFontFamily: 'Courier New' });
      const groupHeaderCells = container.querySelectorAll('td[colspan]');
      expect(groupHeaderCells[0]).toHaveStyle({ fontFamily: 'Courier New' });
    });

    it('applies custom group header padding', () => {
      const { container } = renderWithData({ groupHeaderPadding: '12px 24px' });
      const groupHeaderCells = container.querySelectorAll('td[colspan]');
      expect(groupHeaderCells[0]).toHaveStyle({ padding: '12px 24px' });
    });

    it('applies custom group header border color', () => {
      const { container } = renderWithData({ groupHeaderBorderColor: '#00ff00' });
      const groupHeaderCells = container.querySelectorAll('td[colspan]');
      expect(groupHeaderCells[0]).toHaveStyle({ borderBottom: '1px solid #00ff00' });
    });

    it('applies group header text transform', () => {
      const { container } = renderWithData({ groupHeaderTextTransform: 'uppercase' });
      const groupHeaderCells = container.querySelectorAll('td[colspan]');
      expect(groupHeaderCells[0]).toHaveStyle({ textTransform: 'uppercase' });
    });

    it('applies group header text align', () => {
      const { container } = renderWithData({ groupHeaderTextAlign: 'center' });
      const groupHeaderCells = container.querySelectorAll('td[colspan]');
      expect(groupHeaderCells[0]).toHaveStyle({ textAlign: 'center' });
    });
  });

  // ── Footer ─────────────────────────────────────────────────────────

  describe('footer', () => {
    it('renders footer row when enabled', () => {
      const { container } = renderWithData({ showFooterRow: 'true' });
      const tfoot = container.querySelector('tfoot');
      expect(tfoot).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('does not render footer row when disabled', () => {
      const { container } = renderWithData({ showFooterRow: 'false' });
      const tfoot = container.querySelector('tfoot');
      expect(tfoot).not.toBeInTheDocument();
    });

    describe('freetext mode', () => {
      it('renders a single cell spanning all columns', () => {
        const { container } = renderWithData({
          showFooterRow: 'true',
          footerMode: 'freetext',
          footerLabel: 'Grand Total: $500',
        });
        const footerCells = container.querySelectorAll('tfoot td');
        expect(footerCells.length).toBe(1);
        expect(footerCells[0]).toHaveAttribute('colspan', '4');
        expect(footerCells[0].textContent).toBe('Grand Total: $500');
      });
    });

    describe('columns mode', () => {
      it('renders per-column footer cells', () => {
        const footerColumns = [
          { content: 'Total', align: 'left' as const, bold: 'true', italic: 'false', fontColor: '' },
          { content: '23', align: 'center' as const, bold: 'false', italic: 'false', fontColor: '' },
          { content: '$99.97', align: 'right' as const, bold: 'true', italic: 'false', fontColor: '' },
          { content: '', align: 'left' as const, bold: 'false', italic: 'false', fontColor: '' },
        ];
        const { container } = renderWithData({
          showFooterRow: 'true',
          footerMode: 'columns',
          footerColumns,
        });
        const footerCells = container.querySelectorAll('tfoot td');
        expect(footerCells.length).toBe(4);
        expect(footerCells[0].textContent).toBe('Total');
        expect(footerCells[1].textContent).toBe('23');
        expect(footerCells[2].textContent).toBe('$99.97');
        expect(footerCells[3].textContent).toBe('');
      });

      it('applies per-cell styling in footer columns', () => {
        const footerColumns = [
          { content: 'Sum', align: 'left' as const, bold: 'true', italic: 'true', fontColor: '#ff0000' },
          { content: '', align: 'center' as const, bold: 'false', italic: 'false', fontColor: '' },
          { content: '', align: 'right' as const, bold: 'false', italic: 'false', fontColor: '' },
          { content: '', align: 'left' as const, bold: 'false', italic: 'false', fontColor: '' },
        ];
        const { container } = renderWithData({
          showFooterRow: 'true',
          footerMode: 'columns',
          footerColumns,
        });
        const firstFooterCell = container.querySelector('tfoot td');
        expect(firstFooterCell).toHaveStyle({
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: '#ff0000',
        });
      });

      it('falls back to footerLabel for first column when footerColumns is empty', () => {
        renderWithData({
          showFooterRow: 'true',
          footerMode: 'columns',
          footerColumns: [],
          footerLabel: 'Subtotal',
        });
        expect(screen.getByText('Subtotal')).toBeInTheDocument();
      });
    });

    describe('footer styling', () => {
      it('applies custom footer background and text color', () => {
        const { container } = renderWithData({
          showFooterRow: 'true',
          footerBgColor: '#000000',
          footerTextColor: '#ffffff',
        });
        const footerRow = container.querySelector('tfoot tr');
        expect(footerRow).toHaveStyle({
          backgroundColor: '#000000',
          color: '#ffffff',
        });
      });

      it('applies custom footer font size', () => {
        const { container } = renderWithData({
          showFooterRow: 'true',
          footerFontSize: '16px',
        });
        const footerRow = container.querySelector('tfoot tr');
        expect(footerRow).toHaveStyle({ fontSize: '16px' });
      });

      it('applies custom footer font weight', () => {
        const { container } = renderWithData({
          showFooterRow: 'true',
          footerFontWeight: '400',
        });
        const footerRow = container.querySelector('tfoot tr');
        expect(footerRow).toHaveStyle({ fontWeight: '400' });
      });

      it('applies custom footer border color', () => {
        const { container } = renderWithData({
          showFooterRow: 'true',
          footerBorderColor: '#ff0000',
        });
        const footerRow = container.querySelector('tfoot tr');
        expect(footerRow).toHaveStyle({ borderTop: '2px solid #ff0000' });
      });

      it('applies footer text transform', () => {
        const { container } = renderWithData({
          showFooterRow: 'true',
          footerTextTransform: 'uppercase',
        });
        const footerRow = container.querySelector('tfoot tr');
        expect(footerRow).toHaveStyle({ textTransform: 'uppercase' });
      });
    });
  });

  // ── Vertical borders ───────────────────────────────────────────────

  describe('vertical borders', () => {
    it('applies vertical borders when enabled', () => {
      const { container } = renderWithData({
        verticalBorders: 'true',
        bordered: 'false',
      });
      const rows = Array.from(container.querySelectorAll('tbody tr'));
      const dataRows = rows.filter((row) => {
        const firstCell = row.querySelector('td');
        return firstCell && !firstCell.hasAttribute('colspan');
      });
      const firstDataCell = dataRows[0].querySelector('td');
      expect(firstDataCell).toHaveStyle({ borderRight: '1px solid #e5e7eb' });
    });
  });

  // ── Column-level styling ───────────────────────────────────────────

  describe('column-level styling', () => {
    it('applies column-level bold styling', () => {
      const defaultProps = puckConfig.components.DataTable.defaultProps!;
      const columnsWithBold = [
        { ...defaultProps.columns[0], bold: 'true' },
        ...defaultProps.columns.slice(1),
      ];
      const { container } = renderWithData({ columns: columnsWithBold });
      const dataRows = Array.from(container.querySelectorAll('tbody tr')).filter((row) => {
        const firstCell = row.querySelector('td');
        return firstCell && !firstCell.hasAttribute('colspan');
      });
      const firstDataCell = dataRows[0].querySelector('td');
      expect(firstDataCell).toHaveStyle({ fontWeight: 'bold' });
    });

    it('applies column-level fontSize styling', () => {
      const defaultProps = puckConfig.components.DataTable.defaultProps!;
      const columnsWithFontSize = [
        { ...defaultProps.columns[0], fontSize: '18px' },
        ...defaultProps.columns.slice(1),
      ];
      const { container } = renderWithData({ columns: columnsWithFontSize });
      const dataRows = Array.from(container.querySelectorAll('tbody tr')).filter((row) => {
        const firstCell = row.querySelector('td');
        return firstCell && !firstCell.hasAttribute('colspan');
      });
      const firstDataCell = dataRows[0].querySelector('td');
      expect(firstDataCell).toHaveStyle({ fontSize: '18px' });
    });

    it('does not apply fontSize when empty', () => {
      const { container } = renderWithData();
      const dataRows = Array.from(container.querySelectorAll('tbody tr')).filter((row) => {
        const firstCell = row.querySelector('td');
        return firstCell && !firstCell.hasAttribute('colspan');
      });
      const firstDataCell = dataRows[0].querySelector('td');
      // fontSize should not be set on the cell (inherits from table)
      expect(firstDataCell?.style.fontSize).toBe('');
    });

    it('applies per-column headerFontSize', () => {
      const defaultProps = puckConfig.components.DataTable.defaultProps!;
      const columnsWithHeaderSize = [
        { ...defaultProps.columns[0], headerFontSize: '20px' },
        ...defaultProps.columns.slice(1),
      ];
      const { container } = renderWithData({ columns: columnsWithHeaderSize });
      const headerCells = container.querySelectorAll('thead th');
      expect(headerCells[0]).toHaveStyle({ fontSize: '20px' });
      // Other headers should not have per-column override
      expect((headerCells[1] as HTMLElement)?.style.fontSize).not.toBe('20px');
    });

    it('does not override header fontSize when headerFontSize is empty', () => {
      const { container } = renderWithData();
      const headerCells = container.querySelectorAll('thead th');
      // Should not have per-column font size set (uses global headerFontSize or default)
      expect((headerCells[0] as HTMLElement)?.style.fontSize).toBe('');
    });

    it('applies per-column padding', () => {
      const defaultProps = puckConfig.components.DataTable.defaultProps!;
      const columnsWithPadding = [
        { ...defaultProps.columns[0], padding: '2px 4px' },
        ...defaultProps.columns.slice(1),
      ];
      const { container } = renderWithData({ columns: columnsWithPadding });
      const dataRows = Array.from(container.querySelectorAll('tbody tr')).filter((row) => {
        const firstCell = row.querySelector('td');
        return firstCell && !firstCell.hasAttribute('colspan');
      });
      const firstDataCell = dataRows[0].querySelector('td');
      expect(firstDataCell).toHaveStyle({ padding: '2px 4px' });
    });

    it('does not override padding when column padding is empty', () => {
      const { container } = renderWithData({ density: 'normal' });
      const dataRows = Array.from(container.querySelectorAll('tbody tr')).filter((row) => {
        const firstCell = row.querySelector('td');
        return firstCell && !firstCell.hasAttribute('colspan');
      });
      const firstDataCell = dataRows[0].querySelector('td');
      // Should use density-based padding (normal = 8px 12px)
      expect(firstDataCell).toHaveStyle({ padding: '8px 12px' });
    });
  });

  // ── Indentation ────────────────────────────────────────────────────

  describe('indentation', () => {
    it('applies indentation on sub-items', () => {
      const { container } = renderWithData({ density: 'normal' });
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

  // ── Container ──────────────────────────────────────────────────────

  describe('container', () => {
    it('has max-width 100% container', () => {
      const { container } = renderWithData();
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ maxWidth: '100%' });
    });
  });
});
