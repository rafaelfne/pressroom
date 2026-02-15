import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PageNavigator, type PageItem } from '@/components/studio/page-navigator';
import type { Data } from '@puckeditor/core';

afterEach(() => {
  cleanup();
});

const emptyContent: Data = { content: [], root: {} };

function createPages(count: number): PageItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `page-${i + 1}`,
    name: `Page ${i + 1}`,
    content: emptyContent,
  }));
}

const defaultProps = {
  pages: createPages(3),
  activePageId: 'page-1',
  onSelectPage: vi.fn(),
  onAddPage: vi.fn(),
  onDeletePage: vi.fn(),
  onDuplicatePage: vi.fn(),
  onRenamePage: vi.fn(),
  onReorderPage: vi.fn(),
};

describe('PageNavigator', () => {
  it('renders all pages', () => {
    render(<PageNavigator {...defaultProps} />);
    expect(screen.getByText('Page 1')).toBeInTheDocument();
    expect(screen.getByText('Page 2')).toBeInTheDocument();
    expect(screen.getByText('Page 3')).toBeInTheDocument();
  });

  it('shows page count in header', () => {
    render(<PageNavigator {...defaultProps} />);
    const nav = screen.getByTestId('page-navigator');
    expect(nav).toHaveTextContent('Pages');
    expect(nav).toHaveTextContent('3');
  });

  it('renders add page button', () => {
    render(<PageNavigator {...defaultProps} />);
    expect(screen.getByTestId('add-page-button')).toBeInTheDocument();
  });

  it('calls onAddPage when add button is clicked', () => {
    const onAddPage = vi.fn();
    render(<PageNavigator {...defaultProps} onAddPage={onAddPage} />);
    fireEvent.click(screen.getByTestId('add-page-button'));
    expect(onAddPage).toHaveBeenCalledTimes(1);
  });

  it('calls onSelectPage when a page is clicked', () => {
    const onSelectPage = vi.fn();
    render(<PageNavigator {...defaultProps} onSelectPage={onSelectPage} />);
    fireEvent.click(screen.getByTestId('page-item-page-2'));
    expect(onSelectPage).toHaveBeenCalledWith('page-2');
  });

  it('calls onDeletePage when delete button is clicked', () => {
    const onDeletePage = vi.fn();
    render(
      <PageNavigator
        {...defaultProps}
        activePageId="page-1"
        onDeletePage={onDeletePage}
      />,
    );
    const deleteBtn = screen.getByTestId('page-delete-page-1');
    fireEvent.click(deleteBtn);
    expect(onDeletePage).toHaveBeenCalledWith('page-1');
  });

  it('calls onDuplicatePage when duplicate button is clicked', () => {
    const onDuplicatePage = vi.fn();
    render(
      <PageNavigator
        {...defaultProps}
        activePageId="page-1"
        onDuplicatePage={onDuplicatePage}
      />,
    );
    const dupBtn = screen.getByTestId('page-duplicate-page-1');
    fireEvent.click(dupBtn);
    expect(onDuplicatePage).toHaveBeenCalledWith('page-1');
  });

  it('calls onReorderPage with up direction', () => {
    const onReorderPage = vi.fn();
    render(
      <PageNavigator
        {...defaultProps}
        activePageId="page-2"
        onReorderPage={onReorderPage}
      />,
    );
    const upBtn = screen.getByTestId('page-move-up-page-2');
    fireEvent.click(upBtn);
    expect(onReorderPage).toHaveBeenCalledWith('page-2', 'up');
  });

  it('calls onReorderPage with down direction', () => {
    const onReorderPage = vi.fn();
    render(
      <PageNavigator
        {...defaultProps}
        activePageId="page-2"
        onReorderPage={onReorderPage}
      />,
    );
    const downBtn = screen.getByTestId('page-move-down-page-2');
    fireEvent.click(downBtn);
    expect(onReorderPage).toHaveBeenCalledWith('page-2', 'down');
  });

  it('disables move up for first page', () => {
    render(
      <PageNavigator {...defaultProps} activePageId="page-1" />,
    );
    const upBtn = screen.getByTestId('page-move-up-page-1');
    expect(upBtn).toBeDisabled();
  });

  it('disables move down for last page', () => {
    render(
      <PageNavigator {...defaultProps} activePageId="page-3" />,
    );
    const downBtn = screen.getByTestId('page-move-down-page-3');
    expect(downBtn).toBeDisabled();
  });

  it('does not show delete button when only one page', () => {
    render(
      <PageNavigator
        {...defaultProps}
        pages={createPages(1)}
        activePageId="page-1"
      />,
    );
    expect(screen.queryByTestId('page-delete-page-1')).not.toBeInTheDocument();
  });

  it('starts rename on rename button click', () => {
    render(
      <PageNavigator {...defaultProps} activePageId="page-1" />,
    );
    fireEvent.click(screen.getByTestId('page-rename-page-1'));
    expect(screen.getByTestId('page-rename-input-page-1')).toBeInTheDocument();
  });

  it('commits rename on Enter key', () => {
    const onRenamePage = vi.fn();
    render(
      <PageNavigator
        {...defaultProps}
        activePageId="page-1"
        onRenamePage={onRenamePage}
      />,
    );
    fireEvent.click(screen.getByTestId('page-rename-page-1'));
    const input = screen.getByTestId('page-rename-input-page-1');
    fireEvent.change(input, { target: { value: 'Summary' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onRenamePage).toHaveBeenCalledWith('page-1', 'Summary');
  });

  it('cancels rename on Escape key', () => {
    const onRenamePage = vi.fn();
    render(
      <PageNavigator
        {...defaultProps}
        activePageId="page-1"
        onRenamePage={onRenamePage}
      />,
    );
    fireEvent.click(screen.getByTestId('page-rename-page-1'));
    const input = screen.getByTestId('page-rename-input-page-1');
    fireEvent.change(input, { target: { value: 'New Name' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onRenamePage).not.toHaveBeenCalled();
  });

  it('renders the page navigator container', () => {
    render(<PageNavigator {...defaultProps} />);
    expect(screen.getByTestId('page-navigator')).toBeInTheDocument();
  });

  it('renders the Pages header', () => {
    render(<PageNavigator {...defaultProps} />);
    expect(screen.getByText('Pages')).toBeInTheDocument();
  });
});
