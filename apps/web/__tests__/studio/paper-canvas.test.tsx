import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PaperCanvas } from '@/components/studio/paper-canvas';
import { DEFAULT_PAGE_CONFIG } from '@/lib/types/page-config';

afterEach(() => {
  cleanup();
});

const defaultProps = {
  pageConfig: DEFAULT_PAGE_CONFIG,
  zoom: 100,
  onZoomChange: vi.fn(),
  children: <div data-testid="test-content">Test Content</div>,
};

describe('PaperCanvas', () => {
  it('renders workspace with gray background', () => {
    render(<PaperCanvas {...defaultProps} />);
    const workspace = screen.getByTestId('canvas-workspace');
    expect(workspace).toBeInTheDocument();
    expect(workspace).toHaveClass('bg-[#F1F1F1]');
  });

  it('renders paper sheet with correct dimensions for A4 portrait (794×1123 px)', () => {
    render(<PaperCanvas {...defaultProps} />);
    const paperSheet = screen.getByTestId('paper-sheet');
    expect(paperSheet).toBeInTheDocument();
    // A4 portrait: 210mm × 297mm = 794px × 1123px at 96 DPI
    expect(paperSheet).toHaveStyle({ width: '794px', height: '1123px' });
  });

  it('renders margin guides', () => {
    render(<PaperCanvas {...defaultProps} />);
    const marginGuides = screen.getByTestId('margin-guides');
    expect(marginGuides).toBeInTheDocument();
    expect(marginGuides).toHaveClass('border-dashed');
  });

  it('applies zoom transform', () => {
    render(<PaperCanvas {...defaultProps} zoom={75} />);
    const paperSheet = screen.getByTestId('paper-sheet');
    expect(paperSheet).toHaveStyle({ transform: 'scale(0.75)' });
  });

  it('shows zoom level display', () => {
    render(<PaperCanvas {...defaultProps} zoom={125} />);
    const zoomDisplay = screen.getByTestId('zoom-level-display');
    expect(zoomDisplay).toHaveTextContent('125%');
  });

  it('renders children inside paper sheet', () => {
    render(<PaperCanvas {...defaultProps} />);
    const paperSheet = screen.getByTestId('paper-sheet');
    const testContent = screen.getByTestId('test-content');
    expect(testContent).toBeInTheDocument();
    expect(paperSheet).toContainElement(testContent);
  });

  it('Ctrl+scroll up increases zoom', () => {
    const onZoomChange = vi.fn();
    render(<PaperCanvas {...defaultProps} zoom={100} onZoomChange={onZoomChange} />);
    const workspace = screen.getByTestId('canvas-workspace');
    
    fireEvent.wheel(workspace, {
      deltaY: -100,
      ctrlKey: true,
    });
    
    expect(onZoomChange).toHaveBeenCalledWith(125);
  });

  it('Ctrl+scroll down decreases zoom', () => {
    const onZoomChange = vi.fn();
    render(<PaperCanvas {...defaultProps} zoom={100} onZoomChange={onZoomChange} />);
    const workspace = screen.getByTestId('canvas-workspace');
    
    fireEvent.wheel(workspace, {
      deltaY: 100,
      ctrlKey: true,
    });
    
    expect(onZoomChange).toHaveBeenCalledWith(75);
  });

  it('zoom is clamped between 50 and 150', () => {
    const onZoomChange = vi.fn();
    
    // Test lower bound
    const { rerender } = render(
      <PaperCanvas {...defaultProps} zoom={50} onZoomChange={onZoomChange} />,
    );
    const workspace = screen.getByTestId('canvas-workspace');
    
    fireEvent.wheel(workspace, {
      deltaY: 100,
      ctrlKey: true,
    });
    
    // Should stay at 50 (minimum)
    expect(onZoomChange).toHaveBeenCalledWith(50);
    
    onZoomChange.mockClear();
    
    // Test upper bound
    rerender(
      <PaperCanvas {...defaultProps} zoom={150} onZoomChange={onZoomChange} />,
    );
    
    fireEvent.wheel(workspace, {
      deltaY: -100,
      ctrlKey: true,
    });
    
    // Should stay at 150 (maximum)
    expect(onZoomChange).toHaveBeenCalledWith(150);
  });

  it('100% button resets zoom', () => {
    const onZoomChange = vi.fn();
    render(<PaperCanvas {...defaultProps} zoom={75} onZoomChange={onZoomChange} />);
    const buttons = screen.getAllByText('100%');
    // The standalone "100%" button is the first one, before the ZOOM_LEVELS buttons
    const resetButton = buttons[0];
    fireEvent.click(resetButton);
    expect(onZoomChange).toHaveBeenCalledWith(100);
  });
});
