'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { BindingFieldOverride } from '@/components/studio/binding-field-override';

type FieldOption = { label: string; value: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RenderProps = { value: any; onChange: (val: any) => void; name: string };

export const YES_NO_OPTIONS: FieldOption[] = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

/** Custom Puck field that renders a text input with binding autocomplete. */
export function textField(label: string, opts?: { placeholder?: string }) {
  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange, name }: RenderProps) => {
      const isArrayItem = name?.includes('[');
      return (
        <div className="space-y-1.5">
          <Label htmlFor={name} className="font-semibold">{label}</Label>
          <BindingFieldOverride
            value={value ?? ''}
            onChange={onChange}
            placeholder={opts?.placeholder ?? ''}
            showExplorer={!isArrayItem}
          />
        </div>
      );
    },
  };
}

/** Custom Puck field that renders a shadcn Select. */
export function selectField(label: string, options: FieldOption[]) {
  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange, name }: RenderProps) => (
      <div className="space-y-1.5">
        <Label htmlFor={name} className="font-semibold">{label}</Label>
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger className="w-full text-xs font-semibold">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {options
              .filter((opt) => opt.value !== '')
              .map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    ),
  };
}

/** Custom Puck field that renders a number input with binding autocomplete. */
export function numberField(label: string, opts?: { min?: number; max?: number; step?: number }) {
  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange, name }: RenderProps) => {
      const isArrayItem = name?.includes('[');
      return (
        <div className="space-y-1.5">
          <Label htmlFor={name} className="font-semibold">{label}</Label>
          <BindingFieldOverride
            value={value != null ? String(value) : ''}
            onChange={(val: string) => {
              // If the value contains a binding expression, pass it as-is
              if (val.includes('{{')) {
                onChange(val);
              } else {
                onChange(val === '' ? 0 : Number(val));
              }
            }}
            placeholder={opts?.min != null && opts?.max != null ? `${opts.min}–${opts.max}` : ''}
            showExplorer={!isArrayItem}
          />
        </div>
      );
    },
  };
}

/** Custom Puck field that renders a multiline text input with binding autocomplete. */
export function textareaField(label: string, opts?: { placeholder?: string; rows?: number }) {
  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange, name }: RenderProps) => {
      const isArrayItem = name?.includes('[');
      return (
        <div className="space-y-1.5">
          <Label htmlFor={name} className="font-semibold">{label}</Label>
          <BindingFieldOverride
            value={value ?? ''}
            onChange={onChange}
            placeholder={opts?.placeholder ?? ''}
            multiline
            showExplorer={!isArrayItem}
          />
        </div>
      );
    },
  };
}

/** Custom Puck field that renders a shadcn RadioGroup. */
export function radioField(label: string, options: FieldOption[]) {
  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange, name }: RenderProps) => (
      <div className="space-y-1.5">
        <Label className="font-semibold">{label}</Label>
        <RadioGroup value={value ?? ''} onValueChange={onChange} className="flex gap-3">
          {options.map((opt) => (
            <div key={opt.value} className="flex items-center gap-1.5">
              <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} />
              <Label
                htmlFor={`${name}-${opt.value}`}
                className="text-xs font-normal cursor-pointer"
              >
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    ),
  };
}

/** Custom Puck field that renders a shadcn Switch for boolean (Yes/No) fields. */
export function toggleField(label: string) {
  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange, name }: RenderProps) => (
      <div className="flex items-center justify-between">
        <Label htmlFor={name} className="font-semibold">{label}</Label>
        <Switch
          id={name}
          size="sm"
          checked={value === 'true' || value === true}
          onCheckedChange={(checked) => onChange(String(checked))}
        />
      </div>
    ),
  };
}

/** Page break field using shadcn Select. */
export const pageBreakCustomField = selectField('Page Break', [
  { label: 'Auto', value: 'auto' },
  { label: 'Avoid Split', value: 'avoid' },
  { label: 'Break Before', value: 'before' },
  { label: 'Break After', value: 'after' },
]);
