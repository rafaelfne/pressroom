'use client';

import { useEffect, useRef } from 'react';
import type { Data } from '@puckeditor/core';
import { useMultiSelect } from '@/hooks/use-multi-select';
import {
  collectAllIds,
  collectAllIdsDeep,
  extractComponents,
  pasteComponents,
  duplicateComponents,
  removeComponents,
  type PressroomClipboard,
} from '@/lib/studio/multi-select-operations';

/** Threshold for showing delete confirmation dialog */
const DELETE_CONFIRMATION_THRESHOLD = 5;

interface UseKeyboardShortcutsOptions {
  /** Get the current Puck data - called when shortcuts need to read it */
  getData: () => Data;
  /** Apply modified data back via Puck dispatch({ type: 'set' }) */
  setData: (data: Data) => void;
  /** Template ID for clipboard source metadata */
  templateId: string;
  /** Active page ID for clipboard source metadata */
  activePageId: string;
  /** Active page name for clipboard source metadata */
  activePageName: string;
  /** Callback to show toast messages */
  onToast?: (message: string) => void;
  /** Set of valid component types in the current config (for cross-template paste validation) */
  validComponentTypes?: Set<string>;
  /** Whether the shortcut system is enabled (e.g., false during inline editing) */
  enabled?: boolean;
}

/**
 * Helper to check if the currently focused element is an input field
 */
function isEditableElement(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea') return true;
  if (el instanceof HTMLElement && el.isContentEditable) return true;
  return false;
}

/**
 * Type guard to validate PressroomClipboard structure
 */
function isPressroomClipboard(data: unknown): data is PressroomClipboard {
  if (typeof data !== 'object' || data === null) return false;
  
  const obj = data as Record<string, unknown>;
  
  if (obj.version !== 1) return false;
  if (!Array.isArray(obj.components)) return false;
  if (typeof obj.source !== 'object' || obj.source === null) return false;
  
  const source = obj.source as Record<string, unknown>;
  if (typeof source.templateId !== 'string') return false;
  if (typeof source.pageId !== 'string') return false;
  
  return true;
}

