'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Organization = {
  id: string;
  name: string;
};

type StyleGuideOption = {
  id: string;
  name: string;
  isDefault: boolean;
};

type EditTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    name: string;
    description: string | null;
    organization?: { id: string; name: string } | null;
    styleGuideId?: string | null;
  };
  organizations: Organization[];
  onSave: (data: {
    name: string;
    description: string | null;
    organizationId: string | null;
    styleGuideId?: string | null;
  }) => Promise<void>;
};

export function EditTemplateDialog({
  open,
  onOpenChange,
  template,
  organizations,
  onSave,
}: EditTemplateDialogProps) {
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description ?? '');
  const [organizationId, setOrganizationId] = useState<string>(
    template.organization?.id ?? 'none',
  );
  const [styleGuideId, setStyleGuideId] = useState<string>(
    template.styleGuideId ?? 'none',
  );
  const [styleGuides, setStyleGuides] = useState<StyleGuideOption[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch style guides when organization changes
  useEffect(() => {
    if (organizationId === 'none') {
      setStyleGuides([]);
      setStyleGuideId('none');
      return;
    }

    let cancelled = false;
    fetch(`/api/style-guides?organizationId=${organizationId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const guides = (data.data ?? []).map((sg: { id: string; name: string; isDefault: boolean }) => ({
          id: sg.id,
          name: sg.name,
          isDefault: sg.isDefault,
        }));
        setStyleGuides(guides);
        // If current styleGuideId is not in the new org's guides, reset
        if (!guides.some((g: StyleGuideOption) => g.id === styleGuideId)) {
          setStyleGuideId('none');
        }
      })
      .catch(() => {
        if (!cancelled) setStyleGuides([]);
      });

    return () => { cancelled = true; };
  }, [organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        organizationId: organizationId === 'none' ? null : organizationId,
        styleGuideId: styleGuideId === 'none' ? null : styleGuideId,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Edit Template</DialogTitle>
          <DialogDescription>Update template details and organization.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="template-name">Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="Template name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              maxLength={500}
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="template-org">Organization</Label>
            <Select value={organizationId} onValueChange={setOrganizationId}>
              <SelectTrigger id="template-org">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Unassigned)</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {organizationId !== 'none' && (
            <div className="grid gap-2">
              <Label htmlFor="template-style-guide">Style Guide</Label>
              <Select value={styleGuideId} onValueChange={setStyleGuideId}>
                <SelectTrigger id="template-style-guide">
                  <SelectValue placeholder="Select style guide" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {styleGuides.map((sg) => (
                    <SelectItem key={sg.id} value={sg.id}>
                      {sg.name}{sg.isDefault ? ' (Default)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
