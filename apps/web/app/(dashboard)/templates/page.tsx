import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTemplates, createTemplate } from '@/lib/templates/actions';
import { TemplateGrid } from '@/components/dashboard/template-grid';
import { EmptyState } from '@/components/dashboard/empty-state';
import { TemplateSearch } from '@/components/dashboard/template-search';
import { getUserTeam } from '@/lib/team';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type SearchParams = {
  search?: string;
  tags?: string;
  page?: string;
  sortBy?: string;
  sortOrder?: string;
};

export default async function TemplatesPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;

  // Normalize search params
  const params: SearchParams = {
    search:
      typeof searchParams.search === 'string' ? searchParams.search : undefined,
    tags: typeof searchParams.tags === 'string' ? searchParams.tags : undefined,
    page: typeof searchParams.page === 'string' ? searchParams.page : undefined,
    sortBy:
      typeof searchParams.sortBy === 'string' ? searchParams.sortBy : undefined,
    sortOrder:
      typeof searchParams.sortOrder === 'string'
        ? searchParams.sortOrder
        : undefined,
  };

  const { templates, totalCount } = await getTemplates({
    search: params.search,
    tags: params.tags,
    page: params.page ? parseInt(params.page, 10) || 1 : 1,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  // Fetch organizations for the user's team
  const session = await auth();
  let organizations: Array<{ id: string; name: string }> = [];
  
  if (session?.user?.id) {
    const team = await getUserTeam(session.user.id);
    if (team) {
      organizations = await prisma.organization.findMany({
        where: { teamId: team.id },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
    }
  }

  const hasTemplates = totalCount > 0;
  const hasSearchOrFilters = Boolean(params.search || params.tags);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Manage your report templates
          </p>
        </div>
        <form action={createTemplate}>
          <input type="hidden" name="name" value="Untitled Template" />
          <Button type="submit">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </form>
      </div>

      {/* Search and Filters */}
      {hasTemplates && <TemplateSearch />}

      {/* Content */}
      {!hasTemplates && !hasSearchOrFilters ? (
        <EmptyState />
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No templates found matching your search.
          </p>
        </div>
      ) : (
        <TemplateGrid templates={templates} organizations={organizations} />
      )}
    </div>
  );
}
