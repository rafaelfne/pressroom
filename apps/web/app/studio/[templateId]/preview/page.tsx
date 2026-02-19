'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Render, type Data } from '@puckeditor/core';
import { puckConfig } from '@/lib/puck/config';
import { resolveBindings } from '@/lib/binding';

interface ResolvedPage {
  id: string;
  name: string;
  content: Data;
}

/**
 * Parse template data into pages, supporting both single-page and multi-page formats.
 */
function parsePages(
  templateData: unknown,
  sampleData: Record<string, unknown>,
): ResolvedPage[] {
  if (!templateData || typeof templateData !== 'object') {
    return [];
  }

  const data = templateData as Record<string, unknown>;

  // Multi-page format: { pages: [{ id, name, content }] }
  if (Array.isArray(data.pages) && data.pages.length > 0) {
    return (data.pages as Array<Record<string, unknown>>).map((page, index) => ({
      id: (page.id as string) || `page-${index}`,
      name: (page.name as string) || `Page ${index + 1}`,
      content: resolveBindings(page.content as Data, sampleData) as Data,
    }));
  }

  // Single-page format: { content: [...], root: {...} }
  if (Array.isArray(data.content)) {
    return [
      {
        id: 'page-1',
        name: 'Page 1',
        content: resolveBindings(templateData as Data, sampleData) as Data,
      },
    ];
  }

  return [];
}

export default function PreviewPage() {
  const params = useParams<{ templateId: string }>();
  const templateId = params.templateId;
  const [pages, setPages] = useState<ResolvedPage[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const response = await fetch(`/api/templates/${templateId}`);
        if (response.ok) {
          const template = await response.json();
          const data =
            template.sampleData && typeof template.sampleData === 'object'
              ? (template.sampleData as Record<string, unknown>)
              : {};
          const resolvedPages = parsePages(template.templateData, data);
          setPages(resolvedPages);
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

  if (!pages) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading preview...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" data-testid="studio-preview">
      {pages.map((page, index) => (
        <div key={page.id}>
          <div className="p-8">
            <Render config={puckConfig} data={page.content} />
          </div>
          {index < pages.length - 1 && (
            <hr className="my-0 border-t-2 border-dashed border-gray-300" />
          )}
        </div>
      ))}
    </div>
  );
}
