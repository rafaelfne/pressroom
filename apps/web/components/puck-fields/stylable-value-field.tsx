'use client';

import { useStyleGuide } from '@/contexts/style-guide-context';
import type { StylableValue } from '@/lib/types/style-system';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  // Filter tokens based on category (the broad semantic group).
  // cssProperty is metadata on the token, not a filter criterion — e.g. all
  // "border" tokens (border-color, border-width, border-radius) should be
  // available in any border-related field.
  const filteredTokens = tokens.filter((t) => {
    if (field.tokenCategory && t.category !== field.tokenCategory) return false;
    return true;
  });

  const hasTokens = filteredTokens.length > 0;
  const isColorField =
    field.tokenCssProperty === 'color' ||
    field.tokenCategory === 'color' ||
    field.tokenCategory === 'background';

  // No tokens available — render plain input without tabs
  if (!hasTokens) {
    return (
      <div className="space-y-1.5">
        {field?.label && <Label className='font-semibold'>{field.label}</Label>}
        <div className="flex gap-1.5">
          <Input
            value={normalized.inline ?? ''}
            onChange={(e) =>
              onChange({ mode: 'inline', inline: e.target.value })
            }
            placeholder="Type a value..."
            className="h-8 text-xs bg-input/30"
          />
          {isColorField && (
            <input
              type="color"
              value={normalized.inline || '#000000'}
              onChange={(e) =>
                onChange({ mode: 'inline', inline: e.target.value })
              }
              className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-input p-0.5"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {field?.label && <Label className='font-semibold'>{field.label}</Label>}

      <Tabs
        value={normalized.mode}
        onValueChange={(mode) => {
          if (mode === 'inline') {
            onChange({ mode: 'inline', inline: normalized.inline ?? '' });
          } else {
            onChange({ mode: 'token', token: normalized.token ?? '' });
          }
        }}
      >
        <TabsList className="h-7 w-full">
          <TabsTrigger value="inline" className="text-xs h-5">
            Inline
          </TabsTrigger>
          <TabsTrigger value="token" className="text-xs h-5">
            Token
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inline" className="mt-1.5">
          <div className="flex gap-1.5">
            <Input
              value={normalized.inline ?? ''}
              onChange={(e) =>
                onChange({ mode: 'inline', inline: e.target.value })
              }
              placeholder="Type a value..."
              className="text-xs bg-linear-30 bg-slate-900 text-amber-500 font-semibold"
            />
            {isColorField && (
              <input
                type="color"
                value={normalized.inline || '#000000'}
                onChange={(e) =>
                  onChange({ mode: 'inline', inline: e.target.value })
                }
                className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-input p-0.5 bg-input/30"
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="token" className="mt-1.5">
          <Select
            value={normalized.token ?? ''}
            onValueChange={(token) =>
              onChange({ mode: 'token', token })
            }
          >
            <SelectTrigger className="w-full text-xs bg-slate-900! text-amber-500 font-semibold">
              <SelectValue placeholder="Select a token..." />
            </SelectTrigger>
            <SelectContent>
              {filteredTokens.map((t) => (
                <SelectItem key={t.name} value={t.name}>
                  {t.label} ({t.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TabsContent>
      </Tabs>
    </div>
  );
}
