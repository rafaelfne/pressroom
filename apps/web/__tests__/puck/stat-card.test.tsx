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

describe('StatCard component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with default props', () => {
    const Component = puckConfig.components.StatCard.render;
    const defaultProps = puckConfig.components.StatCard.defaultProps!;
    render(<Component {...defaultProps} id="test-stat-card" puck={mockPuckContext} />);
    
    expect(screen.getByText('Stat Label')).toBeInTheDocument();
    expect(screen.getByText('{{value}}')).toBeInTheDocument();
  });

  it('renders custom label and value', () => {
    const Component = puckConfig.components.StatCard.render;
    render(
      <Component
        label="Best Month"
        value="June 2024"
        sublabel=""
        trend="neutral"
        pageBreakBehavior="auto"
        id="test-stat-card"
        puck={mockPuckContext}
      />,
    );
    
    expect(screen.getByText('Best Month')).toBeInTheDocument();
    expect(screen.getByText('June 2024')).toBeInTheDocument();
  });

  it('shows sublabel when provided', () => {
    const Component = puckConfig.components.StatCard.render;
    render(
      <Component
        label="Volatility"
        value="12.5%"
        sublabel="30-day average"
        trend="up"
        pageBreakBehavior="auto"
        id="test-stat-card"
        puck={mockPuckContext}
      />,
    );
    
    expect(screen.getByText('Volatility')).toBeInTheDocument();
    expect(screen.getByText('12.5%')).toBeInTheDocument();
    expect(screen.getByText('30-day average')).toBeInTheDocument();
  });

  it('hides sublabel when empty', () => {
    const Component = puckConfig.components.StatCard.render;
    render(
      <Component
        label="Best Month"
        value="June 2024"
        sublabel=""
        trend="neutral"
        pageBreakBehavior="auto"
        id="test-stat-card"
        puck={mockPuckContext}
      />,
    );
    
    expect(screen.getByText('Best Month')).toBeInTheDocument();
    expect(screen.getByText('June 2024')).toBeInTheDocument();
    // Sublabel should not be rendered
    expect(screen.queryByText('30-day average')).not.toBeInTheDocument();
  });

  it('applies correct trend color', () => {
    const Component = puckConfig.components.StatCard.render;
    
    // Test "up" trend (green)
    render(
      <Component
        label="Growth"
        value="+25%"
        sublabel=""
        trend="up"
        pageBreakBehavior="auto"
        id="test-stat-card-up"
        puck={mockPuckContext}
      />,
    );
    
    const valueUp = screen.getByText('+25%');
    expect(valueUp).toHaveStyle({ color: '#059669' });
    cleanup();
    
    // Test "down" trend (red)
    render(
      <Component
        label="Decline"
        value="-15%"
        sublabel=""
        trend="down"
        pageBreakBehavior="auto"
        id="test-stat-card-down"
        puck={mockPuckContext}
      />,
    );
    
    const valueDown = screen.getByText('-15%');
    expect(valueDown).toHaveStyle({ color: '#dc2626' });
    cleanup();
    
    // Test "neutral" trend (gray)
    render(
      <Component
        label="Stable"
        value="0%"
        sublabel=""
        trend="neutral"
        pageBreakBehavior="auto"
        id="test-stat-card-neutral"
        puck={mockPuckContext}
      />,
    );
    
    const valueNeutral = screen.getByText('0%');
    expect(valueNeutral).toHaveStyle({ color: '#374151' });
  });
});
