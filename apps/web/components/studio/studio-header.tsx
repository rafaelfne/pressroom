'use client';

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import Link from 'next/link';
import {
  Pencil,
  Undo2,
  Redo2,
  ClipboardList,
  FileDown,
  Eye,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserDropdown } from '@/components/ui/user-dropdown';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type StudioHeaderProps = {
  templateName: string;
  onTemplateNameChange: (name: string) => void;
  user: {
    name?: string | null;
    email?: string | null;
    id?: string;
  };
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onToggleSampleData?: () => void;
  onDownloadPdf?: () => void;
  isDownloadingPdf?: boolean;
  onPreview?: () => void;
  onPublish?: () => void;
  isSaving?: boolean;
};

export function StudioHeader({
  templateName,
  onTemplateNameChange,
  user,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onToggleSampleData,
  onDownloadPdf,
  isDownloadingPdf = false,
  onPreview,
  onPublish,
  isSaving = false,
}: StudioHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(templateName);
  const [publishState, setPublishState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(templateName);
  }, [templateName]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Manage publish button animation states
  useEffect(() => {
    if (isSaving) {
      setPublishState('saving');
    } else if (publishState === 'saving') {
      setPublishState('saved');
      const timer = setTimeout(() => setPublishState('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, publishState]);

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

  const handlePublishClick = useCallback(() => {
    if (publishState !== 'saving') {
      onPublish?.();
    }
  }, [onPublish, publishState]);

  return (
    <TooltipProvider delayDuration={300}>
      <header
        className="sticky top-0 z-50 h-14 border-b bg-background"
        data-testid="studio-header"
      >
        <div className="flex h-full items-center px-4 gap-4">
          {/* Left: Logo */}
          <Link
            href="/templates"
            className="flex items-center gap-2 font-semibold shrink-0"
            data-testid="logo-link"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
              data-testid="logo-icon"
              aria-hidden="true"
            >
              <rect width="28" height="28" rx="6" className="fill-primary" />
              <text
                x="14"
                y="19"
                textAnchor="middle"
                className="fill-primary-foreground"
                fontSize="16"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                P
              </text>
            </svg>
            <span className="hidden sm:inline text-sm">Pressroom</span>
          </Link>

          {/* Separator */}
          <div className="h-6 w-px bg-border shrink-0" />

          {/* Center: Template name + Undo/Redo */}
          <div className="flex flex-1 items-center justify-center gap-2 min-w-0">
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
                  'max-w-[300px] w-full',
                )}
                data-testid="template-name-input"
              />
            ) : (
              <button
                onClick={handleStartEditing}
                className={cn(
                  'group flex items-center gap-1.5 rounded px-3 py-1 text-sm font-medium',
                  'hover:bg-accent truncate max-w-[300px]',
                )}
                data-testid="template-name-display"
              >
                <span className="truncate">{templateName}</span>
                <Pencil className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            )}

            {/* Undo/Redo */}
            <div className="flex items-center gap-0.5 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onUndo}
                    disabled={!canUndo}
                    data-testid="undo-button"
                    aria-label="Undo"
                    className="h-8 w-8"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRedo}
                    disabled={!canRedo}
                    data-testid="redo-button"
                    aria-label="Redo"
                    className="h-8 w-8"
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-border shrink-0" />

          {/* Right: Action icons + Publish + Avatar */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Sample Data */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleSampleData}
                  data-testid="sample-data-toggle"
                  aria-label="Sample Data"
                  className="h-8 w-8"
                >
                  <ClipboardList className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sample Data (Ctrl+Shift+D)</TooltipContent>
            </Tooltip>

            {/* Download PDF */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDownloadPdf}
                  disabled={isDownloadingPdf}
                  data-testid="download-pdf-button"
                  aria-label="Download PDF"
                  className="h-8 w-8"
                >
                  {isDownloadingPdf ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download PDF</TooltipContent>
            </Tooltip>

            {/* Preview */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPreview}
                  data-testid="preview-button"
                  aria-label="Preview"
                  className="h-8 w-8"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview (Ctrl+Shift+P)</TooltipContent>
            </Tooltip>

            {/* Separator before publish */}
            <div className="h-6 w-px bg-border mx-1" />

            {/* Publish */}
            <Button
              onClick={handlePublishClick}
              disabled={publishState === 'saving'}
              data-testid="publish-button"
              className={cn(
                'h-8 px-3 text-xs font-medium transition-colors',
                publishState === 'saved'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white',
              )}
            >
              {publishState === 'saving' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {publishState === 'saved' && <Check className="h-3.5 w-3.5" />}
              {publishState === 'idle' && 'Publish'}
              {publishState === 'saving' && 'Publishing…'}
              {publishState === 'saved' && 'Published'}
            </Button>

            {/* Separator before avatar */}
            <div className="h-6 w-px bg-border mx-1" />

            {/* User avatar */}
            <UserDropdown user={user} />
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
