import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { BenchmarkTable } from '@/components/report-components/benchmark-table';
import { EditorialCard } from '@/components/report-components/editorial-card';
import { EditorialGrid } from '@/components/report-components/editorial-grid';
import { EditorialStack } from '@/components/report-components/editorial-stack';
import { Repeater } from '@/components/report-components/repeater';
import { ConditionalBlock } from '@/components/report-components/conditional-block';

describe('Data-bound Components', () => {
  afterEach(() => {
    cleanup();
  });
  describe('BenchmarkTable', () => {
    it('renders with default props', () => {
      const Component = BenchmarkTable.render;
      const { container } = render(<Component {...BenchmarkTable.defaultProps} />);
      expect(container).toBeTruthy();
    });

    it('shows the title', () => {
      const Component = BenchmarkTable.render;
      render(<Component {...BenchmarkTable.defaultProps} title="Test Benchmark" />);
      expect(screen.getByText('Test Benchmark')).toBeInTheDocument();
    });

    it('shows period labels in table headers', () => {
      const Component = BenchmarkTable.render;
      render(
        <Component
          {...BenchmarkTable.defaultProps}
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
      const Component = BenchmarkTable.render;
      render(<Component {...BenchmarkTable.defaultProps} dataPath="{{test.data}}" />);
      expect(screen.getByText(/{{test.data}}/)).toBeInTheDocument();
    });
  });

  describe('EditorialCard', () => {
    it('renders with default props', () => {
      const Component = EditorialCard.render;
      const { container } = render(<Component {...EditorialCard.defaultProps} />);
      expect(container).toBeTruthy();
    });

    it('shows title and description', () => {
      const Component = EditorialCard.render;
      render(<Component {...EditorialCard.defaultProps} title="Test Title" description="Test Description" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  describe('EditorialGrid', () => {
    it('renders with default props', () => {
      const Component = EditorialGrid.render;
      const { container } = render(<Component {...EditorialGrid.defaultProps} />);
      expect(container).toBeTruthy();
    });

    it('renders 4 cards', () => {
      const Component = EditorialGrid.render;
      render(
        <Component
          {...EditorialGrid.defaultProps}
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
      const Component = EditorialGrid.render;
      render(
        <Component
          {...EditorialGrid.defaultProps}
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
    it('renders with default props', () => {
      const Component = EditorialStack.render;
      const { container } = render(<Component {...EditorialStack.defaultProps} />);
      expect(container).toBeTruthy();
    });

    it('renders 3 cards', () => {
      const Component = EditorialStack.render;
      render(
        <Component
          {...EditorialStack.defaultProps}
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
      const Component = EditorialStack.render;
      render(
        <Component
          {...EditorialStack.defaultProps}
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
    it('renders with default props', () => {
      const Component = Repeater.render;
      const { container } = render(<Component {...Repeater.defaultProps} />);
      expect(container).toBeTruthy();
    });

    it('shows data path', () => {
      const Component = Repeater.render;
      render(<Component {...Repeater.defaultProps} dataPath="{{test.items}}" />);
      expect(screen.getByText(/{{test.items}}/)).toBeInTheDocument();
    });

    it('shows empty message', () => {
      const Component = Repeater.render;
      render(<Component {...Repeater.defaultProps} emptyMessage="No items found" />);
      expect(screen.getByText(/No items found/)).toBeInTheDocument();
    });

    it('shows repeater component label', () => {
      const Component = Repeater.render;
      render(<Component {...Repeater.defaultProps} />);
      expect(screen.getByText('Repeater Component')).toBeInTheDocument();
    });
  });

  describe('ConditionalBlock', () => {
    it('renders with default props', () => {
      const Component = ConditionalBlock.render;
      const { container } = render(<Component {...ConditionalBlock.defaultProps} />);
      expect(container).toBeTruthy();
    });

    it('shows expression', () => {
      const Component = ConditionalBlock.render;
      render(<Component {...ConditionalBlock.defaultProps} expression="{{test.value}}" />);
      expect(screen.getByText(/{{test.value}}/)).toBeInTheDocument();
    });

    it('displays condition with equals operator', () => {
      const Component = ConditionalBlock.render;
      render(
        <Component {...ConditionalBlock.defaultProps} expression="{{value}}" operator="eq" compareValue="test" />,
      );
      expect(screen.getByText(/{{value}} = test/)).toBeInTheDocument();
    });

    it('displays condition with not equals operator', () => {
      const Component = ConditionalBlock.render;
      render(
        <Component {...ConditionalBlock.defaultProps} expression="{{value}}" operator="neq" compareValue="test" />,
      );
      expect(screen.getByText(/{{value}} ≠ test/)).toBeInTheDocument();
    });

    it('displays condition with notEmpty operator', () => {
      const Component = ConditionalBlock.render;
      render(<Component {...ConditionalBlock.defaultProps} expression="{{value}}" operator="notEmpty" />);
      expect(screen.getByText(/{{value}} is not empty/)).toBeInTheDocument();
    });

    it('shows conditional block label', () => {
      const Component = ConditionalBlock.render;
      render(<Component {...ConditionalBlock.defaultProps} />);
      expect(screen.getByText('Conditional Block')).toBeInTheDocument();
    });
  });
});
