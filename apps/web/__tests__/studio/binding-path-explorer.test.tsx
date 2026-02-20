import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { BindingPathExplorer } from '@/components/studio/binding-path-explorer';

describe('BindingPathExplorer', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders trigger button', () => {
    const onSelectPath = vi.fn();
    render(
      <BindingPathExplorer
        sampleData={{ name: 'John' }}
        onSelectPath={onSelectPath}
      />,
    );

    expect(screen.getByTestId('explorer-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('explorer-trigger')).toHaveTextContent('📎');
  });

  it('trigger is disabled when no sample data', () => {
    const onSelectPath = vi.fn();
    render(<BindingPathExplorer onSelectPath={onSelectPath} />);

    const trigger = screen.getByTestId('explorer-trigger');
    expect(trigger).toBeDisabled();
  });

  it('opens popover on click', () => {
    const onSelectPath = vi.fn();
    render(
      <BindingPathExplorer
        sampleData={{ name: 'John' }}
        onSelectPath={onSelectPath}
      />,
    );

    fireEvent.click(screen.getByTestId('explorer-trigger'));
    expect(screen.getByTestId('explorer-popover')).toBeInTheDocument();
  });

  it('shows data structure header', () => {
    const onSelectPath = vi.fn();
    render(
      <BindingPathExplorer
        sampleData={{ name: 'John' }}
        onSelectPath={onSelectPath}
      />,
    );

    fireEvent.click(screen.getByTestId('explorer-trigger'));
    expect(screen.getByText('Data Structure')).toBeInTheDocument();
  });

  it('shows tree nodes for sample data', () => {
    const onSelectPath = vi.fn();
    render(
      <BindingPathExplorer
        sampleData={{ name: 'John', age: 30 }}
        onSelectPath={onSelectPath}
      />,
    );

    fireEvent.click(screen.getByTestId('explorer-trigger'));
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();
  });

  it('shows type badges for leaf nodes', () => {
    const onSelectPath = vi.fn();
    render(
      <BindingPathExplorer
        sampleData={{ name: 'John' }}
        onSelectPath={onSelectPath}
      />,
    );

    fireEvent.click(screen.getByTestId('explorer-trigger'));
    expect(screen.getByText('string')).toBeInTheDocument();
  });

  it('calls onSelectPath when clicking a leaf node', () => {
    const onSelectPath = vi.fn();
    render(
      <BindingPathExplorer
        sampleData={{ name: 'John' }}
        onSelectPath={onSelectPath}
      />,
    );

    fireEvent.click(screen.getByTestId('explorer-trigger'));
    fireEvent.click(screen.getByTestId('tree-leaf'));

    expect(onSelectPath).toHaveBeenCalledWith('name');
  });

  it('shows array item count', () => {
    const onSelectPath = vi.fn();
    render(
      <BindingPathExplorer
        sampleData={{ items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] }}
        onSelectPath={onSelectPath}
      />,
    );

    fireEvent.click(screen.getByTestId('explorer-trigger'));
    expect(screen.getByText('→ array[3]')).toBeInTheDocument();
  });

  it('closes popover on second click of trigger', () => {
    const onSelectPath = vi.fn();
    render(
      <BindingPathExplorer
        sampleData={{ name: 'John' }}
        onSelectPath={onSelectPath}
      />,
    );

    const trigger = screen.getByTestId('explorer-trigger');
    fireEvent.click(trigger);
    expect(screen.getByTestId('explorer-popover')).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.queryByTestId('explorer-popover')).not.toBeInTheDocument();
  });

  it('closes popover after selecting a path', () => {
    const onSelectPath = vi.fn();
    render(
      <BindingPathExplorer
        sampleData={{ name: 'John' }}
        onSelectPath={onSelectPath}
      />,
    );

    fireEvent.click(screen.getByTestId('explorer-trigger'));
    fireEvent.click(screen.getByTestId('tree-leaf'));

    expect(screen.queryByTestId('explorer-popover')).not.toBeInTheDocument();
  });

  it('blocks dangerous properties', () => {
    const onSelectPath = vi.fn();
    render(
      <BindingPathExplorer
        sampleData={{
          name: 'safe',
          constructor: 'dangerous',
        }}
        onSelectPath={onSelectPath}
      />,
    );

    fireEvent.click(screen.getByTestId('explorer-trigger'));
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.queryByText('constructor')).not.toBeInTheDocument();
  });

  it('has data-testid on container', () => {
    const onSelectPath = vi.fn();
    render(
      <BindingPathExplorer
        sampleData={{ name: 'John' }}
        onSelectPath={onSelectPath}
      />,
    );

    expect(screen.getByTestId('binding-path-explorer')).toBeInTheDocument();
  });
});
