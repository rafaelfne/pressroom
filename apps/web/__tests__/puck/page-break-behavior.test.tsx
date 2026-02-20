import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { puckConfig } from '@/lib/puck/config';

const mockPuckContext = {
  isEditing: false,
  dragRef: null,
  renderDropZone: vi.fn(),
  metadata: {},
};

const RESOLVED_TABLE_DATA = [
  { name: 'Item 1', quantity: 10, price: 29.99, date: '2024-01-15' },
];

describe('pageBreakBehavior prop', () => {
  afterEach(() => {
    cleanup();
  });

  it('DataTable defaults to auto and has pageBreakBehavior field', () => {
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    expect(defaultProps.pageBreakBehavior).toBe('auto');
    expect(puckConfig.components.DataTable.fields?.pageBreakBehavior).toBeDefined();
  });

  it('ChartBlock defaults to avoid', () => {
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    expect(defaultProps.pageBreakBehavior).toBe('avoid');
  });

  it('TextBlock defaults to auto', () => {
    const defaultProps = puckConfig.components.TextBlock.defaultProps!;
    expect(defaultProps.pageBreakBehavior).toBe('auto');
  });

  it('HeadingBlock defaults to auto', () => {
    const defaultProps = puckConfig.components.HeadingBlock.defaultProps!;
    expect(defaultProps.pageBreakBehavior).toBe('auto');
  });

  it('Container defaults to auto', () => {
    const defaultProps = puckConfig.components.Container.defaultProps!;
    expect(defaultProps.pageBreakBehavior).toBe('auto');
  });

  it('Section defaults to auto', () => {
    const defaultProps = puckConfig.components.Section.defaultProps!;
    expect(defaultProps.pageBreakBehavior).toBe('auto');
  });

  it('DataTable renders thead with display: table-header-group', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} dataExpression={RESOLVED_TABLE_DATA as unknown as string} id="test-table" puck={mockPuckContext} />,
    );
    const thead = container.querySelector('thead');
    expect(thead).toBeInTheDocument();
    expect(thead).toHaveStyle({ display: 'table-header-group' });
  });

  it('TextBlock applies pageBreakInside: avoid when set', () => {
    const Component = puckConfig.components.TextBlock.render;
    const defaultProps = puckConfig.components.TextBlock.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} pageBreakBehavior="avoid" id="test-text" puck={mockPuckContext} />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveStyle({ pageBreakInside: 'avoid' });
  });

  it('TextBlock applies pageBreakBefore: always when set to before', () => {
    const Component = puckConfig.components.TextBlock.render;
    const defaultProps = puckConfig.components.TextBlock.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} pageBreakBehavior="before" id="test-text" puck={mockPuckContext} />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveStyle({ pageBreakBefore: 'always' });
  });

  it('TextBlock applies pageBreakAfter: always when set to after', () => {
    const Component = puckConfig.components.TextBlock.render;
    const defaultProps = puckConfig.components.TextBlock.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} pageBreakBehavior="after" id="test-text" puck={mockPuckContext} />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveStyle({ pageBreakAfter: 'always' });
  });

  it('TextBlock does not apply page break styles when auto', () => {
    const Component = puckConfig.components.TextBlock.render;
    const defaultProps = puckConfig.components.TextBlock.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} pageBreakBehavior="auto" id="test-text" puck={mockPuckContext} />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.pageBreakInside).toBe('');
    expect(el.style.pageBreakBefore).toBe('');
    expect(el.style.pageBreakAfter).toBe('');
  });

  it('ChartBlock applies avoid by default', () => {
    const Component = puckConfig.components.ChartBlock.render;
    const defaultProps = puckConfig.components.ChartBlock.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} id="test-chart" puck={mockPuckContext} />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveStyle({ pageBreakInside: 'avoid' });
  });

  it('Section heading has pageBreakAfter: avoid to prevent orphaning', () => {
    const Component = puckConfig.components.Section.render;
    const defaultProps = puckConfig.components.Section.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} id="test-section" puck={mockPuckContext} />,
    );
    const heading = container.querySelector('h2');
    expect(heading).toHaveStyle({ pageBreakAfter: 'avoid' });
  });

  it('DataTable container applies avoid when pageBreakBehavior is avoid', () => {
    const Component = puckConfig.components.DataTable.render;
    const defaultProps = puckConfig.components.DataTable.defaultProps!;
    const { container } = render(
      <Component {...defaultProps} dataExpression={RESOLVED_TABLE_DATA as unknown as string} pageBreakBehavior="avoid" id="test-table" puck={mockPuckContext} />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveStyle({ pageBreakInside: 'avoid' });
  });
});
