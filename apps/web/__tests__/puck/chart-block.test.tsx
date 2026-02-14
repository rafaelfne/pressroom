import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { puckConfig } from '@/lib/puck/config';

const mockPuckContext = {
  isEditing: false,
  dragRef: null,
  renderDropZone: vi.fn(),
  metadata: {},
};

describe('ChartBlock component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with default props', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} id="test-chart" puck={mockPuckContext} />,
    );
    // Should render an SVG chart
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders a bar chart by default', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} id="test-chart" puck={mockPuckContext} />,
    );
    // Bar charts contain <rect> elements for bars
    const rects = container.querySelectorAll('.recharts-bar-rectangle');
    expect(rects.length).toBeGreaterThan(0);
  });

  it('renders a line chart', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        chartType="line"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    const line = container.querySelector('.recharts-line');
    expect(line).toBeInTheDocument();
  });

  it('renders an area chart', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        chartType="area"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    const area = container.querySelector('.recharts-area');
    expect(area).toBeInTheDocument();
  });

  it('renders a pie chart', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        chartType="pie"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    const pie = container.querySelector('.recharts-pie');
    expect(pie).toBeInTheDocument();
  });

  it('renders a donut chart (pie with inner radius)', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        chartType="donut"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    const pie = container.querySelector('.recharts-pie');
    expect(pie).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    render(
      <Component
        {...defaultProps}
        title="Sales Report"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    expect(screen.getByText('Sales Report')).toBeInTheDocument();
  });

  it('does not render title when empty', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        title=""
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const heading = container.querySelector('h3');
    expect(heading).not.toBeInTheDocument();
  });

  it('applies custom height', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        height="500"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('height', '500');
  });

  it('uses explicit width and height on SVG (not ResponsiveContainer)', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} id="test-chart" puck={mockPuckContext} />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '600');
    expect(svg).toHaveAttribute('height', '300');
    // Ensure no ResponsiveContainer
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).not.toBeInTheDocument();
  });

  it('has correct default props', () => {
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    expect(defaultProps.chartType).toBe('bar');
    expect(defaultProps.dataExpression).toBe('{{data.chartData}}');
    expect(defaultProps.xField).toBe('name');
    expect(defaultProps.yField).toBe('value');
    expect(defaultProps.title).toBe('');
    expect(defaultProps.height).toBe('300');
    expect(defaultProps.showLegend).toBe('true');
    expect(defaultProps.showGrid).toBe('true');
    expect(defaultProps.showTooltip).toBe('false');
  });

  it('renders legend when showLegend is true', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        showLegend="true"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const legend = container.querySelector('.recharts-legend-wrapper');
    expect(legend).toBeInTheDocument();
  });

  it('hides legend when showLegend is false', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        showLegend="false"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const legend = container.querySelector('.recharts-legend-wrapper');
    expect(legend).not.toBeInTheDocument();
  });

  it('renders grid when showGrid is true', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        showGrid="true"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const grid = container.querySelector('.recharts-cartesian-grid');
    expect(grid).toBeInTheDocument();
  });

  it('hides grid when showGrid is false', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        showGrid="false"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const grid = container.querySelector('.recharts-cartesian-grid');
    expect(grid).not.toBeInTheDocument();
  });

  it('has container with width 100%', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} id="test-chart" puck={mockPuckContext} />,
    );
    // The chart container div should have width 100%
    const chartContainer = container.querySelector('div > div[style]') as HTMLElement;
    expect(chartContainer).toHaveStyle({ width: '100%' });
  });

  it('falls back to 300px height when height is invalid', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        height="invalid"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('height', '300');
  });
});
