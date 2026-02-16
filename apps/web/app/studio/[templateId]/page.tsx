'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Puck, createUsePuck, type Data } from '@puckeditor/core';
import '@puckeditor/core/puck.css';
import { puckConfig } from '@/lib/puck/config';
import { SampleDataPanel } from '@/components/studio/sample-data-panel';
import { PageNavigator, type PageItem } from '@/components/studio/page-navigator';
import { DEFAULT_SAMPLE_DATA } from '@/lib/templates/default-sample-data';
import { StudioHeader } from '@/components/studio/studio-header';
import { PageConfigPanel } from '@/components/studio/page-config-panel';
import {
  DEFAULT_PAGE_CONFIG,
  parseStoredPageConfig,
  type PageConfig,
} from '@/lib/types/page-config';
import { Toaster, toast } from 'sonner';

const usePuck = createUsePuck();

const EMPTY_DATA: Data = { content: [], root: {} };

type UserSession = {
  name?: string | null;
  email?: string | null;
  id?: string;
};

/**
 * Bridge component that extracts Puck's internal state (history and data)
 * and makes it available to the parent component. Must be rendered inside
 * Puck's component tree to access the usePuck hook.
 */
function PuckBridge({
  onHistoryChange,
  dataRef,
}: {
  onHistoryChange: (
    canUndo: boolean,
    canRedo: boolean,
    undo: () => void,
    redo: () => void,
  ) => void;
  dataRef: React.MutableRefObject<Data>;
}) {
  const appState = usePuck((s) => s.appState);
  const history = usePuck((s) => s.history);

  useEffect(() => {
    dataRef.current = appState.data;
  }, [appState.data, dataRef]);

  useEffect(() => {
    onHistoryChange(history.hasPast, history.hasFuture, history.back, history.forward);
  }, [history.hasPast, history.hasFuture, history.back, history.forward, onHistoryChange]);

  return null;
}

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

/**
 * Wrapper component that shows PageConfigPanel only when no component is selected.
 * Uses usePuck hook to detect selection state.
 */
function PageConfigPanelWrapper({
  config,
  onConfigChange,
}: {
  config: PageConfig;
  onConfigChange: (config: PageConfig) => void;
}) {
  const selectedItem = usePuck((s) => s.selectedItem);

  // Only show when no component is selected (i.e., viewing page-level settings)
  if (selectedItem) {
    return null;
  }

  return (
    <div className="border-t border-border mt-4 pt-4">
      <PageConfigPanel config={config} onConfigChange={onConfigChange} />
    </div>
  );
}

/**
 * Sanitize a string for use as a filename by removing characters
 * that are invalid on common operating systems.
 */
function sanitizeFilename(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, '_').trim() || 'report';
}

export default function StudioPage() {
  const params = useParams<{ templateId: string }>();
  const templateId = params.templateId;
  const [pages, setPages] = useState<PageItem[] | null>(null);
  const [activePageId, setActivePageId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [sampleData, setSampleData] = useState<Record<string, unknown>>(DEFAULT_SAMPLE_DATA);
  const [templateName, setTemplateName] = useState<string>('Untitled Template');
  const [user, setUser] = useState<UserSession | null>(null);
  const [pageConfig, setPageConfig] = useState<PageConfig>(DEFAULT_PAGE_CONFIG);
  
  // History state for undo/redo
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const undoRef = useRef<(() => void) | null>(null);
  const redoRef = useRef<(() => void) | null>(null);
  
  // Sample data panel state
  const [isSampleDataOpen, setIsSampleDataOpen] = useState(false);
  
  const sampleDataRef = useRef<Record<string, unknown>>(sampleData);
  const pagesRef = useRef<PageItem[]>([]);
  const pageConfigRef = useRef<PageConfig>(pageConfig);
  const puckDataRef = useRef<Data>(EMPTY_DATA);

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
          if (template.pageConfig) {
            const loadedConfig = parseStoredPageConfig(template.pageConfig);
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

  const handlePreview = useCallback(() => {
    window.open(`/studio/${templateId}/preview`, '_blank');
  }, [templateId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: globalThis.KeyboardEvent) => {
      // Ctrl+Shift+D — Sample Data
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsSampleDataOpen((prev) => !prev);
      }
      // Ctrl+Shift+P — Preview
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        handlePreview();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handlePreview]);

  // History callbacks
  const handleHistoryChange = useCallback(
    (canUndoVal: boolean, canRedoVal: boolean, undo: () => void, redo: () => void) => {
      setCanUndo(canUndoVal);
      setCanRedo(canRedoVal);
      undoRef.current = undo;
      redoRef.current = redo;
    },
    [],
  );

  const handleUndo = useCallback(() => undoRef.current?.(), []);
  const handleRedo = useCallback(() => redoRef.current?.(), []);

  const handleToggleSampleData = useCallback(() => {
    setIsSampleDataOpen((prev) => !prev);
  }, []);

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

  // Publish from header button using current Puck data
  const handlePublishFromHeader = useCallback(() => {
    handlePublish(puckDataRef.current);
  }, [handlePublish]);

  const handleDownloadPdf = useCallback(async () => {
    setIsDownloadingPdf(true);
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
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sanitizeFilename(templateName)}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        const result = await response.json();
        toast.error(result.error ?? 'Failed to render PDF');
      }
    } catch {
      toast.error('Failed to render PDF');
    } finally {
      setIsDownloadingPdf(false);
    }
  }, [templateId, templateName]);

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
      <Toaster position="top-right" richColors />
      <StudioHeader
        templateName={templateName}
        onTemplateNameChange={handleTemplateNameChange}
        user={displayUser}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onToggleSampleData={handleToggleSampleData}
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
        onPreview={handlePreview}
        onPublish={handlePublishFromHeader}
        isSaving={isSaving}
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
        <div className="flex-1 overflow-hidden relative">
          <Puck
            key={activePage.id}
            config={puckConfig}
            data={activePage.content}
            onPublish={handlePublish}
            overrides={{
              header: () => <></>,
              puck: ({ children }) => (
                <>
                  <PuckBridge onHistoryChange={handleHistoryChange} dataRef={puckDataRef} />
                  {children}
                </>
              ),
              fields: ({ children, isLoading }) => (
                <div className="flex flex-col flex-1 min-h-0 overflow-y-auto pb-20">
                  {children}
                  {!isLoading && (
                    <PageConfigPanelWrapper
                      config={pageConfig}
                      onConfigChange={handlePageConfigChange}
                    />
                  )}
                </div>
              ),
            }}
          />
          {/* Sample Data Panel as slide-over */}
          {isSampleDataOpen && (
            <div className="absolute right-0 top-0 z-50 h-full">
              <SampleDataPanel
                sampleData={sampleData}
                onSampleDataChange={handleSampleDataChange}
                isOpen={isSampleDataOpen}
                onToggle={handleToggleSampleData}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
