'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

type FieldOption = { label: string; value: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RenderProps = { value: any; onChange: (val: any) => void; name: string };

export const YES_NO_OPTIONS: FieldOption[] = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

/** Custom Puck field that renders a shadcn Input. */
export function textField(label: string, opts?: { placeholder?: string }) {
  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange, name }: RenderProps) => (
      <div className="space-y-1.5">
        <Label htmlFor={name} className="font-semibold">{label}</Label>
        <Input
          id={name}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={opts?.placeholder ?? ''}
          className="h-8 text-xs"
        />
      </div>
    ),
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
          <SelectTrigger size="sm" className="w-full text-xs">
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

/** Custom Puck field that renders a shadcn Input with type="number". */
export function numberField(label: string, opts?: { min?: number; max?: number; step?: number }) {
  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange, name }: RenderProps) => (
      <div className="space-y-1.5">
        <Label htmlFor={name} className="font-semibold">{label}</Label>
        <Input
          id={name}
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
          min={opts?.min}
          max={opts?.max}
          step={opts?.step}
          className="h-8 text-xs"
        />
      </div>
    ),
  };
}

/** Custom Puck field that renders a shadcn Textarea. */
export function textareaField(label: string, opts?: { placeholder?: string; rows?: number }) {
  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange, name }: RenderProps) => (
      <div className="space-y-1.5">
        <Label htmlFor={name} className="font-semibold">{label}</Label>
        <Textarea
          id={name}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={opts?.placeholder ?? ''}
          rows={opts?.rows ?? 3}
          className="text-xs"
        />
      </div>
    ),
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
