'use client';

import { useEffect, useRef } from 'react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface SelectionContextMenuProps {
  /** Whether the menu is visible */
  open: boolean;
  /** Menu position in viewport coordinates */
  position: { x: number; y: number };
  /** Close the menu */
  onClose: () => void;
  /** Handler for copy action */
  onCopy: () => void;
  /** Handler for cut action */
  onCut: () => void;
  /** Handler for paste action */
  onPaste: () => void;
  /** Handler for duplicate action */
  onDuplicate: () => void;
  /** Handler for delete action */
  onDelete: () => void;
  /** Handler for select all action */
  onSelectAll: () => void;
  /** Whether there's anything to paste */
  hasClipboard: boolean;
  /** Whether there's a selection */
  hasSelection: boolean;
}

interface MenuItem {
  label: string;
  shortcut: string;
  onClick: () => void;
  disabled: boolean;
  comingSoon?: boolean;
}

/**
 * Right-click context menu for multi-selected components in the studio.
 * Provides cut/copy/paste/duplicate/delete/select-all operations with keyboard shortcuts.
 *
 * The menu appears at the cursor position and closes when clicking outside or pressing Escape.
 */
export function SelectionContextMenu({
  open,
  position,
  onClose,
  onCopy,
  onCut,
  onPaste,
  onDuplicate,
  onDelete,
  onSelectAll,
  hasClipboard,
  hasSelection,
}: SelectionContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside and escape key
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const menuItems: (MenuItem | 'separator')[] = [
    {
      label: 'Copy',
      shortcut: 'Ctrl+C',
      onClick: onCopy,
      disabled: !hasSelection,
    },
    {
      label: 'Cut',
      shortcut: 'Ctrl+X',
      onClick: onCut,
      disabled: !hasSelection,
    },
    {
      label: 'Paste',
      shortcut: 'Ctrl+V',
      onClick: onPaste,
      disabled: !hasClipboard,
    },
    'separator',
    {
      label: 'Duplicate',
      shortcut: 'Ctrl+D',
      onClick: onDuplicate,
      disabled: !hasSelection,
    },
    {
      label: 'Delete',
      shortcut: 'Del',
      onClick: onDelete,
      disabled: !hasSelection,
    },
    'separator',
    {
      label: 'Select All',
      shortcut: 'Ctrl+A',
      onClick: onSelectAll,
      disabled: false,
    },
    'separator',
    {
      label: 'Group',
      shortcut: '',
      onClick: () => {},
      disabled: true,
      comingSoon: true,
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;
    item.onClick();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] rounded-md border border-gray-200 bg-white shadow-md"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      data-testid="selection-context-menu"
    >
      <div className="p-1">
        {menuItems.map((item, index) => {
          if (item === 'separator') {
            return <Separator key={`separator-${index}`} className="my-1" />;
          }

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={cn(
                'flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm transition-colors',
                item.disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-accent hover:text-accent-foreground cursor-pointer',
              )}
              data-testid={`context-menu-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <span className="flex items-center gap-2">
                {item.label}
                {item.comingSoon && (
                  <span className="text-xs text-muted-foreground">(Coming soon)</span>
                )}
              </span>
              {item.shortcut && (
                <span className="text-xs text-muted-foreground ml-4">{item.shortcut}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
