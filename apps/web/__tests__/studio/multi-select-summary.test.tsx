import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MultiSelectSummary } from '@/components/studio/multi-select-summary';

describe('MultiSelectSummary', () => {
  it('displays the correct component count', () => {
    render(<MultiSelectSummary count={5} />);
    expect(screen.getByTestId('multi-select-count-header')).toHaveTextContent(
      '5 components selected',
    );
  });

  it('displays keyboard shortcut hints', () => {
    render(<MultiSelectSummary count={3} />);
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Cut')).toBeInTheDocument();
    expect(screen.getByText('Paste')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Select all')).toBeInTheDocument();
    expect(screen.getByText('Clear selection')).toBeInTheDocument();
  });

  it('renders with count of 1', () => {
    render(<MultiSelectSummary count={1} />);
    expect(screen.getByTestId('multi-select-count-header')).toHaveTextContent(
      '1 components selected',
    );
  });

  it('has the correct test ID', () => {
    render(<MultiSelectSummary count={2} />);
    expect(screen.getByTestId('multi-select-summary')).toBeInTheDocument();
  });
});
