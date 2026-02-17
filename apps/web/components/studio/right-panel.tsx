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
}

/**
 * Context-aware right panel that shows block fields when a component is selected,
 * or page settings when no component is selected.
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
}: RightPanelProps) {
  const selectedItem = usePuck((s) => s.selectedItem);

  // Show block fields panel when a component is selected
  // Puck passes children (the fields) to this override
  const showBlockFields = selectedItem !== null;

  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-y-auto pb-20"
      data-testid="right-panel"
    >
      {showBlockFields ? (
        <div data-testid="block-fields-view">
          <BlockFieldsPanel
            usePuck={usePuck}
            componentType={selectedItem?.type ?? ''}
            componentProps={selectedItem?.props ?? {}}
          >
            {children}
          </BlockFieldsPanel>
        </div>
      ) : (
        <div data-testid="page-settings-view">
          <PageSettingsPanel
            config={config}
            onConfigChange={onConfigChange}
            pageTitle={pageTitle}
            onPageTitleChange={onPageTitleChange}
            headerFooterConfig={headerFooterConfig}
            onHeaderFooterConfigChange={onHeaderFooterConfigChange}
          />
        </div>
      )}
    </div>
  );
}
