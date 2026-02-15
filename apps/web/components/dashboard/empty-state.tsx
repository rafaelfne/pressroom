import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createTemplate } from '@/lib/templates/actions';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileText className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No templates yet</h3>
      <p className="mb-6 mt-2 text-sm text-muted-foreground">
        Create your first template to get started
      </p>
      <form action={createTemplate}>
        <input type="hidden" name="name" value="Untitled Template" />
        <Button type="submit">
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </form>
    </div>
  );
}
