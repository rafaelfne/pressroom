'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Puck, type Data } from '@puckeditor/core';
import '@puckeditor/core/puck.css';
import { puckConfig } from '@/lib/puck/config';
import { Button } from '@/components/ui/button';
import { SampleDataPanel } from '@/components/studio/sample-data-panel';
import { PageNavigator, type PageItem } from '@/components/studio/page-navigator';
import { DEFAULT_SAMPLE_DATA } from '@/lib/templates/default-sample-data';
import { StudioHeader } from '@/components/studio/studio-header';
import { PageConfigDialog } from '@/components/studio/page-config-dialog';
import { DEFAULT_PAGE_CONFIG, type PageConfig } from '@/lib/types/page-config';

const EMPTY_DATA: Data = { content: [], root: {} };

type UserSession = {
  name?: string | null;
  email?: string | null;
  id?: string;
};

let pageIdCounter = 0;
function generatePageId(): string {
  pageIdCounter++;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `page-${crypto.randomUUID()}`;
  }
  return `page-${Date.now()}-${pageIdCounter}`;
}

function createDefaultPage(name: string): PageItem {
  return {
    id: generatePageId(),
    name,
    content: { ...EMPTY_DATA },
  };
}

/**
 * Detect if stored templateData uses multi-page format.
 * Multi-page format: { pages: [{ id, name, content }] }
 * Single-page format: { content: [...], root: {...} }
 */
function parseTemplateData(templateData: unknown): PageItem[] {
  if (!templateData || typeof templateData !== 'object') {
    return [createDefaultPage('Page 1')];
  }

  const data = templateData as Record<string, unknown>;

  // Multi-page format
  if (Array.isArray(data.pages) && data.pages.length > 0) {
    return (data.pages as Array<Record<string, unknown>>).map((page, index) => ({
      id: (page.id as string) || generatePageId(),
      name: (page.name as string) || `Page ${index + 1}`,
      content: (page.content as Data) || { ...EMPTY_DATA },
    }));
  }

  // Single-page format (backward compatible)
  if (Array.isArray(data.content)) {
    return [
      {
        id: generatePageId(),
        name: 'Page 1',
        content: templateData as Data,
      },
    ];
  }

  return [createDefaultPage('Page 1')];
}

