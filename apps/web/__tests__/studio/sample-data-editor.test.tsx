import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { SampleDataEditor } from '@/components/studio/sample-data-editor';

describe('SampleDataEditor', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders textarea with initial value', () => {
    const onChange = vi.fn();
    render(<SampleDataEditor value='{"key": "value"}' onChange={onChange} />);

    const textarea = screen.getByTestId('sample-data-textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('{"key": "value"}');
  });

  it('shows valid JSON indicator for valid JSON', () => {
    const onChange = vi.fn();
    render(<SampleDataEditor value='{"key": "value"}' onChange={onChange} />);

    expect(screen.getByTestId('validation-success')).toBeInTheDocument();
    expect(screen.getByText('✓ Valid JSON')).toBeInTheDocument();
  });

  it('shows error for invalid JSON', () => {
    const onChange = vi.fn();
    render(<SampleDataEditor value='{"key": invalid}' onChange={onChange} />);

    expect(screen.getByTestId('validation-error')).toBeInTheDocument();
  });

  it('shows error for empty string', () => {
    const onChange = vi.fn();
    render(<SampleDataEditor value="   " onChange={onChange} />);

    expect(screen.getByTestId('validation-error')).toBeInTheDocument();
    expect(screen.getByText('JSON cannot be empty')).toBeInTheDocument();
  });

  it('calls onChange when text changes', () => {
    const onChange = vi.fn();
    render(<SampleDataEditor value='{"key": "value"}' onChange={onChange} />);

    const textarea = screen.getByTestId('sample-data-textarea');
    fireEvent.change(textarea, { target: { value: '{"updated": true}' } });

    expect(onChange).toHaveBeenCalledWith('{"updated": true}');
  });

  it('calls onValidChange when JSON becomes valid', () => {
    const onChange = vi.fn();
    const onValidChange = vi.fn();
    render(
      <SampleDataEditor
        value='{"key": "value"}'
        onChange={onChange}
        onValidChange={onValidChange}
      />,
    );

    expect(onValidChange).toHaveBeenCalledWith({ key: 'value' });
  });

  it('does not call onValidChange when JSON is invalid', () => {
    const onChange = vi.fn();
    const onValidChange = vi.fn();
    render(
      <SampleDataEditor
        value="not json"
        onChange={onChange}
        onValidChange={onValidChange}
      />,
    );

    expect(onValidChange).not.toHaveBeenCalled();
  });
});
