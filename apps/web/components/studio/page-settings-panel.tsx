'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type {
  PageConfig,
  PaperSize,
  Orientation,
  MarginPreset,
  PageMargins,
} from '@/lib/types/page-config';
import {
  PAPER_SIZES,
  MARGIN_PRESETS,
  detectMarginPreset,
} from '@/lib/types/page-config';

export interface PageSettingsPanelProps {
  config: PageConfig;
  onConfigChange: (config: PageConfig) => void;
  pageTitle: string;
  onPageTitleChange: (title: string) => void;
}

/**
 * Full page settings panel that shows when no component is selected.
 * Includes page title, paper size, orientation, and margins.
 * Uses only shadcn/ui components (ToggleGroup, Slider, Separator, etc.).
 */
export function PageSettingsPanel({
  config,
  onConfigChange,
  pageTitle,
  onPageTitleChange,
}: PageSettingsPanelProps) {
  // Local state for text inputs to prevent focus loss during typing
  const [localPageTitle, setLocalPageTitle] = React.useState(pageTitle);
  const [localMargins, setLocalMargins] = React.useState(config.margins);
  const [localCustomWidth, setLocalCustomWidth] = React.useState(config.customWidth ?? 595);
  const [localCustomHeight, setLocalCustomHeight] = React.useState(config.customHeight ?? 842);

  // Sync local state when props change from external sources
  React.useEffect(() => {
    setLocalPageTitle(pageTitle);
  }, [pageTitle]);

  React.useEffect(() => {
    setLocalMargins(config.margins);
  }, [config.margins]);

  React.useEffect(() => {
    setLocalCustomWidth(config.customWidth ?? 595);
  }, [config.customWidth]);

  React.useEffect(() => {
    setLocalCustomHeight(config.customHeight ?? 842);
  }, [config.customHeight]);

  // Detect current margin preset
  const currentMarginPreset = React.useMemo(
    () => detectMarginPreset(config.margins),
    [config.margins],
  );

  const handlePaperSizeChange = (size: PaperSize) => {
    onConfigChange({
      ...config,
      paperSize: size,
      ...(size !== 'Custom' && { customWidth: undefined, customHeight: undefined }),
    });
  };

  const handleOrientationChange = (orientation: Orientation) => {
    onConfigChange({ ...config, orientation });
  };

  const handleMarginPresetChange = (preset: Exclude<MarginPreset, 'custom'>) => {
    onConfigChange({
      ...config,
      margins: { ...MARGIN_PRESETS[preset].margins },
    });
  };

  const handleMarginChange = (side: keyof PageMargins, value: number) => {
    onConfigChange({
      ...config,
      margins: { ...config.margins, [side]: value },
    });
  };

  const handleCustomDimensionChange = (
    dimension: 'customWidth' | 'customHeight',
    value: number,
  ) => {
    onConfigChange({ ...config, [dimension]: value });
  };

  return (
    <div className="space-y-6 p-4" data-testid="page-settings-panel">
      {/* Page Title Section */}
      <div className="space-y-2">
        <Label htmlFor="page-title" className="text-xs font-medium text-muted-foreground">
          Title
        </Label>
        <Input
          id="page-title"
          data-testid="page-title-input"
          type="text"
          value={localPageTitle}
          onChange={(e) => setLocalPageTitle(e.target.value)}
          onBlur={() => {
            if (localPageTitle !== pageTitle) {
              onPageTitleChange(localPageTitle);
            }
          }}
          placeholder="Page name"
        />
      </div>

      <Separator />

      {/* Paper Size Section */}
      <div className="space-y-3">
        <Label htmlFor="paper-size" className="text-xs font-medium text-muted-foreground">
          Paper Size
        </Label>
        <Select
          value={config.paperSize}
          onValueChange={(value) => handlePaperSizeChange(value as PaperSize)}
        >
          <SelectTrigger id="paper-size" data-testid="paper-size-select" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A4">A4</SelectItem>
            <SelectItem value="Letter">Letter</SelectItem>
            <SelectItem value="Legal">Legal</SelectItem>
            <SelectItem value="A3">A3</SelectItem>
            <SelectItem value="Custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {/* Show dimensions label for named sizes */}
        {config.paperSize !== 'Custom' && (
          <p className="text-xs text-muted-foreground">
            {PAPER_SIZES[config.paperSize].label}
          </p>
        )}

        {/* Custom dimensions with Slider + Input combo */}
        {config.paperSize === 'Custom' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-width" className="text-xs">
                Width (px)
              </Label>
              <div className="flex items-center gap-3">
                <Slider
                  min={100}
                  max={1200}
                  step={1}
                  value={[localCustomWidth]}
                  onValueChange={([val]) => setLocalCustomWidth(val)}
                  onValueCommit={([val]) => handleCustomDimensionChange('customWidth', val)}
                  className="flex-1"
                  data-testid="custom-width-slider"
                />
                <Input
                  id="custom-width"
                  data-testid="custom-width"
                  type="number"
                  min={1}
                  value={localCustomWidth}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setLocalCustomWidth(isNaN(val) ? 595 : val);
                  }}
                  onBlur={() => {
                    if (localCustomWidth !== (config.customWidth ?? 595)) {
                      handleCustomDimensionChange('customWidth', localCustomWidth);
                    }
                  }}
                  className="w-20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-height" className="text-xs">
                Height (px)
              </Label>
              <div className="flex items-center gap-3">
                <Slider
                  min={100}
                  max={1700}
                  step={1}
                  value={[localCustomHeight]}
                  onValueChange={([val]) => setLocalCustomHeight(val)}
                  onValueCommit={([val]) => handleCustomDimensionChange('customHeight', val)}
                  className="flex-1"
                  data-testid="custom-height-slider"
                />
                <Input
                  id="custom-height"
                  data-testid="custom-height"
                  type="number"
                  min={1}
                  value={localCustomHeight}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setLocalCustomHeight(isNaN(val) ? 842 : val);
                  }}
                  onBlur={() => {
                    if (localCustomHeight !== (config.customHeight ?? 842)) {
                      handleCustomDimensionChange('customHeight', localCustomHeight);
                    }
                  }}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Orientation Section */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground">Orientation</Label>
        <ToggleGroup
          type="single"
          value={config.orientation}
          onValueChange={(value) => {
            if (value) handleOrientationChange(value as Orientation);
          }}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <ToggleGroupItem
            value="portrait"
            data-testid="orientation-portrait"
            className="flex-1"
          >
            Portrait
          </ToggleGroupItem>
          <ToggleGroupItem
            value="landscape"
            data-testid="orientation-landscape"
            className="flex-1"
          >
            Landscape
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <Separator />

      {/* Margins Section */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground">Margins</Label>

        {/* Margin Presets */}
        <ToggleGroup
          type="single"
          value={currentMarginPreset}
          onValueChange={(value) => {
            if (value && value !== 'custom') {
              handleMarginPresetChange(value as Exclude<MarginPreset, 'custom'>);
            }
          }}
          variant="outline"
          size="sm"
          className="flex-wrap"
        >
          {(Object.keys(MARGIN_PRESETS) as Array<Exclude<MarginPreset, 'custom'>>).map(
            (preset) => (
              <ToggleGroupItem
                key={preset}
                value={preset}
                data-testid={`margin-preset-${preset}`}
                className="capitalize text-xs"
              >
                {preset}
              </ToggleGroupItem>
            ),
          )}
          <ToggleGroupItem
            value="custom"
            data-testid="margin-preset-custom"
            className="capitalize text-xs"
            disabled
          >
            Custom
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Margin Inputs with Sliders */}
        <div className="grid grid-cols-2 gap-4">
          {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
            <div key={side} className="space-y-2">
              <Label htmlFor={`margin-${side}`} className="text-xs capitalize">
                {side} (px)
              </Label>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[localMargins[side]]}
                onValueChange={([val]) =>
                  setLocalMargins((prev) => ({ ...prev, [side]: val }))
                }
                onValueCommit={([val]) => handleMarginChange(side, val)}
                data-testid={`margin-${side}-slider`}
              />
              <Input
                id={`margin-${side}`}
                data-testid={`margin-${side}`}
                type="number"
                min={0}
                step="1"
                value={localMargins[side]}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setLocalMargins((prev) => ({ ...prev, [side]: isNaN(val) ? 0 : val }));
                }}
                onBlur={() => {
                  if (localMargins[side] !== config.margins[side]) {
                    handleMarginChange(side, localMargins[side]);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