export default function StudioPage() {
  const params = useParams<{ templateId: string }>();
  const templateId = params.templateId;
  const [pages, setPages] = useState<PageItem[] | null>(null);
  const [activePageId, setActivePageId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sampleData, setSampleData] = useState<Record<string, unknown>>(DEFAULT_SAMPLE_DATA);
  const [templateName, setTemplateName] = useState<string>('Untitled Template');
  const [user, setUser] = useState<UserSession | null>(null);
  const [pageConfig, setPageConfig] = useState<PageConfig>(DEFAULT_PAGE_CONFIG);
  const [pageConfigOpen, setPageConfigOpen] = useState(false);
  const sampleDataRef = useRef<Record<string, unknown>>(sampleData);
  const pagesRef = useRef<PageItem[]>([]);
  const pageConfigRef = useRef<PageConfig>(pageConfig);

  useEffect(() => {
    pageConfigRef.current = pageConfig;
  }, [pageConfig]);

  useEffect(() => {
    sampleDataRef.current = sampleData;
  }, [sampleData]);

  useEffect(() => {
    if (pages) {
      pagesRef.current = pages;
    }
  }, [pages]);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const response = await fetch(`/api/templates/${templateId}`);
        if (response.ok) {
          const template = await response.json();
          const loadedPages = parseTemplateData(template.templateData);
          setPages(loadedPages);
          setActivePageId(loadedPages[0].id);
          if (template.name) {
            setTemplateName(template.name);
          }
          if (template.sampleData && typeof template.sampleData === 'object') {
            const loaded = template.sampleData as Record<string, unknown>;
            setSampleData(loaded);
            sampleDataRef.current = loaded;
          }
          if (template.pageConfig && typeof template.pageConfig === 'object') {
            const loadedConfig = {
              ...DEFAULT_PAGE_CONFIG,
              ...(template.pageConfig as Record<string, unknown>),
              margins: {
                ...DEFAULT_PAGE_CONFIG.margins,
                ...((template.pageConfig as Record<string, unknown>).margins as Record<string, number> | undefined),
              },
            } as PageConfig;
            setPageConfig(loadedConfig);
            pageConfigRef.current = loadedConfig;
          }
        } else {
          const defaultPages = [createDefaultPage('Page 1')];
          setPages(defaultPages);
          setActivePageId(defaultPages[0].id);
        }
      } catch {
        const defaultPages = [createDefaultPage('Page 1')];
        setPages(defaultPages);
        setActivePageId(defaultPages[0].id);
      }
    }

    async function loadUser() {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const session = await response.json();
          if (session?.user) {
            setUser({
              name: session.user.name,
              email: session.user.email,
              id: session.user.id,
            });
          }
        }
      } catch (error) {
        console.error('[Studio] Failed to load user session:', error);
      }
    }

    loadTemplate();
    loadUser();
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

  // Save the current page's content when Puck publishes
  const handlePublish = useCallback(
    async (data: Data) => {
      // Update the active page's content in pages state
      const updatedPages = pagesRef.current.map((page) =>
        page.id === activePageId ? { ...page, content: data } : page,
      );
      setPages(updatedPages);
      pagesRef.current = updatedPages;

      setIsSaving(true);
      setSaveError(null);
      try {
        // Save as multi-page format
        const pagesPayload = updatedPages.map((p) => ({
          id: p.id,
          name: p.name,
          content: p.content,
        }));

        const response = await fetch(`/api/templates/${templateId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pages: pagesPayload,
            sampleData: sampleDataRef.current,
            pageConfig: pageConfigRef.current,
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
    [templateId, activePageId],
  );

  const handlePreview = useCallback(() => {
    window.open(`/studio/${templateId}/preview`, '_blank');
  }, [templateId]);

  const handlePreviewPdf = useCallback(async () => {
    try {
      const { pageConfigToRenderOptions } = await import('@/lib/types/page-config');
      const response = await fetch('/api/reports/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          data: sampleDataRef.current,
          format: 'pdf',
          pageConfig: pageConfigToRenderOptions(pageConfigRef.current),
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

  const handlePageConfigChange = useCallback((config: PageConfig) => {
    setPageConfig(config);
    pageConfigRef.current = config;
  }, []);

  const handleTemplateNameChange = useCallback(
    async (newName: string) => {
      const previousName = templateName;
      setTemplateName(newName);
      try {
        const response = await fetch(`/api/templates/${templateId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName }),
        });
        if (!response.ok) {
          setTemplateName(previousName);
          setSaveError('Failed to rename template');
        }
      } catch {
        setTemplateName(previousName);
        setSaveError('Failed to rename template');
      }
    },
    [templateId, templateName],
  );

  // Page management callbacks
  const handleSelectPage = useCallback(
    (pageId: string) => {
      if (pageId !== activePageId) {
        setActivePageId(pageId);
      }
    },
    [activePageId],
  );

  const handleAddPage = useCallback(() => {
    const newPage = createDefaultPage(`Page ${pagesRef.current.length + 1}`);
    const updated = [...pagesRef.current, newPage];
    setPages(updated);
    pagesRef.current = updated;
    setActivePageId(newPage.id);
  }, []);

  const handleDeletePage = useCallback(
    (pageId: string) => {
      if (pagesRef.current.length <= 1) return;
      const idx = pagesRef.current.findIndex((p) => p.id === pageId);
      const updated = pagesRef.current.filter((p) => p.id !== pageId);
      setPages(updated);
      pagesRef.current = updated;
      if (activePageId === pageId) {
        const newIdx = Math.min(idx, updated.length - 1);
        setActivePageId(updated[newIdx].id);
      }
    },
    [activePageId],
  );

  const handleDuplicatePage = useCallback((pageId: string) => {
    const source = pagesRef.current.find((p) => p.id === pageId);
    if (!source) return;
    const idx = pagesRef.current.findIndex((p) => p.id === pageId);
    const duplicate: PageItem = {
      id: generatePageId(),
      name: `${source.name} (Copy)`,
      content: JSON.parse(JSON.stringify(source.content)) as Data,
    };
    const updated = [...pagesRef.current];
    updated.splice(idx + 1, 0, duplicate);
    setPages(updated);
    pagesRef.current = updated;
    setActivePageId(duplicate.id);
  }, []);

  const handleRenamePage = useCallback((pageId: string, newName: string) => {
    const updated = pagesRef.current.map((p) =>
      p.id === pageId ? { ...p, name: newName } : p,
    );
    setPages(updated);
    pagesRef.current = updated;
  }, []);

  const handleReorderPage = useCallback((pageId: string, direction: 'up' | 'down') => {
    const idx = pagesRef.current.findIndex((p) => p.id === pageId);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= pagesRef.current.length) return;
    const updated = [...pagesRef.current];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setPages(updated);
    pagesRef.current = updated;
  }, []);

  if (!pages) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading studio...</p>
      </div>
    );
  }

  const activePage = pages.find((p) => p.id === activePageId) ?? pages[0];
  const displayUser = user || { name: 'User', email: null, id: 'loading' };

  return (
    <div className="flex h-screen flex-col" data-testid="studio-editor">
      <StudioHeader
        templateName={templateName}
        onTemplateNameChange={handleTemplateNameChange}
        user={displayUser}
      />
      <div className="flex flex-1 overflow-hidden">
        <PageNavigator
          pages={pages}
          activePageId={activePage.id}
          onSelectPage={handleSelectPage}
          onAddPage={handleAddPage}
          onDeletePage={handleDeletePage}
          onDuplicatePage={handleDuplicatePage}
          onRenamePage={handleRenamePage}
          onReorderPage={handleReorderPage}
        />
        <div className="flex-1 overflow-hidden">
          <Puck
            key={activePage.id}
            config={puckConfig}
            data={activePage.content}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageConfigOpen(true)}
                    data-testid="page-settings-button"
                  >
                    ⚙ Page Settings
                  </Button>
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
      </div>
      <PageConfigDialog
        open={pageConfigOpen}
        onOpenChange={setPageConfigOpen}
        config={pageConfig}
        onConfigChange={handlePageConfigChange}
      />
    </div>
  );
}
