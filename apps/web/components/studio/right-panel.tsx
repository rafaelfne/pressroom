'use client';

import * as React from 'react';
import { type createUsePuck } from '@puckeditor/core';
import type { PageConfig } from '@/lib/types/page-config';
import type { HeaderFooterConfig } from '@/lib/types/header-footer-config';
import { PageSettingsPanel } from './page-settings-panel';
import { BlockFieldsPanel } from './block-fields-panel';

export interface RightPanelProps {
  usePuck: ReturnType<typeof createUsePuck>;
  config: PageConfig;
  onConfigChange: (config: PageConfig) => void;
  pageTitle: string;
  onPageTitleChange: (title: string) => void;
  headerFooterConfig: HeaderFooterConfig;
  onHeaderFooterConfigChange: (config: HeaderFooterConfig) => void;
  children?: React.ReactNode;
  isLoading?: boolean;
}

/**
 * Context-aware right panel that switches between page settings and block fields
 * based on the selected item in the Puck editor.
 */
export function RightPanel({
  usePuck,
  config,
  onConfigChange,
  pageTitle,
  onPageTitleChange,
  headerFooterConfig,
  onHeaderFooterConfigChange,
  children,
  isLoading = false,
}: RightPanelProps) {
  const selectedItem = usePuck((s) => s.selectedItem);

  const [mode, setMode] = React.useState<'page' | 'block'>('page');
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Detect mode change and trigger transition
  React.useEffect(() => {
    const newMode = selectedItem ? 'block' : 'page';
    if (newMode !== mode) {
      setIsTransitioning(true);
      setMode(newMode);
      const timer = setTimeout(() => setIsTransitioning(false), 150);
      return () => clearTimeout(timer);
    }
  }, [selectedItem, mode]);

  if (isLoading) {
    return null;
  }

  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-y-auto pb-20"
      data-testid="right-panel"
    >
      {mode === 'page' ? (
        <div
          className={`transition-opacity duration-150 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          data-testid="page-settings-view"
        >
          <PageSettingsPanel
            config={config}
            onConfigChange={onConfigChange}
            pageTitle={pageTitle}
            onPageTitleChange={onPageTitleChange}
            headerFooterConfig={headerFooterConfig}
            onHeaderFooterConfigChange={onHeaderFooterConfigChange}
          />
        </div>
      ) : (
        <div
          className={`transition-opacity duration-150 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          data-testid="block-fields-view"
        >
          <BlockFieldsPanel
            usePuck={usePuck}
            componentType={selectedItem?.type ?? ''}
            componentProps={selectedItem?.props ?? {}}
          >
            {children}
          </BlockFieldsPanel>
        </div>
      )}
    </div>
  );
}
