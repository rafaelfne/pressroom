import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { puckConfig } from '@/lib/puck/config';
import type { BenchmarkTableProps } from '@/components/report-components/benchmark-table';
import type { EditorialCardProps } from '@/components/report-components/editorial-card';
import type { EditorialGridProps } from '@/components/report-components/editorial-grid';
import type { EditorialStackProps } from '@/components/report-components/editorial-stack';
import type { RepeaterProps } from '@/components/report-components/repeater';
import type { ConditionalBlockProps } from '@/components/report-components/conditional-block';

const mockPuckContext = {
  isEditing: false,
  dragRef: null,
  renderDropZone: vi.fn(),
  metadata: {},
};

function getDefaults<T>(component: { defaultProps?: Partial<T> }): T {
  return component.defaultProps as T;
}

describe('Data-bound Components', () => {
  afterEach(() => {
    cleanup();
  });
  describe('BenchmarkTable', () => {
    const defaults = getDefaults<BenchmarkTableProps>(puckConfig.components.BenchmarkTable);

    it('renders with default props', () => {
      const Component = puckConfig.components.BenchmarkTable.render;
      const { container } = render(<Component {...defaults} id="test" puck={mockPuckContext} />);
      expect(container).toBeTruthy();
    });

    it('shows the title', () => {
      const Component = puckConfig.components.BenchmarkTable.render;
      render(<Component {...defaults} id="test" puck={mockPuckContext} title="Test Benchmark" />);
      expect(screen.getByText('Test Benchmark')).toBeInTheDocument();
    });

    it('shows period labels in table headers', () => {
      const Component = puckConfig.components.BenchmarkTable.render;
      render(
        <Component
          {...defaults}
          id="test"
          puck={mockPuckContext}
          period1Label="Month"
          period2Label="Year"
          period3Label="Inception"
        />,
      );
      expect(screen.getByText('Month')).toBeInTheDocument();
      expect(screen.getByText('Year')).toBeInTheDocument();
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    it('shows data path binding information', () => {
      const Component = puckConfig.components.BenchmarkTable.render;
      render(<Component {...defaults} id="test" puck={mockPuckContext} dataPath="{{test.data}}" />);
      expect(screen.getByText(/{{test.data}}/)).toBeInTheDocument();
    });

    it('renders actual data rows when dataPath is a resolved array', () => {
      const Component = puckConfig.components.BenchmarkTable.render;
      const benchmarks = [
        { name: 'CDI', monthly: 1.15, annual: 13.65, inception: 45.2 },
        { name: 'IBOV', monthly: -2.3, annual: 8.1, inception: 32.5 },
      ];
      render(
        <Component
          {...defaults}
          id="test"
          puck={mockPuckContext}
          dataPath={benchmarks as unknown as string}
          period1Key="monthly"
          period2Key="annual"
          period3Key="inception"
        />,
      );
      expect(screen.getByText('CDI')).toBeInTheDocument();
      expect(screen.getByText('IBOV')).toBeInTheDocument();
      expect(screen.getByText('+1.15%')).toBeInTheDocument();
      expect(screen.getByText('-2.30%')).toBeInTheDocument();
    });
  });

  describe('EditorialCard', () => {
    const defaults = getDefaults<EditorialCardProps>(puckConfig.components.EditorialCard);

    it('renders with default props', () => {
      const Component = puckConfig.components.EditorialCard.render;
      const { container } = render(<Component {...defaults} id="test" puck={mockPuckContext} />);
      expect(container).toBeTruthy();
    });

    it('shows title and description', () => {
      const Component = puckConfig.components.EditorialCard.render;
      render(<Component {...defaults} id="test" puck={mockPuckContext} title="Test Title" description="Test Description" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  describe('EditorialGrid', () => {
    const defaults = getDefaults<EditorialGridProps>(puckConfig.components.EditorialGrid);

    it('renders with default props', () => {
      const Component = puckConfig.components.EditorialGrid.render;
      const { container } = render(<Component {...defaults} id="test" puck={mockPuckContext} />);
      expect(container).toBeTruthy();
    });

    it('renders 4 cards', () => {
      const Component = puckConfig.components.EditorialGrid.render;
      render(
        <Component
          {...defaults}
          id="test"
          puck={mockPuckContext}
          card1Title="Grid Card 1"
          card2Title="Grid Card 2"
          card3Title="Grid Card 3"
          card4Title="Grid Card 4"
        />,
      );
      expect(screen.getByText('Grid Card 1')).toBeInTheDocument();
      expect(screen.getByText('Grid Card 2')).toBeInTheDocument();
      expect(screen.getByText('Grid Card 3')).toBeInTheDocument();
      expect(screen.getByText('Grid Card 4')).toBeInTheDocument();
    });

    it('renders descriptions for all cards', () => {
      const Component = puckConfig.components.EditorialGrid.render;
      render(
        <Component
          {...defaults}
          id="test"
          puck={mockPuckContext}
          card1Description="Grid Desc 1"
          card2Description="Grid Desc 2"
          card3Description="Grid Desc 3"
          card4Description="Grid Desc 4"
        />,
      );
      expect(screen.getByText('Grid Desc 1')).toBeInTheDocument();
      expect(screen.getByText('Grid Desc 2')).toBeInTheDocument();
      expect(screen.getByText('Grid Desc 3')).toBeInTheDocument();
      expect(screen.getByText('Grid Desc 4')).toBeInTheDocument();
    });
  });

  describe('EditorialStack', () => {
    const defaults = getDefaults<EditorialStackProps>(puckConfig.components.EditorialStack);

    it('renders with default props', () => {
      const Component = puckConfig.components.EditorialStack.render;
      const { container } = render(<Component {...defaults} id="test" puck={mockPuckContext} />);
      expect(container).toBeTruthy();
    });

    it('renders 3 cards', () => {
      const Component = puckConfig.components.EditorialStack.render;
      render(
        <Component
          {...defaults}
          id="test"
          puck={mockPuckContext}
          card1Title="Stack Card 1"
          card2Title="Stack Card 2"
          card3Title="Stack Card 3"
        />,
      );
      expect(screen.getByText('Stack Card 1')).toBeInTheDocument();
      expect(screen.getByText('Stack Card 2')).toBeInTheDocument();
      expect(screen.getByText('Stack Card 3')).toBeInTheDocument();
    });

    it('renders descriptions for all cards', () => {
      const Component = puckConfig.components.EditorialStack.render;
      render(
        <Component
          {...defaults}
          id="test"
          puck={mockPuckContext}
          card1Description="Stack Desc 1"
          card2Description="Stack Desc 2"
          card3Description="Stack Desc 3"
        />,
      );
      expect(screen.getByText('Stack Desc 1')).toBeInTheDocument();
      expect(screen.getByText('Stack Desc 2')).toBeInTheDocument();
      expect(screen.getByText('Stack Desc 3')).toBeInTheDocument();
    });
  });

  describe('Repeater', () => {
    const defaults = getDefaults<RepeaterProps>(puckConfig.components.Repeater);

    it('renders with default props', () => {
      const Component = puckConfig.components.Repeater.render;
      const { container } = render(<Component {...defaults} id="test" puck={mockPuckContext} />);
      expect(container).toBeTruthy();
    });

    it('shows data path', () => {
      const Component = puckConfig.components.Repeater.render;
      render(<Component {...defaults} id="test" puck={mockPuckContext} dataPath="{{test.items}}" />);
      expect(screen.getByText(/{{test.items}}/)).toBeInTheDocument();
    });

    it('shows empty message', () => {
      const Component = puckConfig.components.Repeater.render;
      render(<Component {...defaults} id="test" puck={mockPuckContext} emptyMessage="No items found" />);
      expect(screen.getByText(/No items found/)).toBeInTheDocument();
    });

    it('shows repeater label', () => {
      const Component = puckConfig.components.Repeater.render;
      render(<Component {...defaults} id="test" puck={mockPuckContext} />);
      expect(screen.getByText('Repeater')).toBeInTheDocument();
    });

    it('renders items as table when dataPath is an array of objects', () => {
      const Component = puckConfig.components.Repeater.render;
      const items = [
        { name: 'Item A', price: 10 },
        { name: 'Item B', price: 20 },
      ];
      render(<Component {...defaults} id="test" puck={mockPuckContext} dataPath={items as unknown as string} />);
      expect(screen.getByText('Item A')).toBeInTheDocument();
      expect(screen.getByText('Item B')).toBeInTheDocument();
    });

    it('renders empty message when dataPath is an empty array', () => {
      const Component = puckConfig.components.Repeater.render;
      render(<Component {...defaults} id="test" puck={mockPuckContext} dataPath={[] as unknown as string} emptyMessage="Nothing here" />);
      expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });
  });

  describe('ConditionalBlock', () => {
    const defaults = getDefaults<ConditionalBlockProps>(puckConfig.components.ConditionalBlock);

    it('renders with default props', () => {
      const Component = puckConfig.components.ConditionalBlock.render;
      const { container } = render(<Component {...defaults} id="test" puck={mockPuckContext} />);
      expect(container).toBeTruthy();
    });

    it('shows expression', () => {
      const Component = puckConfig.components.ConditionalBlock.render;
      render(<Component {...defaults} id="test" puck={mockPuckContext} expression="{{test.value}}" />);
      expect(screen.getByText(/{{test.value}}/)).toBeInTheDocument();
    });

    it('displays condition with equals operator', () => {
      const Component = puckConfig.components.ConditionalBlock.render;
      render(
        <Component {...defaults} id="test" puck={mockPuckContext} expression="{{value}}" operator="eq" compareValue="test" />,
      );
      expect(screen.getByText(/{{value}} = test/)).toBeInTheDocument();
    });

    it('displays condition with not equals operator', () => {
      const Component = puckConfig.components.ConditionalBlock.render;
      render(
        <Component {...defaults} id="test" puck={mockPuckContext} expression="{{value}}" operator="neq" compareValue="test" />,
      );
      expect(screen.getByText(/{{value}} ≠ test/)).toBeInTheDocument();
    });

    it('displays condition with notEmpty operator', () => {
      const Component = puckConfig.components.ConditionalBlock.render;
      render(<Component {...defaults} id="test" puck={mockPuckContext} expression="{{value}}" operator="notEmpty" />);
      expect(screen.getByText(/{{value}} is not empty/)).toBeInTheDocument();
    });

    it('shows conditional block label', () => {
      const Component = puckConfig.components.ConditionalBlock.render;
      render(<Component {...defaults} id="test" puck={mockPuckContext} />);
      expect(screen.getByText('Conditional Block')).toBeInTheDocument();
    });

    it('renders nothing when condition is not met (resolved mode)', () => {
      const Component = puckConfig.components.ConditionalBlock.render;
      const { container } = render(
        <Component {...defaults} id="test" puck={mockPuckContext} expression="" operator="notEmpty" />,
      );
      // Empty expression with notEmpty operator → condition false → renders empty fragment
      expect(container.textContent).toBe('');
    });

    it('renders drop zone when condition is met (resolved mode)', () => {
      const Component = puckConfig.components.ConditionalBlock.render;
      const { container } = render(
        <Component {...defaults} id="test" puck={mockPuckContext} expression="hello" operator="notEmpty" />,
      );
      // Condition met → renderDropZone is called
      expect(mockPuckContext.renderDropZone).toHaveBeenCalled();
      expect(container.querySelector('div')).toBeTruthy();
    });

    it('renders fallback text when condition met and no renderDropZone', () => {
      const Component = puckConfig.components.ConditionalBlock.render;
      const noPuckContext = { ...mockPuckContext, renderDropZone: null };
      render(
        <Component {...defaults} id="test" puck={noPuckContext} expression="hello" operator="notEmpty" />,
      );
      expect(screen.getByText(/Condition met/)).toBeInTheDocument();
    });
  });
});
