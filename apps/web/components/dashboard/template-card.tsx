'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreVertical, Download, Pencil, Copy, FolderInput, Share2, Trash2 } from 'lucide-react';
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
import { EditTemplateDialog } from '@/components/templates/edit-template-dialog';
import { CloneToOrgDialog } from '@/components/templates/clone-to-org-dialog';

type Organization = {
  id: string;
  name: string;
};

type TemplateCardProps = {
  template: {
    id: string;
    name: string;
    description: string | null;
    tags: string[];
    updatedAt: Date;
    templateData: unknown;
    organization?: Organization | null;
  };
  organizations?: Organization[];
  onTemplateUpdated?: () => void;
};

const MAX_VISIBLE_TAGS = 3;

export function TemplateCard({ template, organizations = [], onTemplateUpdated }: TemplateCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCloneToOrgDialog, setShowCloneToOrgDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const handleClone = async () => {
    try {
      const res = await fetch(`/api/templates/${template.id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const clone = await res.json();
        router.push(`/studio/${clone.id}`);
      }
    } catch (error) {
      console.error('Failed to clone template:', error);
    }
  };

  const handleCloneToOrg = async (organizationId: string | null) => {
    try {
      const res = await fetch(`/api/templates/${template.id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId }),
      });
      if (res.ok) {
        onTemplateUpdated?.();
      }
    } catch (error) {
      console.error('Failed to clone template:', error);
    }
  };

  const handleSaveDetails = async (data: {
    name: string;
    description: string | null;
    organizationId: string | null;
  }) => {
    const res = await fetch(`/api/templates/${template.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      onTemplateUpdated?.();
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/templates/${template.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setShowDeleteDialog(false);
        onTemplateUpdated?.();
      }
    } finally {
      setDeleting(false);
    }
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
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClone}>
                  <Copy className="mr-2 h-4 w-4" />
                  Clone Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowCloneToOrgDialog(true)}>
                  <FolderInput className="mr-2 h-4 w-4" />
                  Clone to Org...
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/studio/${template.id}`}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Link>
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
                  <Trash2 className="mr-2 h-4 w-4" />
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
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{template.name}&rdquo;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Details dialog */}
      <EditTemplateDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        template={template}
        organizations={organizations}
        onSave={handleSaveDetails}
      />

      {/* Clone to Org dialog */}
      <CloneToOrgDialog
        open={showCloneToOrgDialog}
        onOpenChange={setShowCloneToOrgDialog}
        templateName={template.name}
        organizations={organizations}
        onClone={handleCloneToOrg}
      />
    </>
  );
}
