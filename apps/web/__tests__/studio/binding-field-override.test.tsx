import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { BindingFieldOverride } from '@/components/studio/binding-field-override';

describe('BindingFieldOverride', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders container with both autocomplete and explorer', () => {
    const onChange = vi.fn();
    render(<BindingFieldOverride value="" onChange={onChange} />);

    expect(screen.getByTestId('binding-field-override')).toBeInTheDocument();
    expect(screen.getByTestId('binding-autocomplete')).toBeInTheDocument();
    expect(screen.getByTestId('binding-path-explorer')).toBeInTheDocument();
  });

  it('passes value to autocomplete input', () => {
    const onChange = vi.fn();
    render(
      <BindingFieldOverride value="{{customer.name}}" onChange={onChange} />,
    );

    const input = screen.getByTestId('binding-input');
    expect(input).toHaveValue('{{customer.name}}');
  });

  it('calls onChange when typing in autocomplete', () => {
    const onChange = vi.fn();
    render(<BindingFieldOverride value="" onChange={onChange} />);

    const input = screen.getByTestId('binding-input');
    fireEvent.change(input, { target: { value: '{{customer' } });

    expect(onChange).toHaveBeenCalledWith('{{customer');
  });

  it('inserts binding expression when path selected from explorer', () => {
    const onChange = vi.fn();
    const sampleData = { customer: { name: 'John', email: 'john@test.com' } };

    render(
      <BindingFieldOverride
        value=""
        onChange={onChange}
        sampleData={sampleData}
      />,
    );

    // Open the explorer
    fireEvent.click(screen.getByTestId('explorer-trigger'));

    // Click a leaf node (customer is expandable, but its children should be visible since depth 0 auto-expands)
    const leafNodes = screen.getAllByTestId('tree-leaf');
    // Click the first leaf (should be customer.name)
    fireEvent.click(leafNodes[0]);

    expect(onChange).toHaveBeenCalledWith('{{customer.name}}');
  });

  it('appends binding expression to existing value', () => {
    const onChange = vi.fn();
    const sampleData = { name: 'John' };

    render(
      <BindingFieldOverride
        value="Hello "
        onChange={onChange}
        sampleData={sampleData}
      />,
    );

    // Open the explorer and select path
    fireEvent.click(screen.getByTestId('explorer-trigger'));
    fireEvent.click(screen.getByTestId('tree-leaf'));

    expect(onChange).toHaveBeenCalledWith('Hello {{name}}');
  });

  it('renders with custom placeholder', () => {
    const onChange = vi.fn();
    render(
      <BindingFieldOverride
        value=""
        onChange={onChange}
        placeholder="Custom placeholder"
      />,
    );

    const input = screen.getByTestId('binding-input');
    expect(input).toHaveAttribute('placeholder', 'Custom placeholder');
  });

  it('renders textarea when multiline is true', () => {
    const onChange = vi.fn();
    render(
      <BindingFieldOverride value="" onChange={onChange} multiline={true} />,
    );

    const input = screen.getByTestId('binding-input');
    expect(input.tagName).toBe('TEXTAREA');
  });
});
