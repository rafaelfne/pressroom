import { TemplateCard } from './template-card';

type TemplateGridProps = {
  templates: Array<{
    id: string;
    name: string;
    description: string | null;
    tags: string[];
    updatedAt: Date;
    templateData: unknown;
  }>;
};

export function TemplateGrid({ templates }: TemplateGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
