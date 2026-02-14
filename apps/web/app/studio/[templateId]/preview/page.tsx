'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Render, type Data } from '@puckeditor/core';
import { puckConfig } from '@/lib/puck/config';

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
          setData(template.content as Data);
        } else {
          setError('Template not found');
        }
      } catch {
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
