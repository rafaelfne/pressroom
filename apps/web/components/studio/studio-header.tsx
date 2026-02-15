'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import Link from 'next/link';
import { UserDropdown } from '@/components/ui/user-dropdown';
import { cn } from '@/lib/utils';

export type StudioHeaderProps = {
  templateName: string;
  onTemplateNameChange: (name: string) => void;
  user: {
    name?: string | null;
    email?: string | null;
    id?: string;
  };
};

export function StudioHeader({ templateName, onTemplateNameChange, user }: StudioHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(templateName);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update edit value when templateName prop changes
  useEffect(() => {
    setEditValue(templateName);
  }, [templateName]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEditing = () => {
    setEditValue(templateName);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== templateName) {
      onTemplateNameChange(trimmed);
    } else {
      setEditValue(templateName);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(templateName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <header
      className="sticky top-0 z-50 h-14 border-b bg-background"
      data-testid="studio-header"
    >
      <div className="flex h-full items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <Link href="/templates" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              P
            </div>
            <span className="hidden sm:inline">Pressroom</span>
          </Link>
        </div>

        {/* Center: Template name (editable) */}
        <div className="flex flex-1 items-center justify-center px-4">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              className={cn(
                'rounded border border-input bg-background px-3 py-1 text-sm font-medium',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]',
              )}
              data-testid="template-name-input"
            />
          ) : (
            <button
              onClick={handleStartEditing}
              className={cn(
                'rounded px-3 py-1 text-sm font-medium hover:bg-accent',
                'truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]',
              )}
              data-testid="template-name-display"
            >
              {templateName}
            </button>
          )}
        </div>

        {/* Right: User dropdown */}
        <div className="flex items-center">
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  );
}
