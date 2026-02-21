'use client';

import { useRouter } from 'next/navigation';
import { TemplateCard } from './template-card';

type Organization = {
  id: string;
  name: string;
};

type TemplateWithOrg = {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  updatedAt: Date;
  templateData: unknown;
  ownerId?: string | null;
  organization?: Organization | null;
};

type TemplateGridProps = {
  templates: Array<TemplateWithOrg>;
  organizations?: Organization[];
};

function groupByOrganization(templates: TemplateWithOrg[]) {
  const groups: Record<string, { orgName: string; templates: TemplateWithOrg[] }> = {};
  const ungrouped: TemplateWithOrg[] = [];

  for (const template of templates) {
    if (template.organization) {
      const orgId = template.organization.id;
      if (!groups[orgId]) {
        groups[orgId] = { orgName: template.organization.name, templates: [] };
      }
      groups[orgId].templates.push(template);
    } else {
      ungrouped.push(template);
    }
  }

  return { groups, ungrouped };
}

export function TemplateGrid({ templates, organizations = [] }: TemplateGridProps) {
  const router = useRouter();
  const hasOrgs = templates.some((t) => t.organization);

  const handleTemplateUpdated = () => {
    router.refresh();
  };

  if (!hasOrgs) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            organizations={organizations}
            onTemplateUpdated={handleTemplateUpdated}
          />
        ))}
      </div>
    );
  }

  const { groups, ungrouped } = groupByOrganization(templates);

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([orgId, group]) => (
        <div key={orgId}>
          <h2 className="mb-4 text-lg font-semibold">
            {group.orgName}{' '}
            <span className="text-sm font-normal text-muted-foreground">
              ({group.templates.length})
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {group.templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                organizations={organizations}
                onTemplateUpdated={handleTemplateUpdated}
              />
            ))}
          </div>
        </div>
      ))}
      {ungrouped.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-muted-foreground">
            Unassigned{' '}
            <span className="text-sm font-normal">({ungrouped.length})</span>
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ungrouped.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                organizations={organizations}
                onTemplateUpdated={handleTemplateUpdated}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
