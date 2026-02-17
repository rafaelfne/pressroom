'use client';

import { useState, useRef, useEffect, type KeyboardEvent, type MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PageItem } from '@/components/studio/page-navigator';

export interface PageTabBarProps {
  pages: PageItem[];
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onRenamePage: (pageId: string, newName: string) => void;
  onReorderPage: (pageId: string, direction: 'up' | 'down') => void;
}

interface ContextMenuState {
  pageId: string;
  x: number;
  y: number;
}

export function PageTabBar({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onRenamePage,
  onReorderPage,
}: PageTabBarProps) {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Focus and select input when editing starts
  useEffect(() => {
    if (editingPageId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingPageId]);

  // Handle click outside context menu
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu(null);
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [contextMenu]);

  const startRename = (page: PageItem) => {
    setEditingPageId(page.id);
    setEditValue(page.name);
    setContextMenu(null);
  };

  const commitRename = () => {
    if (editingPageId) {
      const trimmed = editValue.trim();
      if (trimmed) {
        onRenamePage(editingPageId, trimmed);
      }
      setEditingPageId(null);
    }
  };

  const cancelRename = () => {
    setEditingPageId(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelRename();
    }
  };

  const handleTabClick = (pageId: string) => {
    if (editingPageId !== pageId) {
      onSelectPage(pageId);
    }
  };

  const handleTabDoubleClick = (page: PageItem) => {
    startRename(page);
  };

  const handleTabContextMenu = (e: MouseEvent<HTMLDivElement>, pageId: string) => {
    e.preventDefault();
    setContextMenu({
      pageId,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const getPageIndex = (pageId: string) => {
    return pages.findIndex((p) => p.id === pageId);
  };

  const handleContextMenuAction = (action: string, pageId: string) => {
    const pageIndex = getPageIndex(pageId);
    const page = pages[pageIndex];

    switch (action) {
      case 'rename':
        if (page) {
          startRename(page);
        }
        break;
      case 'duplicate':
        onDuplicatePage(pageId);
        setContextMenu(null);
        break;
      case 'delete':
        onDeletePage(pageId);
        setContextMenu(null);
        break;
      case 'moveLeft':
        onReorderPage(pageId, 'up');
        setContextMenu(null);
        break;
      case 'moveRight':
        onReorderPage(pageId, 'down');
        setContextMenu(null);
        break;
      case 'insertAfter':
        onAddPage();
        setContextMenu(null);
        break;
      default:
        setContextMenu(null);
    }
  };

  return (
    <div
      className="flex h-9 w-full items-center border-t border-border bg-background"
      data-testid="page-tab-bar"
    >
      {/* Scrollable tab container */}
      <div className="flex flex-1 items-center overflow-x-auto">
        {pages.map((page) => {
          const isActive = page.id === activePageId;
          const isEditing = editingPageId === page.id;

          return (
            <div
              key={page.id}
              className={cn(
                'group relative flex h-full min-w-[80px] max-w-[160px] shrink-0 cursor-pointer items-center border-b-2 px-3 transition-colors',
                isActive
                  ? 'border-primary bg-background font-semibold'
                  : 'border-transparent bg-transparent hover:bg-muted',
              )}
              onClick={() => handleTabClick(page.id)}
              onDoubleClick={() => handleTabDoubleClick(page)}
              onContextMenu={(e) => handleTabContextMenu(e, page.id)}
              data-testid={`page-tab-${page.id}`}
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded border border-input bg-background px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  data-testid="page-tab-rename-input"
                />
              ) : (
                <span className="truncate text-sm">{page.name}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Add page button */}
      <div className="flex h-full shrink-0 items-center border-l px-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-sm"
          onClick={onAddPage}
          data-testid="add-page-tab-button"
          title="Add page"
        >
          +
        </Button>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 min-w-[180px] rounded-md border border-border bg-popover p-1 shadow-lg"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          data-testid="page-tab-context-menu"
        >
          <button
            type="button"
            className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
            onClick={() => handleContextMenuAction('rename', contextMenu.pageId)}
          >
            Rename
          </button>
          <button
            type="button"
            className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
            onClick={() => handleContextMenuAction('duplicate', contextMenu.pageId)}
          >
            Duplicate Page
          </button>
          <button
            type="button"
            className={cn(
              'w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent',
              pages.length === 1 && 'cursor-not-allowed opacity-50',
            )}
            onClick={() => handleContextMenuAction('delete', contextMenu.pageId)}
            disabled={pages.length === 1}
          >
            Delete Page
          </button>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            className={cn(
              'w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent',
              getPageIndex(contextMenu.pageId) === 0 && 'cursor-not-allowed opacity-50',
            )}
            onClick={() => handleContextMenuAction('moveLeft', contextMenu.pageId)}
            disabled={getPageIndex(contextMenu.pageId) === 0}
          >
            Move Left
          </button>
          <button
            type="button"
            className={cn(
              'w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent',
              getPageIndex(contextMenu.pageId) === pages.length - 1 &&
              'cursor-not-allowed opacity-50',
            )}
            onClick={() => handleContextMenuAction('moveRight', contextMenu.pageId)}
            disabled={getPageIndex(contextMenu.pageId) === pages.length - 1}
          >
            Move Right
          </button>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
            onClick={() => handleContextMenuAction('insertAfter', contextMenu.pageId)}
          >
            Insert Page After
          </button>
        </div>
      )}
    </div>
  );
}
