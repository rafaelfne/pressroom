'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Puck, type Data } from '@puckeditor/core';
import '@puckeditor/core/puck.css';
import { puckConfig } from '@/lib/puck/config';
import { Button } from '@/components/ui/button';
import { SampleDataPanel } from '@/components/studio/sample-data-panel';
import { DEFAULT_SAMPLE_DATA } from '@/lib/templates/default-sample-data';

const EMPTY_DATA: Data = { content: [], root: {} };

export default function StudioPage() {
  const params = useParams<{ templateId: string }>();
  const templateId = params.templateId;
  const [initialData, setInitialData] = useState<Data | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sampleData, setSampleData] = useState<Record<string, unknown>>(DEFAULT_SAMPLE_DATA);
  const sampleDataRef = useRef<Record<string, unknown>>(sampleData);

  useEffect(() => {
    sampleDataRef.current = sampleData;
  }, [sampleData]);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const response = await fetch(`/api/templates/${templateId}`);
        if (response.ok) {
          const template = await response.json();
          const templateData = template.templateData as Data;
          setInitialData(templateData && templateData.content ? templateData : EMPTY_DATA);
          if (template.sampleData && typeof template.sampleData === 'object') {
            const loaded = template.sampleData as Record<string, unknown>;
            setSampleData(loaded);
            sampleDataRef.current = loaded;
          }
        } else {
          setInitialData(EMPTY_DATA);
        }
      } catch {
        setInitialData(EMPTY_DATA);
      }
    }
    loadTemplate();
  }, [templateId]);

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (saveError) {
      const timeout = setTimeout(() => {
        setSaveError(null);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [saveError]);

  const handlePublish = useCallback(
    async (data: Data) => {
      setIsSaving(true);
      setSaveError(null);
      try {
        const response = await fetch(`/api/templates/${templateId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateData: data,
            sampleData: sampleDataRef.current,
          }),
        });
        if (!response.ok) {
          const result = await response.json();
          setSaveError(result.error ?? 'Failed to save template');
        }
      } catch {
        setSaveError('Failed to save template');
      } finally {
        setIsSaving(false);
      }
    },
    [templateId],
  );

  const handlePreview = useCallback(() => {
    window.open(`/studio/${templateId}/preview`, '_blank');
  }, [templateId]);

  const handlePreviewPdf = useCallback(async () => {
    try {
      const response = await fetch('/api/reports/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          data: sampleDataRef.current,
          format: 'pdf',
        }),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        const result = await response.json();
        setSaveError(result.error ?? 'Failed to render PDF');
      }
    } catch {
      setSaveError('Failed to render PDF');
    }
  }, [templateId]);

  const dismissError = useCallback(() => {
    setSaveError(null);
  }, []);

  const handleSampleDataChange = useCallback((data: Record<string, unknown>) => {
    setSampleData(data);
  }, []);

  if (!initialData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading studio...</p>
      </div>
    );
  }

  return (
    <div className="h-screen" data-testid="studio-editor">
      <Puck
        config={puckConfig}
        data={initialData}
        onPublish={handlePublish}
        overrides={{
          headerActions: ({ children }) => (
            <>
              {saveError && (
                <div className="flex items-center gap-2 mr-2" role="alert">
                  <span className="text-sm text-destructive">{saveError}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={dismissError}
                    className="h-6 px-2"
                  >
                    ×
                  </Button>
                </div>
              )}
              {isSaving && (
                <span className="text-sm text-muted-foreground mr-2">Saving...</span>
              )}
              <SampleDataPanel
                sampleData={sampleData}
                onSampleDataChange={handleSampleDataChange}
              />
              <Button variant="outline" size="sm" onClick={handlePreviewPdf}>
                Preview PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handlePreview}>
                Preview
              </Button>
              {children}
            </>
          ),
        }}
      />
    </div>
  );
}
