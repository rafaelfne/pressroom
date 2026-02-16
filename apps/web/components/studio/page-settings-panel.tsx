'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { HeaderFooterConfig } from '@/lib/types/header-footer-config';
import {
  DEFAULT_HEADER_CONFIG,
  DEFAULT_FOOTER_CONFIG,
} from '@/lib/types/header-footer-config';

export interface PageSettingsPanelProps {
  config: PageConfig;
  onConfigChange: (config: PageConfig) => void;
  pageTitle: string;
  onPageTitleChange: (title: string) => void;
  headerFooterConfig: HeaderFooterConfig;
  onHeaderFooterConfigChange: (config: HeaderFooterConfig) => void;
}

/**
 * Full page settings panel that shows when no component is selected.
 * Includes page title, paper size, orientation, margins, and header/footer config.
 */
export function PageSettingsPanel({
  config,
  onConfigChange,
  pageTitle,
  onPageTitleChange,
  headerFooterConfig,
  onHeaderFooterConfigChange,
}: PageSettingsPanelProps) {
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

  const handleHeaderEnabledChange = (enabled: boolean) => {
    const header = headerFooterConfig.header ?? DEFAULT_HEADER_CONFIG;
    
    onHeaderFooterConfigChange({
      ...headerFooterConfig,
      header: {
        ...header,
        enabled,
      },
    });
  };

  const handleFooterEnabledChange = (enabled: boolean) => {
    const footer = headerFooterConfig.footer ?? DEFAULT_FOOTER_CONFIG;
    
    onHeaderFooterConfigChange({
      ...headerFooterConfig,
      footer: {
        ...footer,
        enabled,
      },
    });
  };

  return (
    <div className="space-y-6 p-4" data-testid="page-settings-panel">
      {/* Panel Title */}
      <div>
        <h3 className="text-sm font-bold">Page</h3>
      </div>

      {/* Page Title Section */}
      <div className="space-y-2">
        <Label htmlFor="page-title" className="text-xs font-medium text-muted-foreground">
          Title
        </Label>
        <Input
          id="page-title"
          data-testid="page-title-input"
          type="text"
          value={pageTitle}
          onChange={(e) => onPageTitleChange(e.target.value)}
          placeholder="Page name"
        />
      </div>

      {/* Paper Size Section */}
      <div className="space-y-3">
        <Label htmlFor="paper-size" className="text-xs font-medium text-muted-foreground">
          Paper Size
        </Label>
        <select
          id="paper-size"
          data-testid="paper-size-select"
          value={config.paperSize}
          onChange={(e) => handlePaperSizeChange(e.target.value as PaperSize)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="A4">A4</option>
          <option value="Letter">Letter</option>
          <option value="Legal">Legal</option>
          <option value="A3">A3</option>
          <option value="Custom">Custom</option>
        </select>

        {/* Show dimensions label for named sizes */}
        {config.paperSize !== 'Custom' && (
          <p className="text-xs text-muted-foreground">
            {PAPER_SIZES[config.paperSize].label}
          </p>
        )}

        {/* Custom dimensions inputs */}
        {config.paperSize === 'Custom' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="custom-width" className="text-xs">
                Width (mm)
              </Label>
              <Input
                id="custom-width"
                data-testid="custom-width"
                type="number"
                min={1}
                value={config.customWidth ?? 210}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  handleCustomDimensionChange('customWidth', isNaN(val) ? 210 : val);
                }}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="custom-height" className="text-xs">
                Height (mm)
              </Label>
              <Input
                id="custom-height"
                data-testid="custom-height"
                type="number"
                min={1}
                value={config.customHeight ?? 297}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  handleCustomDimensionChange('customHeight', isNaN(val) ? 297 : val);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Orientation Section */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground">Orientation</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={config.orientation === 'portrait' ? 'default' : 'outline'}
            size="sm"
            data-testid="orientation-portrait"
            onClick={() => handleOrientationChange('portrait')}
            className="flex-1"
          >
            Portrait
          </Button>
          <Button
            type="button"
            variant={config.orientation === 'landscape' ? 'default' : 'outline'}
            size="sm"
            data-testid="orientation-landscape"
            onClick={() => handleOrientationChange('landscape')}
            className="flex-1"
          >
            Landscape
          </Button>
        </div>
      </div>

      {/* Margins Section */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground">Margins</Label>

        {/* Margin Presets */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(MARGIN_PRESETS) as Array<Exclude<MarginPreset, 'custom'>>).map(
            (preset) => (
              <Button
                key={preset}
                type="button"
                variant={currentMarginPreset === preset ? 'default' : 'outline'}
                size="sm"
                data-testid={`margin-preset-${preset}`}
                onClick={() => handleMarginPresetChange(preset)}
                className="capitalize text-xs"
              >
                {preset}
              </Button>
            ),
          )}
          <Button
            type="button"
            variant={currentMarginPreset === 'custom' ? 'default' : 'outline'}
            size="sm"
            data-testid="margin-preset-custom"
            className="capitalize text-xs"
            disabled
          >
            Custom
          </Button>
        </div>

        {/* Margin Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="margin-top" className="text-xs">
              Top (mm)
            </Label>
            <Input
              id="margin-top"
              data-testid="margin-top"
              type="number"
              min={0}
              step="0.1"
              value={config.margins.top}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                handleMarginChange('top', isNaN(val) ? 0 : val);
              }}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="margin-right" className="text-xs">
              Right (mm)
            </Label>
            <Input
              id="margin-right"
              data-testid="margin-right"
              type="number"
              min={0}
              step="0.1"
              value={config.margins.right}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                handleMarginChange('right', isNaN(val) ? 0 : val);
              }}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="margin-bottom" className="text-xs">
              Bottom (mm)
            </Label>
            <Input
              id="margin-bottom"
              data-testid="margin-bottom"
              type="number"
              min={0}
              step="0.1"
              value={config.margins.bottom}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                handleMarginChange('bottom', isNaN(val) ? 0 : val);
              }}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="margin-left" className="text-xs">
              Left (mm)
            </Label>
            <Input
              id="margin-left"
              data-testid="margin-left"
              type="number"
              min={0}
              step="0.1"
              value={config.margins.left}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                handleMarginChange('left', isNaN(val) ? 0 : val);
              }}
            />
          </div>
        </div>
      </div>

      {/* Header/Footer Section */}
      <div className="space-y-4 border-t border-border pt-4">
        <Label className="text-xs font-medium text-muted-foreground">
          Header & Footer
        </Label>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              id="show-header"
              data-testid="show-header-checkbox"
              type="checkbox"
              checked={headerFooterConfig.header?.enabled ?? false}
              onChange={(e) => handleHeaderEnabledChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="show-header" className="text-sm cursor-pointer">
              Show header on this page
            </Label>
          </div>
          <button
            type="button"
            data-testid="configure-header-link"
            className="text-xs text-blue-600 hover:underline cursor-not-allowed opacity-50"
            disabled
          >
            Configure Header →
          </button>
        </div>

        {/* Footer */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              id="show-footer"
              data-testid="show-footer-checkbox"
              type="checkbox"
              checked={headerFooterConfig.footer?.enabled ?? false}
              onChange={(e) => handleFooterEnabledChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="show-footer" className="text-sm cursor-pointer">
              Show footer on this page
            </Label>
          </div>
          <button
            type="button"
            data-testid="configure-footer-link"
            className="text-xs text-blue-600 hover:underline cursor-not-allowed opacity-50"
            disabled
          >
            Configure Footer →
          </button>
        </div>
      </div>
    </div>
  );
}
