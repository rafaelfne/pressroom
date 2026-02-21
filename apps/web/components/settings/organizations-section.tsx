'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type OrgWithCount = {
  id: string;
  name: string;
  slug: string;
  _count: { templates: number };
};

type OrganizationsSectionProps = {
  organizations: OrgWithCount[];
  canManage: boolean;
};

export function OrganizationsSection({ organizations, canManage }: OrganizationsSectionProps) {
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrgWithCount | null>(null);
  const [newOrgName, setNewOrgName] = useState('');
  const [editOrgName, setEditOrgName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const handleCreate = async () => {
    if (!newOrgName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOrgName.trim(),
          slug: generateSlug(newOrgName.trim()),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create organization');
        return;
      }

      setShowCreateDialog(false);
      setNewOrgName('');
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedOrg || !editOrgName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/organizations/${selectedOrg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editOrgName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update organization');
        return;
      }

      setShowEditDialog(false);
      setSelectedOrg(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrg) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/organizations/${selectedOrg.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete organization');
        return;
      }

      setShowDeleteDialog(false);
      setSelectedOrg(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
          <CardDescription>
            Organizations group your templates and define branding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {organizations.length > 0 ? (
            <div className="divide-y rounded-md border">
              {organizations.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium">{org.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {org._count.templates} template{org._count.templates !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setSelectedOrg(org);
                          setEditOrgName(org.name);
                          setError(null);
                          setShowEditDialog(true);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setSelectedOrg(org);
                          setError(null);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No organizations yet.</p>
          )}

          {canManage && (
            <Button
              variant="outline"
              onClick={() => {
                setNewOrgName('');
                setError(null);
                setShowCreateDialog(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Organization
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Create Organization Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>New Organization</DialogTitle>
            <DialogDescription>Create a new organization to group your templates.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="org-name">Name</Label>
              <Input
                id="org-name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Organization name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving || !newOrgName.trim()}>
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>Update the organization name.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-org-name">Name</Label>
              <Input
                id="edit-org-name"
                value={editOrgName}
                onChange={(e) => setEditOrgName(e.target.value)}
                placeholder="Organization name"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={saving || !editOrgName.trim()}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              {selectedOrg && selectedOrg._count.templates > 0
                ? `"${selectedOrg.name}" has ${selectedOrg._count.templates} template(s). Move or delete them first.`
                : `Are you sure you want to delete "${selectedOrg?.name}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          {error && <p className="px-6 text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving || (selectedOrg?._count.templates ?? 0) > 0}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
