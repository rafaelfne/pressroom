import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { puckConfig } from '@/lib/puck/config';

// Mock PuckContext
const mockPuckContext = {
  isEditing: false,
  dragRef: null,
  renderDropZone: vi.fn(),
  metadata: {},
};

describe('MetricCard component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with default props', () => {
    const Component = puckConfig.components.MetricCard.render;
    const defaultProps = puckConfig.components.MetricCard.defaultProps!;
    render(<Component {...defaultProps} id="test-metric-card" puck={mockPuckContext} />);
    
    expect(screen.getByText('Metric Label')).toBeInTheDocument();
    expect(screen.getByText('{{value}}')).toBeInTheDocument();
  });

  it('renders custom label and value', () => {
    const Component = puckConfig.components.MetricCard.render;
    render(
      <Component
        label="Total Revenue"
        value="$1,234,567"
        subMetric1Label=""
        subMetric1Value=""
        subMetric2Label=""
        subMetric2Value=""
        subMetric3Label=""
        subMetric3Value=""
        variant="default"
        pageBreakBehavior="auto"
        id="test-metric-card"
        puck={mockPuckContext}
      />,
    );
    
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$1,234,567')).toBeInTheDocument();
  });

  it('renders with sub-metrics', () => {
    const Component = puckConfig.components.MetricCard.render;
    render(
      <Component
        label="Total Revenue"
        value="$1,234,567"
        subMetric1Label="Monthly"
        subMetric1Value="$100,000"
        subMetric2Label="YoY Growth"
        subMetric2Value="+15%"
        subMetric3Label=""
        subMetric3Value=""
        variant="default"
        pageBreakBehavior="auto"
        id="test-metric-card"
        puck={mockPuckContext}
      />,
    );
    
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$1,234,567')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('$100,000')).toBeInTheDocument();
    expect(screen.getByText('YoY Growth')).toBeInTheDocument();
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('filters out empty sub-metrics', () => {
    const Component = puckConfig.components.MetricCard.render;
    render(
      <Component
        label="Total Revenue"
        value="$1,234,567"
        subMetric1Label="Monthly"
        subMetric1Value="$100,000"
        subMetric2Label=""
        subMetric2Value=""
        subMetric3Label=""
        subMetric3Value=""
        variant="default"
        pageBreakBehavior="auto"
        id="test-metric-card"
        puck={mockPuckContext}
      />,
    );
    
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('$100,000')).toBeInTheDocument();
    // Should only show 1 sub-metric, not empty ones
    const subMetricLabels = screen.queryAllByText(/Monthly|YoY Growth/);
    expect(subMetricLabels).toHaveLength(1);
  });

  it('applies highlight variant styling', () => {
    const Component = puckConfig.components.MetricCard.render;
    const { container } = render(
      <Component
        label="Total Revenue"
        value="$1,234,567"
        subMetric1Label=""
        subMetric1Value=""
        subMetric2Label=""
        subMetric2Value=""
        subMetric3Label=""
        subMetric3Value=""
        variant="highlight"
        pageBreakBehavior="auto"
        id="test-metric-card"
        puck={mockPuckContext}
      />,
    );
    
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveStyle({ backgroundColor: '#f9fafb' });
  });

  it('applies default variant styling', () => {
    const Component = puckConfig.components.MetricCard.render;
    const { container } = render(
      <Component
        label="Total Revenue"
        value="$1,234,567"
        subMetric1Label=""
        subMetric1Value=""
        subMetric2Label=""
        subMetric2Value=""
        subMetric3Label=""
        subMetric3Value=""
        variant="default"
        pageBreakBehavior="auto"
        id="test-metric-card"
        puck={mockPuckContext}
      />,
    );
    
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveStyle({ backgroundColor: '#ffffff' });
  });

  it('does not show sub-metrics container when all sub-metrics are empty', () => {
    const Component = puckConfig.components.MetricCard.render;
    const { container } = render(
      <Component
        label="Total Revenue"
        value="$1,234,567"
        subMetric1Label=""
        subMetric1Value=""
        subMetric2Label=""
        subMetric2Value=""
        subMetric3Label=""
        subMetric3Value=""
        variant="default"
        pageBreakBehavior="auto"
        id="test-metric-card"
        puck={mockPuckContext}
      />,
    );
    
    // Should not have border-top style (which is only in sub-metrics container)
    const divs = container.querySelectorAll('div');
    const hasSubMetricsContainer = Array.from(divs).some(
      (div) => div.style.borderTop === '1px solid #e5e7eb' && div.style.paddingTop === '1rem',
    );
    expect(hasSubMetricsContainer).toBe(false);
  });

  it('renders with all three sub-metrics', () => {
    const Component = puckConfig.components.MetricCard.render;
    render(
      <Component
        label="Total Revenue"
        value="$1,234,567"
        subMetric1Label="Monthly"
        subMetric1Value="$100,000"
        subMetric2Label="YoY Growth"
        subMetric2Value="+15%"
        subMetric3Label="Quarterly"
        subMetric3Value="$300,000"
        variant="default"
        pageBreakBehavior="auto"
        id="test-metric-card"
        puck={mockPuckContext}
      />,
    );
    
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('$100,000')).toBeInTheDocument();
    expect(screen.getByText('YoY Growth')).toBeInTheDocument();
    expect(screen.getByText('+15%')).toBeInTheDocument();
    expect(screen.getByText('Quarterly')).toBeInTheDocument();
    expect(screen.getByText('$300,000')).toBeInTheDocument();
  });
});
