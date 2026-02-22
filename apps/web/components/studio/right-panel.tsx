'use client';

import * as React from 'react';
import { type createUsePuck } from '@puckeditor/core';
import type { PageConfig } from '@/lib/types/page-config';
import { PageSettingsPanel } from './page-settings-panel';
import { BlockFieldsPanel } from './block-fields-panel';
import { useMultiSelect } from '@/hooks/use-multi-select';

export interface RightPanelProps {
  usePuck: ReturnType<typeof createUsePuck>;
  config: PageConfig;
  onConfigChange: (config: PageConfig) => void;
  pageTitle: string;
  onPageTitleChange: (title: string) => void;
  children?: React.ReactNode;
}

/**
 * Context-aware right panel that shows block fields when a component is selected,
 * "N components selected" when multi-selection is active,
 * or page settings when no component is selected.
 */
export function RightPanel({
  usePuck,
  config,
  onConfigChange,
  pageTitle,
  onPageTitleChange,
  children,
}: RightPanelProps) {
  const selectedItem = usePuck((s) => s.selectedItem);
  const { selectedCount, isMultiSelected } = useMultiSelect();

  // Show block fields panel when exactly one component is selected via Puck
  const showBlockFields = selectedItem !== null && !isMultiSelected;

  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-y-auto pb-20"
      data-testid="right-panel"
    >
      {isMultiSelected ? (
        <div
          className="flex flex-col items-center justify-center gap-2 p-6 text-center"
          data-testid="multi-select-view"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <span className="text-lg font-semibold text-primary">{selectedCount}</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {selectedCount} components selected
          </p>
          <p className="text-xs text-muted-foreground">
            Use Ctrl+C to copy, Delete to remove, or Ctrl+D to duplicate
          </p>
        </div>
      ) : showBlockFields ? (
        <div data-testid="block-fields-view">
          <BlockFieldsPanel
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
