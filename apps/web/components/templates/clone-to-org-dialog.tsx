'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type Organization = {
  id: string;
  name: string;
};

type CloneToOrgDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateName: string;
  organizations: Organization[];
  onClone: (organizationId: string | null) => Promise<void>;
};

export function CloneToOrgDialog({
  open,
  onOpenChange,
  templateName,
  organizations,
  onClone,
}: CloneToOrgDialogProps) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('none');
  const [cloning, setCloning] = useState(false);

  const handleClone = async () => {
    setCloning(true);
    try {
      await onClone(selectedOrgId === 'none' ? null : selectedOrgId);
      onOpenChange(false);
    } finally {
      setCloning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Clone to Organization</DialogTitle>
          <DialogDescription>
            Clone &ldquo;{templateName}&rdquo; to another organization.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label className="mb-3 block">Select destination:</Label>
          <RadioGroup value={selectedOrgId} onValueChange={setSelectedOrgId}>
            {organizations.map((org) => (
              <div key={org.id} className="flex items-center space-x-2">
                <RadioGroupItem value={org.id} id={`org-${org.id}`} />
                <Label htmlFor={`org-${org.id}`} className="font-normal">
                  {org.name}
                </Label>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="org-none" />
              <Label htmlFor="org-none" className="font-normal">
                None (Unassigned)
              </Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleClone} disabled={cloning}>
            {cloning ? 'Cloning...' : 'Clone'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
