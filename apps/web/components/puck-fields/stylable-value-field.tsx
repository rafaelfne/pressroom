'use client';

import { useStyleGuide } from '@/contexts/style-guide-context';
import type { StylableValue } from '@/lib/types/style-system';

type StylableValueFieldProps = {
  value: StylableValue | string;
  onChange: (value: StylableValue) => void;
  field: {
    label?: string;
    /** Filter tokens by CSS property (e.g. 'color', 'font-family') */
    tokenCssProperty?: string;
    /** Filter tokens by category (e.g. 'color', 'typography') */
    tokenCategory?: string;
  };
};

/**
 * Custom Puck field that supports both inline values and style guide tokens.
 * When no style guide is assigned, it falls back to a simple text input.
 */
export function StylableValueField({ value, onChange, field }: StylableValueFieldProps) {
  const { tokens } = useStyleGuide();

  // Normalize value: support plain strings for backward compatibility
  const normalized: StylableValue =
    typeof value === 'string'
      ? { mode: 'inline', inline: value }
      : value ?? { mode: 'inline', inline: '' };

  // Filter tokens based on field configuration
  const filteredTokens = tokens.filter((t) => {
    if (field.tokenCssProperty && t.cssProperty !== field.tokenCssProperty) return false;
    if (field.tokenCategory && t.category !== field.tokenCategory) return false;
    return true;
  });

  const hasTokens = filteredTokens.length > 0;

  return (
    <div>
      {field?.label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {field.label}
        </label>
      )}

      {/* Mode toggle — only shown when tokens are available */}
      {hasTokens && (
        <div className="mb-1.5 flex rounded-md border text-xs">
          <button
            type="button"
            className={`flex-1 px-2 py-1 rounded-l-md transition-colors ${normalized.mode === 'inline'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
              }`}
            onClick={() =>
              onChange({ mode: 'inline', inline: normalized.inline ?? '' })
            }
          >
            Inline
          </button>
          <button
            type="button"
            className={`flex-1 px-2 py-1 rounded-r-md transition-colors ${normalized.mode === 'token'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
              }`}
            onClick={() =>
              onChange({ mode: 'token', token: normalized.token ?? '' })
            }
          >
            Token
          </button>
        </div>
      )}

      {/* Inline mode */}
      {normalized.mode === 'inline' || !hasTokens ? (
        <div className="flex gap-1">
          <input
            type="text"
            value={normalized.inline ?? ''}
            onChange={(e) =>
              onChange({ mode: 'inline', inline: e.target.value })
            }
            placeholder="e.g. #3B82F6"
            className="w-full rounded-md border px-2 py-1 text-sm"
          />
          {field.tokenCssProperty === 'color' ||
            field.tokenCategory === 'color' ||
            field.tokenCategory === 'background' ? (
            <input
              type="color"
              value={normalized.inline || '#000000'}
              onChange={(e) =>
                onChange({ mode: 'inline', inline: e.target.value })
              }
              className="h-8 w-8 shrink-0 cursor-pointer rounded border p-0.5"
            />
          ) : null}
        </div>
      ) : (
        /* Token mode */
        <select
          value={normalized.token ?? ''}
          onChange={(e) =>
            onChange({ mode: 'token', token: e.target.value })
          }
          className="w-full rounded-md border px-2 py-1.5 text-sm"
        >
          <option value="">Select a token...</option>
          {filteredTokens.map((t) => (
            <option key={t.name} value={t.name}>
              {t.label} ({t.value})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