/**
 * Manages keyboard shortcuts for the multi-selection system.
 * Detects when focus is on an input, textarea, or contentEditable element
 * and disables all multi-select shortcuts in that case (except Escape).
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions): void {
  const { enabled = true } = options;

  const { state, dispatch } = useMultiSelect();

  // Use refs to avoid stale closures
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      const anyModKey = e.ctrlKey || e.metaKey;

      // Check if we're in an editable element
      const inEditableElement = isEditableElement();

      // Allow Escape even in editable elements
      if (e.key === 'Escape') {
        dispatch({ type: 'CLEAR_SELECTION' });
        dispatch({ type: 'CANCEL_MARQUEE' });
        return;
      }

      // Block all other shortcuts when in editable elements
      if (inEditableElement) return;

      const currentState = stateRef.current;
      const currentOptions = optionsRef.current;
      const hasSelection = currentState.selectedIds.size > 0;

      // Ctrl+A / Cmd+A - Select All
      if (anyModKey && e.key === 'a') {
        e.preventDefault();
        const data = currentOptions.getData();
        const rootIds = collectAllIds(data);
        
        // Check if we already have all root IDs selected (2-pass pattern)
        const allRootSelected = rootIds.length > 0 && 
          rootIds.every(id => currentState.selectedIds.has(id));
        
        if (allRootSelected) {
          // Second pass: select ALL nested components
          const allIds = collectAllIdsDeep(data);
          dispatch({ type: 'SELECT_ALL', allIds });
        } else {
          // First pass: select root-level components only
          dispatch({ type: 'SELECT_ALL', allIds: rootIds });
        }
        return;
      }

      // Ctrl+C / Cmd+C - Copy
      if (anyModKey && e.key === 'c' && hasSelection) {
        e.preventDefault();
        const data = currentOptions.getData();
        const selectedIds = currentState.selectedIds;
        const components = extractComponents(data, selectedIds);

        const clipboard: PressroomClipboard = {
          version: 1,
          source: {
            templateId: currentOptions.templateId,
            pageId: currentOptions.activePageId,
            pageName: currentOptions.activePageName,
          },
          components,
          copiedAt: new Date().toISOString(),
        };

        // Store in context
        dispatch({ type: 'SET_CLIPBOARD', clipboard });

        // Try to write to system clipboard
        try {
          const clipboardText = JSON.stringify(clipboard);
          navigator.clipboard.writeText(clipboardText).catch(() => {
            // Silently fail if clipboard access denied
          });
        } catch {
          // Silently fail if clipboard API not available
        }

        currentOptions.onToast?.(
          `${components.length} component${components.length === 1 ? '' : 's'} copied`
        );
        return;
      }

      // Ctrl+X / Cmd+X - Cut
      if (anyModKey && e.key === 'x' && hasSelection) {
        e.preventDefault();
        const data = currentOptions.getData();
        const selectedIds = currentState.selectedIds;
        const components = extractComponents(data, selectedIds);

        const clipboard: PressroomClipboard = {
          version: 1,
          source: {
            templateId: currentOptions.templateId,
            pageId: currentOptions.activePageId,
            pageName: currentOptions.activePageName,
          },
          components,
          copiedAt: new Date().toISOString(),
        };

        // Store in context
        dispatch({ type: 'SET_CLIPBOARD', clipboard });

        // Try to write to system clipboard
        try {
          const clipboardText = JSON.stringify(clipboard);
          navigator.clipboard.writeText(clipboardText).catch(() => {
            // Silently fail if clipboard access denied
          });
        } catch {
          // Silently fail if clipboard API not available
        }

        // Remove components from data
        const newData = removeComponents(data, selectedIds);
        currentOptions.setData(newData);

        // Clear selection
        dispatch({ type: 'CLEAR_SELECTION' });

        currentOptions.onToast?.(
          `${components.length} component${components.length === 1 ? '' : 's'} cut`
        );
        return;
      }

      // Ctrl+V / Cmd+V - Paste
      if (anyModKey && e.key === 'v') {
        e.preventDefault();

        // Priority 1: Use context clipboard
        if (currentState.clipboard) {
          const clipboard = currentState.clipboard;
          let components = clipboard.components;

          // Filter unknown component types if validation is enabled
          if (currentOptions.validComponentTypes) {
            const unknownTypes = new Set<string>();
            components = components.filter(comp => {
              if (!currentOptions.validComponentTypes!.has(comp.type)) {
                unknownTypes.add(comp.type);
                return false;
              }
              return true;
            });

            if (unknownTypes.size > 0) {
              currentOptions.onToast?.(
                `Warning: ${unknownTypes.size} unknown component type${unknownTypes.size === 1 ? '' : 's'} filtered out`
              );
            }
          }

          if (components.length === 0) {
            currentOptions.onToast?.('No valid components to paste');
            return;
          }

          const data = currentOptions.getData();
          const { newData, newIds } = pasteComponents(data, components);
          currentOptions.setData(newData);

          // Select the newly pasted components
          dispatch({ type: 'SELECT_MULTIPLE', ids: newIds });

          currentOptions.onToast?.(
            `${components.length} component${components.length === 1 ? '' : 's'} pasted`
          );
          return;
        }

        // Priority 2: Try to read from system clipboard
        navigator.clipboard
          .readText()
          .then((text) => {
            try {
              const parsed: unknown = JSON.parse(text);
              
              if (!isPressroomClipboard(parsed)) {
                // Not a valid Pressroom clipboard
                return;
              }

              let components = parsed.components;

              // Filter unknown component types if validation is enabled
              if (currentOptions.validComponentTypes) {
                const unknownTypes = new Set<string>();
                components = components.filter(comp => {
                  if (!currentOptions.validComponentTypes!.has(comp.type)) {
                    unknownTypes.add(comp.type);
                    return false;
                  }
                  return true;
                });

                if (unknownTypes.size > 0) {
                  currentOptions.onToast?.(
                    `Warning: ${unknownTypes.size} unknown component type${unknownTypes.size === 1 ? '' : 's'} filtered out`
                  );
                }
              }

              if (components.length === 0) {
                currentOptions.onToast?.('No valid components to paste');
                return;
              }

              const data = currentOptions.getData();
              const { newData, newIds } = pasteComponents(data, components);
              currentOptions.setData(newData);

              // Select the newly pasted components
              dispatch({ type: 'SELECT_MULTIPLE', ids: newIds });

              currentOptions.onToast?.(
                `${components.length} component${components.length === 1 ? '' : 's'} pasted`
              );
            } catch {
              // Invalid JSON or parsing error - silently ignore
            }
          })
          .catch(() => {
            // Clipboard read permission denied or not available - silently ignore
          });
        return;
      }

      // Ctrl+D / Cmd+D - Duplicate
      if (anyModKey && e.key === 'd' && hasSelection) {
        e.preventDefault();
        const data = currentOptions.getData();
        const selectedIds = currentState.selectedIds;
        const { newData, newIds } = duplicateComponents(data, selectedIds);
        currentOptions.setData(newData);

        // Switch selection to the duplicated components
        dispatch({ type: 'SELECT_MULTIPLE', ids: newIds });

        currentOptions.onToast?.(
          `${selectedIds.size} component${selectedIds.size === 1 ? '' : 's'} duplicated`
        );
        return;
      }

      // Delete / Backspace - Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && hasSelection) {
        e.preventDefault();
        const selectedIds = currentState.selectedIds;
        const count = selectedIds.size;
        
        // Confirm if more than threshold components selected
        if (count > DELETE_CONFIRMATION_THRESHOLD) {
          const confirmed = window.confirm(
            `Delete ${count} components?`
          );
          if (!confirmed) return;
        }

        const data = currentOptions.getData();
        const newData = removeComponents(data, selectedIds);
        currentOptions.setData(newData);

        // Clear selection
        dispatch({ type: 'CLEAR_SELECTION' });

        currentOptions.onToast?.(
          `${count} component${count === 1 ? '' : 's'} deleted`
        );
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, dispatch]);
}
