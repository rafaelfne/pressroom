'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export interface PageConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: PageConfig;
  onConfigChange: (config: PageConfig) => void;
  title?: string;
}

export function PageConfigDialog({
  open,
  onOpenChange,
  config,
  onConfigChange,
  title = 'Page Settings',
}: PageConfigDialogProps) {
  // Local form state
  const [localConfig, setLocalConfig] = React.useState<PageConfig>(config);

  // Sync external config changes to local state when dialog opens
  React.useEffect(() => {
    if (open) {
      setLocalConfig(config);
    }
  }, [open, config]);

  // Detect current margin preset
  const currentMarginPreset = React.useMemo(
    () => detectMarginPreset(localConfig.margins),
    [localConfig.margins],
  );

  const handlePaperSizeChange = (size: PaperSize) => {
    setLocalConfig((prev) => ({
      ...prev,
      paperSize: size,
      // Clear custom dimensions when switching away from Custom
      ...(size !== 'Custom' && { customWidth: undefined, customHeight: undefined }),
    }));
  };

  const handleOrientationChange = (orientation: Orientation) => {
    setLocalConfig((prev) => ({ ...prev, orientation }));
  };

  const handleMarginPresetChange = (preset: Exclude<MarginPreset, 'custom'>) => {
    setLocalConfig((prev) => ({
      ...prev,
      margins: { ...MARGIN_PRESETS[preset].margins },
    }));
  };

  const handleMarginChange = (side: keyof PageMargins, value: number) => {
    setLocalConfig((prev) => ({
      ...prev,
      margins: { ...prev.margins, [side]: value },
    }));
  };

  const handleCustomDimensionChange = (
    dimension: 'customWidth' | 'customHeight',
    value: number,
  ) => {
    setLocalConfig((prev) => ({ ...prev, [dimension]: value }));
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleApply = () => {
    onConfigChange(localConfig);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="page-config-dialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Configure page size, orientation, and margins for your report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Paper Size Section */}
          <div className="space-y-3">
            <Label htmlFor="paper-size">Paper Size</Label>
            <Select
              value={localConfig.paperSize}
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
            {localConfig.paperSize !== 'Custom' && (
              <p className="text-xs text-muted-foreground">
                {PAPER_SIZES[localConfig.paperSize].label}
              </p>
            )}

            {/* Custom dimensions inputs */}
            {localConfig.paperSize === 'Custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="custom-width" className="text-xs">
                    Width (px)
                  </Label>
                  <Input
                    id="custom-width"
                    data-testid="custom-width"
                    type="number"
                    min={1}
                    value={localConfig.customWidth ?? 595}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      handleCustomDimensionChange('customWidth', isNaN(val) ? 595 : val);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-height" className="text-xs">
                    Height (px)
                  </Label>
                  <Input
                    id="custom-height"
                    data-testid="custom-height"
                    type="number"
                    min={1}
                    value={localConfig.customHeight ?? 842}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      handleCustomDimensionChange('customHeight', isNaN(val) ? 842 : val);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Orientation Section */}
          <div className="space-y-3">
            <Label>Orientation</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={localConfig.orientation === 'portrait' ? 'default' : 'outline'}
                size="sm"
                data-testid="orientation-portrait"
                onClick={() => handleOrientationChange('portrait')}
                className="flex-1"
              >
                Portrait
              </Button>
              <Button
                type="button"
                variant={localConfig.orientation === 'landscape' ? 'default' : 'outline'}
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
            <Label>Margins</Label>

            {/* Margin Presets */}
            <div className="flex gap-2">
              {(Object.keys(MARGIN_PRESETS) as Array<Exclude<MarginPreset, 'custom'>>).map(
                (preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={currentMarginPreset === preset ? 'default' : 'outline'}
                    size="sm"
                    data-testid={`margin-preset-${preset}`}
                    onClick={() => handleMarginPresetChange(preset)}
                    className="flex-1 capitalize"
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
                className="flex-1 capitalize"
                disabled
              >
                Custom
              </Button>
            </div>

            {/* Margin Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="margin-top" className="text-xs">
                  Top (px)
                </Label>
                <Input
                  id="margin-top"
                  data-testid="margin-top"
                  type="number"
                  min={0}
                  step="1"
                  value={localConfig.margins.top}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleMarginChange('top', isNaN(val) ? 0 : val);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="margin-right" className="text-xs">
                  Right (px)
                </Label>
                <Input
                  id="margin-right"
                  data-testid="margin-right"
                  type="number"
                  min={0}
                  step="1"
                  value={localConfig.margins.right}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleMarginChange('right', isNaN(val) ? 0 : val);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="margin-bottom" className="text-xs">
                  Bottom (px)
                </Label>
                <Input
                  id="margin-bottom"
                  data-testid="margin-bottom"
                  type="number"
                  min={0}
                  step="1"
                  value={localConfig.margins.bottom}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleMarginChange('bottom', isNaN(val) ? 0 : val);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="margin-left" className="text-xs">
                  Left (px)
                </Label>
                <Input
                  id="margin-left"
                  data-testid="margin-left"
                  type="number"
                  min={0}
                  step="1"
                  value={localConfig.margins.left}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleMarginChange('left', isNaN(val) ? 0 : val);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            data-testid="page-config-cancel"
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleApply} data-testid="page-config-apply">
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
