'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { duplicateTemplate, deleteTemplate } from '@/lib/templates/actions';

type TemplateCardProps = {
  template: {
    id: string;
    name: string;
    description: string | null;
    tags: string[];
    updatedAt: Date;
    templateData: unknown;
  };
};

const MAX_VISIBLE_TAGS = 3;

export function TemplateCard({ template }: TemplateCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const visibleTags = template.tags.slice(0, MAX_VISIBLE_TAGS);
  const remainingTagsCount = template.tags.length - MAX_VISIBLE_TAGS;

  const handleDownloadJSON = () => {
    const jsonString = JSON.stringify(template.templateData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitized = template.name
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    link.download = `${sanitized || 'template'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card className="group relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
        <div className="flex flex-1 flex-col p-6">
          {/* Header with title and menu */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <Link
              href={`/studio/${template.id}`}
              className="flex-1 truncate font-semibold hover:underline"
            >
              {template.name}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/studio/${template.id}`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <form action={duplicateTemplate.bind(null, template.id)}>
                    <button type="submit" className="w-full text-left">
                      Duplicate
                    </button>
                  </form>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadJSON}>
                  <Download className="mr-2 h-4 w-4" />
                  Download JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {template.description || 'No description'}
          </p>

          {/* Tags */}
          {template.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1">
              {visibleTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {remainingTagsCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  +{remainingTagsCount} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-4 text-xs text-muted-foreground">
            Updated{' '}
            {template.updatedAt.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{template.name}&rdquo;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <form action={deleteTemplate.bind(null, template.id)}>
              <Button type="submit" variant="destructive">
                Delete
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
