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
      <Component text="Hello World" fontSize="1.5rem" color="#ff0000" alignment="left" bold="false" italic="false" id="test-text" puck={mockPuckContext} />,
    );
    const element = screen.getByText('Hello World');
    expect(element).toBeInTheDocument();
    // Check the parent div has the style attribute
    const styledDiv = container.querySelector('div[style]');
    expect(styledDiv).toBeInTheDocument();
  });

  it('applies alignment, bold, and italic styles', () => {
    const Component = puckConfig.components.TextBlock.render;
    const { container } = render(
      <Component text="Styled Text" fontSize="1rem" color="#000000" alignment="center" bold="true" italic="true" id="test-text" puck={mockPuckContext} />,
    );
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ textAlign: 'center', fontWeight: 'bold', fontStyle: 'italic' });
  });
});

describe('HeadingBlock component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders default heading', () => {
    const Component = puckConfig.components.HeadingBlock.render;
    const defaultProps = puckConfig.components.HeadingBlock.defaultProps!;
    render(<Component {...defaultProps} id="test-heading" puck={mockPuckContext} />);
    expect(screen.getByText('Heading')).toBeInTheDocument();
  });

  it('renders custom level (h3)', () => {
    const Component = puckConfig.components.HeadingBlock.render;
    const { container } = render(
      <Component text="Custom Heading" level="h3" color="#000000" id="test-heading" puck={mockPuckContext} />,
    );
    const heading = container.querySelector('h3');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Custom Heading');
  });

  it('renders with custom color', () => {
    const Component = puckConfig.components.HeadingBlock.render;
    const { container } = render(
      <Component text="Colored Heading" level="h2" color="#ff0000" id="test-heading" puck={mockPuckContext} />,
    );
    const heading = container.querySelector('h2');
    expect(heading).toHaveStyle({ color: '#ff0000' });
  });
});

describe('ImageBlock component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders placeholder when no src', () => {
    const Component = puckConfig.components.ImageBlock.render;
    const defaultProps = puckConfig.components.ImageBlock.defaultProps!;
    render(<Component {...defaultProps} id="test-image" puck={mockPuckContext} />);
    expect(screen.getByText('No image source')).toBeInTheDocument();
  });

  it('renders image with src', () => {
    const Component = puckConfig.components.ImageBlock.render;
    render(
      <Component src="https://example.com/image.png" alt="Test Image" width="200px" height="100px" id="test-image" puck={mockPuckContext} />,
    );
    const img = screen.getByAltText('Test Image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.png');
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
    const { container } = render(<Component height="64" id="test-spacer" puck={mockPuckContext} />);
    const spacer = container.firstChild as HTMLElement;
    expect(spacer).toHaveStyle({ height: '64px' });
  });

  it('has aria-hidden attribute', () => {
    const Component = puckConfig.components.Spacer.render;
    const { container } = render(<Component height="32" id="test-spacer" puck={mockPuckContext} />);
    const spacer = container.firstChild as HTMLElement;
    expect(spacer).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Divider component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders hr element', () => {
    const Component = puckConfig.components.Divider.render;
    const defaultProps = puckConfig.components.Divider.defaultProps!;
    const { container } = render(<Component {...defaultProps} id="test-divider" puck={mockPuckContext} />);
    const hr = container.querySelector('hr');
    expect(hr).toBeInTheDocument();
  });

  it('renders with custom color, thickness, and style', () => {
    const Component = puckConfig.components.Divider.render;
    const { container } = render(
      <Component color="#ff0000" thickness="2" lineStyle="dashed" id="test-divider" puck={mockPuckContext} />,
    );
    const hr = container.querySelector('hr');
    expect(hr).toHaveStyle({ borderTop: '2px dashed #ff0000' });
  });
});

describe('PageBreak component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with page-break style', () => {
    const Component = puckConfig.components.PageBreak.render;
    const { container } = render(<Component id="test-pagebreak" puck={mockPuckContext} />);
    const pageBreak = container.firstChild as HTMLElement;
    expect(pageBreak).toHaveStyle({ pageBreakBefore: 'always' });
  });

  it('has aria-hidden attribute', () => {
    const Component = puckConfig.components.PageBreak.render;
    const { container } = render(<Component id="test-pagebreak" puck={mockPuckContext} />);
    const pageBreak = container.firstChild as HTMLElement;
    expect(pageBreak).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('ReportHeader component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders title', () => {
    const Component = puckConfig.components.ReportHeader.render;
    const defaultProps = puckConfig.components.ReportHeader.defaultProps!;
    render(<Component {...defaultProps} id="test-header" puck={mockPuckContext} />);
    expect(screen.getByText('Report Title')).toBeInTheDocument();
  });

  it('renders with logo', () => {
    const Component = puckConfig.components.ReportHeader.render;
    render(
      <Component logoSrc="https://example.com/logo.png" title="My Report" date="2024-01-01" id="test-header" puck={mockPuckContext} />,
    );
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('renders date', () => {
    const Component = puckConfig.components.ReportHeader.render;
    render(
      <Component logoSrc="" title="My Report" date="2024-01-01" id="test-header" puck={mockPuckContext} />,
    );
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
  });
});

describe('ReportFooter component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders text', () => {
    const Component = puckConfig.components.ReportFooter.render;
    const defaultProps = puckConfig.components.ReportFooter.defaultProps!;
    render(<Component {...defaultProps} id="test-footer" puck={mockPuckContext} />);
    expect(screen.getByText('© Company Name')).toBeInTheDocument();
  });

  it('shows page number when enabled', () => {
    const Component = puckConfig.components.ReportFooter.render;
    render(
      <Component text="Footer" showPageNumber="true" id="test-footer" puck={mockPuckContext} />,
    );
    expect(screen.getByText('Page')).toBeInTheDocument();
  });

  it('hides page number when disabled', () => {
    const Component = puckConfig.components.ReportFooter.render;
    render(
      <Component text="Footer" showPageNumber="false" id="test-footer" puck={mockPuckContext} />,
    );
    expect(screen.queryByText('Page')).not.toBeInTheDocument();
  });
});
