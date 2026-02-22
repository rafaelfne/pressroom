'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type TokenInput = {
  name: string;
  label: string;
  category: 'color' | 'typography' | 'spacing' | 'background' | 'border';
  cssProperty: string;
  value: string;
  sortOrder: number;
};

type StyleGuideData = {
  id: string;
  name: string;
  isDefault: boolean;
  tokens: Array<TokenInput & { id: string }>;
};

type StyleGuidesSectionProps = {
  organizationId: string;
  organizationName?: string;
  styleGuides: StyleGuideData[];
  canManage: boolean;
};

const CATEGORIES = ['color', 'typography', 'spacing', 'background', 'border'] as const;

const CSS_PROPERTIES_BY_CATEGORY: Record<string, string[]> = {
  color: ['color'],
  typography: ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing'],
  spacing: ['padding', 'margin', 'gap'],
  background: ['background-color', 'background'],
  border: ['border-color', 'border-width', 'border-radius'],
};

const EMPTY_TOKEN: TokenInput = {
  name: '',
  label: '',
  category: 'color',
  cssProperty: 'color',
  value: '',
  sortOrder: 0,
};

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function StyleGuidesSection({
  organizationId,
  organizationName,
  styleGuides,
  canManage,
}: StyleGuidesSectionProps) {
  const router = useRouter();

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form states
  const [selectedGuide, setSelectedGuide] = useState<StyleGuideData | null>(null);
  const [guideName, setGuideName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [tokens, setTokens] = useState<TokenInput[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setGuideName('');
    setIsDefault(false);
    setTokens([]);
    setError(null);
    setSelectedGuide(null);
  };

  const addToken = () => {
    setTokens((prev) => [...prev, { ...EMPTY_TOKEN, sortOrder: prev.length }]);
  };

  const updateToken = (index: number, updates: Partial<TokenInput>) => {
    setTokens((prev) =>
      prev.map((t, i) => {
        if (i !== index) return t;
        const updated = { ...t, ...updates };
        // Auto-set cssProperty when category changes and current value is not in the new category
        if (updates.category) {
          const validProps = CSS_PROPERTIES_BY_CATEGORY[updates.category] ?? [];
          if (!validProps.includes(updated.cssProperty)) {
            updated.cssProperty = validProps[0] ?? '';
          }
        }
        return updated;
      }),
    );
  };

  const removeToken = (index: number) => {
    setTokens((prev) => prev.filter((_, i) => i !== index).map((t, i) => ({ ...t, sortOrder: i })));
  };

  const handleCreate = async () => {
    if (!guideName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/style-guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guideName.trim(),
          organizationId,
          isDefault,
          tokens: tokens.map((t) => ({
            ...t,
            name: toKebabCase(t.name || t.label),
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create style guide');
        return;
      }

      setShowCreateDialog(false);
      resetForm();
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedGuide || !guideName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/style-guides/${selectedGuide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guideName.trim(),
          isDefault,
          tokens: tokens.map((t) => ({
            ...t,
            name: toKebabCase(t.name || t.label),
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update style guide');
        return;
      }

      setShowEditDialog(false);
      resetForm();
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGuide) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/style-guides/${selectedGuide.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete style guide');
        return;
      }

      setShowDeleteDialog(false);
      resetForm();
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (guide: StyleGuideData) => {
    setSelectedGuide(guide);
    setGuideName(guide.name);
    setIsDefault(guide.isDefault);
    setTokens(
      guide.tokens.map((t) => ({
        name: t.name,
        label: t.label,
        category: t.category as TokenInput['category'],
        cssProperty: t.cssProperty,
        value: t.value,
        sortOrder: t.sortOrder,
      })),
    );
    setError(null);
    setShowEditDialog(true);
  };

  const tokensByCategory = (tokenList: Array<TokenInput & { id: string }>) => {
    const grouped: Record<string, number> = {};
    for (const t of tokenList) {
      grouped[t.category] = (grouped[t.category] ?? 0) + 1;
    }
    return grouped;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            Style Guides{organizationName ? ` — ${organizationName}` : ''}
          </CardTitle>
          <CardDescription>
            Design token collections for consistent report styling across templates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {styleGuides.length > 0 ? (
            <div className="divide-y rounded-md border">
              {styleGuides.map((guide) => {
                const counts = tokensByCategory(guide.tokens);
                return (
                  <div key={guide.id} className="flex items-center justify-between p-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{guide.name}</p>
                        {guide.isDefault && <Badge variant="secondary">Default</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {guide.tokens.length} token{guide.tokens.length !== 1 ? 's' : ''}
                        {Object.keys(counts).length > 0 && (
                          <span>
                            {' '}
                            ({Object.entries(counts)
                              .map(([cat, n]) => `${n} ${cat}`)
                              .join(', ')})
                          </span>
                        )}
                      </p>
                    </div>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => openEdit(guide)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setSelectedGuide(guide);
                            setError(null);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No style guides yet.</p>
          )}

          {canManage && (
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setShowCreateDialog(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Style Guide
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Create Style Guide Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-150 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Style Guide</DialogTitle>
            <DialogDescription>
              Create a design token collection for consistent styling across templates.
            </DialogDescription>
          </DialogHeader>
          <StyleGuideForm
            guideName={guideName}
            setGuideName={setGuideName}
            isDefault={isDefault}
            setIsDefault={setIsDefault}
            tokens={tokens}
            addToken={addToken}
            updateToken={updateToken}
            removeToken={removeToken}
            error={error}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving || !guideName.trim()}>
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Style Guide Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-150 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Style Guide</DialogTitle>
            <DialogDescription>
              Update the style guide name and tokens. Token changes replace all existing tokens.
            </DialogDescription>
          </DialogHeader>
          <StyleGuideForm
            guideName={guideName}
            setGuideName={setGuideName}
            isDefault={isDefault}
            setIsDefault={setIsDefault}
            tokens={tokens}
            addToken={addToken}
            updateToken={updateToken}
            removeToken={removeToken}
            error={error}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={saving || !guideName.trim()}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Style Guide Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle>Delete Style Guide</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedGuide?.name}&quot;? Templates using this
              guide will be disconnected. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="px-6 text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================================================
// Token Form (shared between Create and Edit dialogs)
// ============================================================================

function StyleGuideForm({
  guideName,
  setGuideName,
  isDefault,
  setIsDefault,
  tokens,
  addToken,
  updateToken,
  removeToken,
  error,
}: {
  guideName: string;
  setGuideName: (v: string) => void;
  isDefault: boolean;
  setIsDefault: (v: boolean) => void;
  tokens: TokenInput[];
  addToken: () => void;
  updateToken: (index: number, updates: Partial<TokenInput>) => void;
  removeToken: (index: number) => void;
  error: string | null;
}) {
  return (
    <div className="grid gap-4 py-4">
      {/* Name field */}
      <div className="grid gap-2">
        <Label htmlFor="guide-name">Name</Label>
        <Input
          id="guide-name"
          value={guideName}
          onChange={(e) => setGuideName(e.target.value)}
          placeholder="e.g. Brand Primary"
        />
      </div>

      {/* Default toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="guide-default"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="guide-default" className="text-sm font-normal">
          Set as default style guide for this organization
        </Label>
      </div>

      {/* Tokens */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Tokens</Label>
          <Button type="button" variant="outline" size="sm" onClick={addToken}>
            <Plus className="mr-1 h-3 w-3" />
            Add Token
          </Button>
        </div>

        {tokens.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No tokens yet. Add tokens to define reusable design values.
          </p>
        )}

        {tokens.map((token, index) => (
          <div key={index} className="rounded-md border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Token {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeToken(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1">
                <Label className="text-xs">Label</Label>
                <Input
                  value={token.label}
                  onChange={(e) => updateToken(index, { label: e.target.value })}
                  placeholder="e.g. Primary Blue"
                  className="h-8 text-sm"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Name (kebab-case)</Label>
                <Input
                  value={token.name}
                  onChange={(e) => updateToken(index, { name: e.target.value })}
                  placeholder={toKebabCase(token.label) || 'auto-generated'}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="grid gap-1">
                <Label className="text-xs">Category</Label>
                <Select
                  value={token.category}
                  onValueChange={(v) =>
                    updateToken(index, { category: v as TokenInput['category'] })
                  }
                >
                  <SelectTrigger className="h-8 text-sm w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">CSS Property</Label>
                <Select
                  value={token.cssProperty}
                  onValueChange={(v) => updateToken(index, { cssProperty: v })}
                >
                  <SelectTrigger className="h-8 text-sm w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(CSS_PROPERTIES_BY_CATEGORY[token.category] ?? []).map((prop) => (
                      <SelectItem key={prop} value={prop}>
                        {prop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Value</Label>
                <div className="flex gap-1">
                  <Input
                    value={token.value}
                    onChange={(e) => updateToken(index, { value: e.target.value })}
                    placeholder={token.category === 'color' ? '#3B82F6' : '16px'}
                    className="h-8 text-sm"
                  />
                  {(token.category === 'color' || token.category === 'background') && (
                    <input
                      type="color"
                      value={token.value || '#000000'}
                      onChange={(e) => updateToken(index, { value: e.target.value })}
                      className="h-8 w-8 shrink-0 cursor-pointer rounded border p-0.5"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
