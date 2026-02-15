import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { SampleDataPanel } from '@/components/studio/sample-data-panel';

describe('SampleDataPanel', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders toggle button when closed', () => {
    const onSampleDataChange = vi.fn();
    render(
      <SampleDataPanel
        sampleData={{ key: 'value' }}
        onSampleDataChange={onSampleDataChange}
      />,
    );

    const toggle = screen.getByTestId('sample-data-toggle');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveTextContent('Sample Data');
  });

  it('opens panel when toggle is clicked', () => {
    const onSampleDataChange = vi.fn();
    render(
      <SampleDataPanel
        sampleData={{ key: 'value' }}
        onSampleDataChange={onSampleDataChange}
      />,
    );

    const toggle = screen.getByTestId('sample-data-toggle');
    fireEvent.click(toggle);

    expect(screen.getByTestId('sample-data-panel')).toBeInTheDocument();
    expect(screen.getByText('Sample Data')).toBeInTheDocument();
  });

  it('closes panel when Close Data button is clicked', () => {
    const onSampleDataChange = vi.fn();
    render(
      <SampleDataPanel
        sampleData={{ key: 'value' }}
        onSampleDataChange={onSampleDataChange}
      />,
    );

    // Open panel
    fireEvent.click(screen.getByTestId('sample-data-toggle'));
    expect(screen.getByTestId('sample-data-panel')).toBeInTheDocument();

    // Close panel via the toggle button that now says "Close Data"
    fireEvent.click(screen.getByTestId('sample-data-toggle'));
    expect(screen.queryByTestId('sample-data-panel')).not.toBeInTheDocument();
  });

  it('shows JSON editor with formatted sample data', () => {
    const onSampleDataChange = vi.fn();
    render(
      <SampleDataPanel
        sampleData={{ name: 'Test' }}
        onSampleDataChange={onSampleDataChange}
      />,
    );

    fireEvent.click(screen.getByTestId('sample-data-toggle'));

    const textarea = screen.getByTestId('sample-data-textarea');
    expect(textarea).toHaveValue(JSON.stringify({ name: 'Test' }, null, 2));
  });

  it('displays description text when panel is open', () => {
    const onSampleDataChange = vi.fn();
    render(
      <SampleDataPanel
        sampleData={{}}
        onSampleDataChange={onSampleDataChange}
      />,
    );

    fireEvent.click(screen.getByTestId('sample-data-toggle'));

    expect(
      screen.getByText(/Edit JSON data to preview how bindings/),
    ).toBeInTheDocument();
  });
});
