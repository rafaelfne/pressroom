import { TemplateCard } from './template-card';

type TemplateWithOrg = {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  updatedAt: Date;
  templateData: unknown;
  ownerId?: string | null;
  organization?: { id: string; name: string } | null;
};

type TemplateGridProps = {
  templates: Array<TemplateWithOrg>;
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

export function TemplateGrid({ templates }: TemplateGridProps) {
  const hasOrgs = templates.some((t) => t.organization);

  if (!hasOrgs) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    );
  }

  const { groups, ungrouped } = groupByOrganization(templates);

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([orgId, group]) => (
        <div key={orgId}>
          <h2 className="mb-4 text-lg font-semibold">{group.orgName}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {group.templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      ))}
      {ungrouped.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-muted-foreground">Unassigned</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ungrouped.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
