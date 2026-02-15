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
    expect(defaultProps.subtitle).toBe('');
    expect(defaultProps.height).toBe('300');
    expect(defaultProps.width).toBe('600');
    expect(defaultProps.showLegend).toBe('true');
    expect(defaultProps.showGrid).toBe('true');
    expect(defaultProps.showTooltip).toBe('false');
    expect(defaultProps.series).toBe('[]');
    expect(defaultProps.xAxisFormat).toBe('category');
    expect(defaultProps.yAxisFormat).toBe('number');
    expect(defaultProps.xAxisRotation).toBe('0');
    expect(defaultProps.centerLabel).toBe('');
    expect(defaultProps.backgroundColor).toBe('');
    expect(defaultProps.containerBorder).toBe('false');
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
    // The inner chart container div should have width 100%
    const wrapperDiv = container.firstChild as HTMLElement;
    const chartContainer = wrapperDiv.querySelector('div[style*="width"]') as HTMLElement;
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

  it('renders multi-series line chart with multiple lines', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const seriesJson = JSON.stringify([
      { name: 'Series 1', yField: 'series1', color: '#8884d8' },
      { name: 'Series 2', yField: 'series2', color: '#82ca9d' },
      { name: 'Series 3', yField: 'series3', color: '#ffc658' },
    ]);
    const { container } = render(
      <Component
        {...defaultProps}
        chartType="line"
        series={seriesJson}
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const lines = container.querySelectorAll('.recharts-line');
    expect(lines.length).toBe(3);
  });

  it('renders multi-series bar chart with multiple bars', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const seriesJson = JSON.stringify([
      { name: 'Series 1', yField: 'series1', color: '#8884d8' },
      { name: 'Series 2', yField: 'series2', color: '#82ca9d' },
    ]);
    const { container } = render(
      <Component
        {...defaultProps}
        chartType="bar"
        series={seriesJson}
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    // Should have multiple bar groups
    const bars = container.querySelectorAll('.recharts-bar-rectangles');
    expect(bars.length).toBeGreaterThan(1);
  });

  it('renders multi-series area chart with multiple areas', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const seriesJson = JSON.stringify([
      { name: 'Series 1', yField: 'series1', color: '#8884d8' },
      { name: 'Series 2', yField: 'series2', color: '#82ca9d' },
    ]);
    const { container } = render(
      <Component
        {...defaultProps}
        chartType="area"
        series={seriesJson}
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const areas = container.querySelectorAll('.recharts-area');
    expect(areas.length).toBe(2);
  });

  it('falls back to single yField when series is empty', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        chartType="line"
        series="[]"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const lines = container.querySelectorAll('.recharts-line');
    expect(lines.length).toBe(1);
  });

  it('handles invalid series JSON gracefully', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        chartType="line"
        series="{invalid json}"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    // Should fall back to single series
    const lines = container.querySelectorAll('.recharts-line');
    expect(lines.length).toBe(1);
  });

  it('renders stacked bar chart', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        chartType="stackedBar"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    const bars = container.querySelectorAll('.recharts-bar-rectangle');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('renders stacked bar chart with multiple series', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const seriesJson = JSON.stringify([
      { name: 'Segment 1', yField: 'segment1', color: '#8884d8' },
      { name: 'Segment 2', yField: 'segment2', color: '#82ca9d' },
      { name: 'Segment 3', yField: 'segment3', color: '#ffc658' },
    ]);
    const { container } = render(
      <Component
        {...defaultProps}
        chartType="stackedBar"
        series={seriesJson}
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const bars = container.querySelectorAll('.recharts-bar-rectangles');
    expect(bars.length).toBe(3);
  });

  it('renders donut center label', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        chartType="donut"
        centerLabel="Total: 100"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    expect(container.textContent).toContain('Total: 100');
  });

  it('does not render center label for non-donut charts', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        chartType="pie"
        centerLabel="Should not show"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    // Should not find a div containing the center label text
    const allDivs = Array.from(container.querySelectorAll('div'));
    const centerDiv = allDivs.find((div) => div.textContent === 'Should not show');
    expect(centerDiv).toBeUndefined();
  });

  it('renders subtitle when provided', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    render(
      <Component
        {...defaultProps}
        title="Main Title"
        subtitle="This is a subtitle"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    expect(screen.getByText('Main Title')).toBeInTheDocument();
    expect(screen.getByText('This is a subtitle')).toBeInTheDocument();
  });

  it('applies custom width', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        width="800"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '800');
  });

  it('applies background color to container', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        backgroundColor="#f0f0f0"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ backgroundColor: '#f0f0f0' });
  });

  it('applies container border when enabled', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        containerBorder="true"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.border).toContain('1px solid');
  });

  it('does not apply border when disabled', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        containerBorder="false"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    // When border is false, the style should not include a border or should be empty/none
    expect(wrapper.style.border).not.toContain('1px solid');
  });

  it('applies Y-axis percentage formatting', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        yAxisFormat="percentage"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    // Check if the Y-axis tick has percentage formatting
    const yAxisTicks = container.querySelectorAll('.recharts-yAxis .recharts-cartesian-axis-tick-value');
    expect(yAxisTicks.length).toBeGreaterThan(0);
    // At least one tick should contain '%'
    const hasPercentage = Array.from(yAxisTicks).some((tick) => tick.textContent?.includes('%'));
    expect(hasPercentage).toBe(true);
  });

  it('applies Y-axis currency formatting', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        yAxisFormat="currency"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    // Check if the Y-axis tick has currency formatting
    const yAxisTicks = container.querySelectorAll('.recharts-yAxis .recharts-cartesian-axis-tick-value');
    expect(yAxisTicks.length).toBeGreaterThan(0);
    // At least one tick should contain 'R$'
    const hasCurrency = Array.from(yAxisTicks).some((tick) => tick.textContent?.includes('R$'));
    expect(hasCurrency).toBe(true);
  });

  it('applies X-axis rotation 45 degrees', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        xAxisRotation="45"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const xAxisTicks = container.querySelectorAll('.recharts-xAxis .recharts-cartesian-axis-tick');
    expect(xAxisTicks.length).toBeGreaterThan(0);
    // Check if ticks have rotation transform
    const hasRotation = Array.from(xAxisTicks).some((tick) => {
      const text = tick.querySelector('text');
      return text && text.getAttribute('transform')?.includes('rotate');
    });
    expect(hasRotation).toBe(true);
  });

  it('applies X-axis rotation 90 degrees', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component
        {...defaultProps}
        xAxisRotation="90"
        id="test-chart"
        puck={mockPuckContext}
      />,
    );
    const xAxisTicks = container.querySelectorAll('.recharts-xAxis .recharts-cartesian-axis-tick');
    expect(xAxisTicks.length).toBeGreaterThan(0);
    // Check if ticks have rotation transform
    const hasRotation = Array.from(xAxisTicks).some((tick) => {
      const text = tick.querySelector('text');
      return text && text.getAttribute('transform')?.includes('rotate');
    });
    expect(hasRotation).toBe(true);
  });
});
