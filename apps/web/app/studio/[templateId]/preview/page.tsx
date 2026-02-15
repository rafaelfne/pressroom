'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Render, type Data } from '@puckeditor/core';
import { puckConfig } from '@/lib/puck/config';
import { resolveBindings } from '@/lib/binding';

export default function PreviewPage() {
  const params = useParams<{ templateId: string }>();
  const templateId = params.templateId;
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const response = await fetch(`/api/templates/${templateId}`);
        if (response.ok) {
          const template = await response.json();
          const templateData = template.templateData as Data;
          const sampleData =
            template.sampleData && typeof template.sampleData === 'object'
              ? (template.sampleData as Record<string, unknown>)
              : {};
          // Resolve bindings in the template using sample data
          const resolved = resolveBindings(templateData, sampleData) as Data;
          setData(resolved);
        } else {
          setError('Template not found');
        }
      } catch (err) {
        console.error('[Preview] Failed to load template:', err);
        setError('Failed to load template');
      }
    }
    loadTemplate();
  }, [templateId]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading preview...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8" data-testid="studio-preview">
      <Render config={puckConfig} data={data} />
    </div>
  );
}
