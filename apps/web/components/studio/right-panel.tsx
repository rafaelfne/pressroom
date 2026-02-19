'use client';

import * as React from 'react';
import { type createUsePuck } from '@puckeditor/core';
import type { PageConfig } from '@/lib/types/page-config';
import { PageSettingsPanel } from './page-settings-panel';
import { BlockFieldsPanel } from './block-fields-panel';
import { MultiSelectSummary } from './multi-select-summary';

export interface RightPanelProps {
  usePuck: ReturnType<typeof createUsePuck>;
  config: PageConfig;
  onConfigChange: (config: PageConfig) => void;
  pageTitle: string;
  onPageTitleChange: (title: string) => void;
  /** Number of multi-selected component IDs (0 = not active) */
  multiSelectCount?: number;
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
  multiSelectCount = 0,
  children,
}: RightPanelProps) {
  const selectedItem = usePuck((s) => s.selectedItem);

  // Multi-select takes priority over single item selection
  const showMultiSelect = multiSelectCount > 1;
  // Show block fields panel when a single component is selected (and not multi-selecting)
  const showBlockFields = !showMultiSelect && selectedItem !== null;

  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-y-auto pb-20"
      data-testid="right-panel"
    >
      {showMultiSelect ? (
        <div data-testid="multi-select-view">
          <MultiSelectSummary count={multiSelectCount} />
        </div>
      ) : showBlockFields ? (
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
          />
        </div>
      )}
    </div>
  );
}
