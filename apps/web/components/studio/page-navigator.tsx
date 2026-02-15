'use client';

import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import type { Data } from '@puckeditor/core';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PageItem {
  id: string;
  name: string;
  content: Data;
}

export interface PageNavigatorProps {
  pages: PageItem[];
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onRenamePage: (pageId: string, newName: string) => void;
  onReorderPage: (pageId: string, direction: 'up' | 'down') => void;
}

export function PageNavigator({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onRenamePage,
  onReorderPage,
}: PageNavigatorProps) {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingPageId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingPageId]);

  const startRename = (page: PageItem) => {
    setEditingPageId(page.id);
    setEditValue(page.name);
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

  return (
    <div
      className="flex h-full w-56 flex-col border-r bg-muted/30"
      data-testid="page-navigator"
    >
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pages
        </span>
        <span className="text-xs text-muted-foreground">{pages.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1" role="listbox" aria-label="Template pages">
          {pages.map((page, index) => {
            const isActive = page.id === activePageId;
            const isEditing = editingPageId === page.id;

            return (
              <li key={page.id} role="option" aria-selected={isActive}>
                <div
                  className={cn(
                    'group flex flex-col rounded-md border px-2 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-transparent hover:border-border hover:bg-accent/50',
                  )}
                >
                  {/* Page header: click to select */}
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 text-left"
                    onClick={() => onSelectPage(page.id)}
                    data-testid={`page-item-${page.id}`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium">
                      {index + 1}
                    </span>
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="min-w-0 flex-1 rounded border border-input bg-background px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        data-testid={`page-rename-input-${page.id}`}
                      />
                    ) : (
                      <span className="min-w-0 flex-1 truncate text-xs">
                        {page.name}
                      </span>
                    )}
                  </button>

                  {/* Action buttons - visible on hover or when active */}
                  {!isEditing && (
                    <div
                      className={cn(
                        'mt-1 flex items-center gap-0.5',
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                      )}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-[10px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderPage(page.id, 'up');
                        }}
                        disabled={index === 0}
                        title="Move up"
                        data-testid={`page-move-up-${page.id}`}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-[10px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderPage(page.id, 'down');
                        }}
                        disabled={index === pages.length - 1}
                        title="Move down"
                        data-testid={`page-move-down-${page.id}`}
                      >
                        ↓
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-[10px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(page);
                        }}
                        title="Rename"
                        data-testid={`page-rename-${page.id}`}
                      >
                        ✎
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-[10px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicatePage(page.id);
                        }}
                        title="Duplicate"
                        data-testid={`page-duplicate-${page.id}`}
                      >
                        ⧉
                      </Button>
                      {pages.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-[10px] text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePage(page.id);
                          }}
                          title="Delete"
                          data-testid={`page-delete-${page.id}`}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t p-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={onAddPage}
          data-testid="add-page-button"
        >
          + Add Page
        </Button>
      </div>
    </div>
  );
}
