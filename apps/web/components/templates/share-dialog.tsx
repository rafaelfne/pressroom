'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type SharedUser = {
  id: string;
  user: {
    id: string;
    name: string | null;
    username: string;
  };
  grantedAt: string;
};

type Owner = {
  id: string;
  name: string | null;
  username: string;
};

type ShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  templateName: string;
};

function getInitials(name: string | null, username: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return username.slice(0, 2).toUpperCase();
}

export function ShareDialog({ open, onOpenChange, templateId, templateName }: ShareDialogProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [accesses, setAccesses] = useState<SharedUser[]>([]);
  const [isLoadingAccesses, setIsLoadingAccesses] = useState(false);

  const loadAccesses = useCallback(async () => {
    setIsLoadingAccesses(true);
    try {
      const response = await fetch(`/api/templates/${templateId}/share`);
      if (response.ok) {
        const data = await response.json();
        setOwner(data.owner);
        setAccesses(data.accesses);
      }
    } catch (err) {
      console.error('[ShareDialog] Failed to load accesses:', err);
    } finally {
      setIsLoadingAccesses(false);
    }
  }, [templateId]);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      loadAccesses();
    } else {
      setUsername('');
      setError('');
    }
    onOpenChange(newOpen);
  };

  const handleShare = async () => {
    if (!username.trim()) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/templates/${templateId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to share template');
        setIsLoading(false);
        return;
      }

      setUsername('');
      await loadAccesses();
    } catch (err) {
      console.error('[ShareDialog] Share error:', err);
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (userId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/share/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadAccesses();
      }
    } catch (err) {
      console.error('[ShareDialog] Revoke error:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Template</DialogTitle>
          <DialogDescription>
            Share &ldquo;{templateName}&rdquo; with other users by entering their username.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Share input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleShare();
                }
              }}
            />
            <Button onClick={handleShare} disabled={isLoading || !username.trim()} size="sm">
              {isLoading ? 'Adding...' : 'Add'}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* People with access */}
          <div className="space-y-2">
            <p className="text-sm font-medium">People with access:</p>
            {isLoadingAccesses ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {/* Owner */}
                {owner && (
                  <div className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {getInitials(owner.name, owner.username)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{owner.name || owner.username}</p>
                        <p className="text-xs text-muted-foreground">@{owner.username}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">owner</span>
                  </div>
                )}

                {/* Shared users */}
                {accesses.map((access) => (
                  <div key={access.id} className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {getInitials(access.user.name, access.user.username)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{access.user.name || access.user.username}</p>
                        <p className="text-xs text-muted-foreground">@{access.user.username}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={() => handleRevoke(access.user.id)}
                    >
                      ✕ remove
                    </Button>
                  </div>
                ))}

                {!owner && accesses.length === 0 && (
                  <p className="text-sm text-muted-foreground">No one has access yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
