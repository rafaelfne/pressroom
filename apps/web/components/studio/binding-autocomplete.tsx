'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  generatePathSuggestions,
  filterSuggestions,
  getFunctionSuggestions,
  filterFunctionSuggestions,
  type PathSuggestion,
  type FunctionSuggestion,
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
  | { type: 'function'; suggestion: FunctionSuggestion };

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
      
      let items: SuggestionItem[] = [];
      
      if (functionMatch) {
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
    [pathSuggestions, functionSuggestions]
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
    const newPosition = e.target.selectionStart ?? newValue.length;
    
    onChange(newValue);
    setCursorPosition(newPosition);
    debouncedUpdate(newValue, newPosition);
  };

  // Handle cursor position change (click, arrow keys)
  const handleSelect = (
    e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const newPosition = target.selectionStart ?? value.length;
    setCursorPosition(newPosition);
    debouncedUpdate(value, newPosition);
  };

  // Insert selected suggestion
  const insertSuggestion = useCallback(
    (item: SuggestionItem) => {
      const textBeforeCursor = value.slice(0, cursorPosition);
      const textAfterCursor = value.slice(cursorPosition);
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
          className={`${inputClassName} min-h-[80px] resize-y font-mono`}
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
          className="absolute z-50 mt-1 max-h-[300px] w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
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
              className={`cursor-pointer px-3 py-2 text-sm ${
                index === selectedIndex
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
