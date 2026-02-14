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

describe('TextBlock component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders default text', () => {
    const Component = puckConfig.components.TextBlock.render;
    const defaultProps = puckConfig.components.TextBlock.defaultProps!;
    render(<Component {...defaultProps} id="test-text" puck={mockPuckContext} />);
    expect(screen.getByText('Enter your text here')).toBeInTheDocument();
  });

  it('renders custom text with style', () => {
    const Component = puckConfig.components.TextBlock.render;
    const { container } = render(
      <Component text="Hello World" fontSize="1.5rem" color="#ff0000" id="test-text" puck={mockPuckContext} />,
    );
    const element = screen.getByText('Hello World');
    expect(element).toBeInTheDocument();
    // Check the parent div has the style attribute
    const styledDiv = container.querySelector('div[style]');
    expect(styledDiv).toBeInTheDocument();
  });
});

describe('Spacer component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with default height', () => {
    const Component = puckConfig.components.Spacer.render;
    const defaultProps = puckConfig.components.Spacer.defaultProps!;
    const { container } = render(<Component {...defaultProps} id="test-spacer" puck={mockPuckContext} />);
    const spacer = container.firstChild as HTMLElement;
    expect(spacer).toHaveStyle({ height: '32px' });
  });

  it('renders with custom height', () => {
    const Component = puckConfig.components.Spacer.render;
    const { container } = render(<Component height="64px" id="test-spacer" puck={mockPuckContext} />);
    const spacer = container.firstChild as HTMLElement;
    expect(spacer).toHaveStyle({ height: '64px' });
  });

  it('has aria-hidden attribute', () => {
    const Component = puckConfig.components.Spacer.render;
    const { container } = render(<Component height="32px" id="test-spacer" puck={mockPuckContext} />);
    const spacer = container.firstChild as HTMLElement;
    expect(spacer).toHaveAttribute('aria-hidden', 'true');
  });
});
