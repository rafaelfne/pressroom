'use client';

import { useState, useCallback, useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import {
  generatePathSuggestions,
  filterSuggestions,
  getFunctionSuggestions,
  filterFunctionSuggestions,
  getPipeSuggestions,
  filterPipeSuggestions,
  type PathSuggestion,
  type FunctionSuggestion,
  type PipeSuggestion,
} from '@/lib/binding/suggest-paths';

export interface BindingAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  sampleData?: Record<string, unknown>;
  placeholder?: string;
  multiline?: boolean;
}

type SuggestionItem =
  | { type: 'path'; suggestion: PathSuggestion }
  | { type: 'function'; suggestion: FunctionSuggestion }
  | { type: 'pipe'; suggestion: PipeSuggestion };

export function BindingAutocomplete({
  value,
  onChange,
  sampleData,
  placeholder,
  multiline = false,
}: BindingAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [filteredItems, setFilteredItems] = useState<SuggestionItem[]>([]);

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);

  // Generate path suggestions from sample data (memoized)
  const pathSuggestions = useMemo(() => {
    if (!sampleData) {
      return [];
    }
    return generatePathSuggestions(sampleData);
  }, [sampleData]);

  // Get static function suggestions (memoized)
  const functionSuggestions = useMemo(() => {
    return getFunctionSuggestions();
  }, []);

  // Get pipe-specific suggestions (memoized) — uses pipe syntax with colon args
  const pipeSuggestions = useMemo(() => {
    return getPipeSuggestions();
  }, []);

  // Detect binding context and filter suggestions
  const updateSuggestions = useCallback(
    (text: string, position: number) => {
      // Find the last {{ before cursor
      const textBeforeCursor = text.slice(0, position);
      const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');

      // Check if we're inside a binding context
      if (lastOpenBrace === -1) {
        setShowSuggestions(false);
        return;
      }

      // Check if binding is closed after the opening
      const textAfterOpen = text.slice(lastOpenBrace);
      const closeIndex = textAfterOpen.indexOf('}}');
      const positionInBinding = position - lastOpenBrace;

      // If we found a close before cursor, we're not in binding context
      if (closeIndex !== -1 && closeIndex < positionInBinding) {
        setShowSuggestions(false);
        return;
      }

      // Extract the partial text after {{
      const bindingContent = textBeforeCursor.slice(lastOpenBrace + 2);

      // Check if user is typing a function call (contains opening parenthesis)
      const functionMatch = bindingContent.match(/(\w+)\(([^)]*)$/);

      // Check if user is typing a pipe expression (e.g. "value | cur")
      const pipeMatch = bindingContent.match(/\|\s*(\w*)$/);

      let items: SuggestionItem[] = [];

      if (pipeMatch) {
        // User is typing after a pipe - show pipe-specific suggestions with pipe syntax
        const partial = pipeMatch[1];
        const filtered = filterPipeSuggestions(
          pipeSuggestions,
          partial
        );
        items = filtered.map((suggestion) => ({
          type: 'pipe' as const,
          suggestion,
        }));
      } else if (functionMatch) {
        // User is typing a function - filter function suggestions
        const functionName = functionMatch[1];
        const filtered = filterFunctionSuggestions(
          functionSuggestions,
          functionName
        );
        items = filtered.map((suggestion) => ({
          type: 'function' as const,
          suggestion,
        }));
      } else {
        // User is typing a path - filter path suggestions
        const filtered = filterSuggestions(pathSuggestions, bindingContent);
        items = filtered.map((suggestion) => ({
          type: 'path' as const,
          suggestion,
        }));
      }

      // Limit to 10 suggestions
      const limitedItems = items.slice(0, 10);

      setFilteredItems(limitedItems);
      setShowSuggestions(limitedItems.length > 0);
      setSelectedIndex(0);
    },
    [pathSuggestions, functionSuggestions, pipeSuggestions]
  );

  // Debounced update
  const debouncedUpdate = useCallback(
    (text: string, position: number) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        updateSuggestions(text, position);
      }, 100);
    },
    [updateSuggestions]
  );

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    const newStart = e.target.selectionStart ?? newValue.length;
    const newEnd = e.target.selectionEnd ?? newStart;

    selectionRef.current = { start: newStart, end: newEnd };
    onChange(newValue);
    setCursorPosition(newStart);
    debouncedUpdate(newValue, newStart);
  };

  // Handle cursor position change (click, arrow keys, text selection)
  const handleSelect = (
    e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const newStart = target.selectionStart ?? value.length;
    const newEnd = target.selectionEnd ?? newStart;
    selectionRef.current = { start: newStart, end: newEnd };
    setCursorPosition(newStart);
    debouncedUpdate(value, newStart);
  };

  // Insert selected suggestion
  const insertSuggestion = useCallback(
    (item: SuggestionItem) => {
      const textBeforeCursor = value.slice(0, cursorPosition);
      const textAfterCursor = value.slice(cursorPosition);

      if (item.type === 'pipe') {
        // For pipe suggestions, replace the partial text after the last |
        // and insert the full pipe expression (e.g. "currency:'BRL'")
        const pipeMatch = textBeforeCursor.match(/^([\s\S]*\|\s*)\w*$/);
        if (!pipeMatch) return;

        const textBeforePipePartial = pipeMatch[1];
        const insertText = item.suggestion.insertText;
        const newValue = textBeforePipePartial + insertText + textAfterCursor;
        const newCursorPosition = textBeforePipePartial.length + insertText.length;

        onChange(newValue);
        setShowSuggestions(false);

        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
            setCursorPosition(newCursorPosition);
          }
        }, 0);
        return;
      }

      const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');
      if (lastOpenBrace === -1) return;

      const textBeforeBinding = value.slice(0, lastOpenBrace + 2);

      let insertText = '';
      if (item.type === 'path') {
        // Insert path and close with }}
        insertText = item.suggestion.path + '}}';
      } else {
        // Insert function name and opening parenthesis
        insertText = item.suggestion.name + '(';
      }

      const newValue = textBeforeBinding + insertText + textAfterCursor;
      const newCursorPosition = textBeforeBinding.length + insertText.length;

      onChange(newValue);
      setShowSuggestions(false);

      // Restore cursor position after React updates
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
          setCursorPosition(newCursorPosition);
        }
      }, 0);
    },
    [value, cursorPosition, onChange]
  );

  // Handle keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!showSuggestions || filteredItems.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
        break;

      case 'Enter':
        if (showSuggestions) {
          e.preventDefault();
          insertSuggestion(filteredItems[selectedIndex]);
        }
        break;

      case 'Tab':
        if (showSuggestions) {
          e.preventDefault();
          insertSuggestion(filteredItems[selectedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (item: SuggestionItem, index: number) => {
    setSelectedIndex(index);
    insertSuggestion(item);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Restore cursor/selection position after React re-renders the controlled input.
  // We intentionally do NOT clear selectionRef after restoration:
  // Puck may trigger cascading re-renders, and each one resets the
  // controlled input value which moves the cursor to the end.
  // By keeping the ref, every subsequent render also restores the cursor.
  // The ref is naturally updated on the next user interaction (typing, click, arrow keys).
  useLayoutEffect(() => {
    if (
      selectionRef.current !== null &&
      inputRef.current &&
      document.activeElement === inputRef.current
    ) {
      inputRef.current.setSelectionRange(
        selectionRef.current.start,
        selectionRef.current.end,
      );
    }
  });

  // Get type badge color
  const getTypeBadgeClass = (type: string): string => {
    if (type.startsWith('array')) {
      return 'bg-purple-100 text-purple-700';
    }
    switch (type) {
      case 'string':
        return 'bg-green-100 text-green-700';
      case 'number':
        return 'bg-blue-100 text-blue-700';
      case 'boolean':
        return 'bg-yellow-100 text-yellow-700';
      case 'object':
        return 'bg-gray-100 text-gray-700';
      case 'null':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const inputClassName =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="relative" data-testid="binding-autocomplete">
      {multiline ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onClick={handleSelect}
          placeholder={placeholder}
          className={`${inputClassName} min-h-20 resize-y font-mono`}
          spellCheck={false}
          data-testid="binding-input"
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onClick={handleSelect}
          placeholder={placeholder}
          className={`${inputClassName} font-mono`}
          spellCheck={false}
          data-testid="binding-input"
        />
      )}

      {showSuggestions && filteredItems.length > 0 && (
        <div
          ref={popupRef}
          className="absolute z-50 mt-1 max-h-75 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
          data-testid="suggestion-list"
        >
          {filteredItems.map((item, index) => (
            <div
              key={
                item.type === 'path'
                  ? item.suggestion.path
                  : item.suggestion.name
              }
              onClick={() => handleSuggestionClick(item, index)}
              className={`cursor-pointer px-3 py-2 text-sm ${index === selectedIndex
                ? 'bg-blue-50 text-blue-900'
                : 'text-gray-900 hover:bg-gray-50'
                }`}
              data-testid="suggestion-item"
            >
              {item.type === 'path' ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono">{item.suggestion.path}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${getTypeBadgeClass(
                      item.suggestion.type
                    )}`}
                  >
                    {item.suggestion.type}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-semibold">
                    {item.suggestion.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.suggestion.signature}
                  </span>
                  <span className="text-xs text-gray-400">
                    {item.suggestion.description}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
