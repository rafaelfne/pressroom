import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PageTabBar } from '@/components/studio/page-tab-bar';
import type { Data } from '@puckeditor/core';

afterEach(() => {
  cleanup();
});

const mockPages = [
  { id: 'page-1', name: 'Cover', content: { content: [], root: {} } as Data },
  { id: 'page-2', name: 'Summary', content: { content: [], root: {} } as Data },
  { id: 'page-3', name: 'Details', content: { content: [], root: {} } as Data },
];

const defaultProps = {
  pages: mockPages,
  activePageId: 'page-1',
  onSelectPage: vi.fn(),
  onAddPage: vi.fn(),
  onDeletePage: vi.fn(),
  onDuplicatePage: vi.fn(),
  onRenamePage: vi.fn(),
  onReorderPage: vi.fn(),
};

describe('PageTabBar', () => {
  it('renders all page tabs', () => {
    render(<PageTabBar {...defaultProps} />);
    expect(screen.getByText('Cover')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('shows active tab with active styling (font-semibold class + border-primary)', () => {
    render(<PageTabBar {...defaultProps} activePageId="page-2" />);
    const activeTab = screen.getByTestId('page-tab-page-2');
    expect(activeTab).toHaveClass('border-primary');
    expect(activeTab).toHaveClass('font-semibold');
  });

  it('calls onSelectPage when tab is clicked', () => {
    const onSelectPage = vi.fn();
    render(<PageTabBar {...defaultProps} onSelectPage={onSelectPage} />);
    fireEvent.click(screen.getByTestId('page-tab-page-2'));
    expect(onSelectPage).toHaveBeenCalledWith('page-2');
  });

  it('calls onAddPage when "+" button is clicked', () => {
    const onAddPage = vi.fn();
    render(<PageTabBar {...defaultProps} onAddPage={onAddPage} />);
    fireEvent.click(screen.getByTestId('add-page-tab-button'));
    expect(onAddPage).toHaveBeenCalledTimes(1);
  });

  it('double-click opens rename input', () => {
    render(<PageTabBar {...defaultProps} />);
    const tab = screen.getByTestId('page-tab-page-1');
    fireEvent.doubleClick(tab);
    expect(screen.getByTestId('page-tab-rename-input')).toBeInTheDocument();
  });

  it('rename input commits on Enter', () => {
    const onRenamePage = vi.fn();
    render(<PageTabBar {...defaultProps} onRenamePage={onRenamePage} />);
    const tab = screen.getByTestId('page-tab-page-1');
    fireEvent.doubleClick(tab);
    const input = screen.getByTestId('page-tab-rename-input');
    fireEvent.change(input, { target: { value: 'New Cover' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onRenamePage).toHaveBeenCalledWith('page-1', 'New Cover');
  });

  it('rename input cancels on Escape', () => {
    const onRenamePage = vi.fn();
    render(<PageTabBar {...defaultProps} onRenamePage={onRenamePage} />);
    const tab = screen.getByTestId('page-tab-page-1');
    fireEvent.doubleClick(tab);
    const input = screen.getByTestId('page-tab-rename-input');
    fireEvent.change(input, { target: { value: 'New Name' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onRenamePage).not.toHaveBeenCalled();
  });

  it('right-click opens context menu', () => {
    render(<PageTabBar {...defaultProps} />);
    const tab = screen.getByTestId('page-tab-page-1');
    fireEvent.contextMenu(tab);
    expect(screen.getByTestId('page-tab-context-menu')).toBeInTheDocument();
  });

  it('context menu Rename action starts rename', () => {
    render(<PageTabBar {...defaultProps} />);
    const tab = screen.getByTestId('page-tab-page-1');
    fireEvent.contextMenu(tab);
    const renameButton = screen.getByText('Rename');
    fireEvent.click(renameButton);
    expect(screen.getByTestId('page-tab-rename-input')).toBeInTheDocument();
  });

  it('context menu Duplicate action calls onDuplicatePage', () => {
    const onDuplicatePage = vi.fn();
    render(<PageTabBar {...defaultProps} onDuplicatePage={onDuplicatePage} />);
    const tab = screen.getByTestId('page-tab-page-1');
    fireEvent.contextMenu(tab);
    const duplicateButton = screen.getByText('Duplicate Page');
    fireEvent.click(duplicateButton);
    expect(onDuplicatePage).toHaveBeenCalledWith('page-1');
  });

  it('context menu Delete action calls onDeletePage (when more than 1 page)', () => {
    const onDeletePage = vi.fn();
    render(<PageTabBar {...defaultProps} onDeletePage={onDeletePage} />);
    const tab = screen.getByTestId('page-tab-page-1');
    fireEvent.contextMenu(tab);
    const deleteButton = screen.getByText('Delete Page');
    fireEvent.click(deleteButton);
    expect(onDeletePage).toHaveBeenCalledWith('page-1');
  });

  it('context menu Delete is disabled with single page', () => {
    render(
      <PageTabBar
        {...defaultProps}
        pages={[mockPages[0]]}
        activePageId="page-1"
      />,
    );
    const tab = screen.getByTestId('page-tab-page-1');
    fireEvent.contextMenu(tab);
    const deleteButton = screen.getByText('Delete Page');
    expect(deleteButton).toBeDisabled();
  });

  it('context menu Move Left calls onReorderPage with up', () => {
    const onReorderPage = vi.fn();
    render(<PageTabBar {...defaultProps} onReorderPage={onReorderPage} />);
    const tab = screen.getByTestId('page-tab-page-2');
    fireEvent.contextMenu(tab);
    const moveLeftButton = screen.getByText('Move Left');
    fireEvent.click(moveLeftButton);
    expect(onReorderPage).toHaveBeenCalledWith('page-2', 'up');
  });

  it('context menu Move Right calls onReorderPage with down', () => {
    const onReorderPage = vi.fn();
    render(<PageTabBar {...defaultProps} onReorderPage={onReorderPage} />);
    const tab = screen.getByTestId('page-tab-page-2');
    fireEvent.contextMenu(tab);
    const moveRightButton = screen.getByText('Move Right');
    fireEvent.click(moveRightButton);
    expect(onReorderPage).toHaveBeenCalledWith('page-2', 'down');
  });

  it('context menu Move Left is disabled for first page', () => {
    render(<PageTabBar {...defaultProps} activePageId="page-1" />);
    const tab = screen.getByTestId('page-tab-page-1');
    fireEvent.contextMenu(tab);
    const moveLeftButton = screen.getByText('Move Left');
    expect(moveLeftButton).toBeDisabled();
  });

  it('context menu Move Right is disabled for last page', () => {
    render(<PageTabBar {...defaultProps} activePageId="page-3" />);
    const tab = screen.getByTestId('page-tab-page-3');
    fireEvent.contextMenu(tab);
    const moveRightButton = screen.getByText('Move Right');
    expect(moveRightButton).toBeDisabled();
  });
});
