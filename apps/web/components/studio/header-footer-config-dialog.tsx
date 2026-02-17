'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
    HeaderConfig,
    FooterConfig,
    ZoneContent,
    PageNumberFormat,
} from '@/lib/types/header-footer-config';
import {
    DEFAULT_HEADER_CONFIG,
    DEFAULT_FOOTER_CONFIG,
    PAGE_NUMBER_FORMATS,
} from '@/lib/types/header-footer-config';

type ConfigType = 'header' | 'footer';

interface HeaderFooterConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: ConfigType;
    config: HeaderConfig | FooterConfig;
    onSave: (config: HeaderConfig | FooterConfig) => void;
}

type ZonePosition = 'left' | 'center' | 'right';

function ZoneEditor({
    label,
    zone,
    onChange,
}: {
    label: string;
    zone: ZoneContent;
    onChange: (zone: ZoneContent) => void;
}) {
    const [localText, setLocalText] = React.useState(
        zone.type === 'text' ? zone.value : ''
    );

    React.useEffect(() => {
        setLocalText(zone.type === 'text' ? zone.value : '');
    }, [zone]);

    return (
        <div className="space-y-2">
            <Label className="text-xs font-medium">{label}</Label>
            <select
                value={zone.type}
                onChange={(e) => {
                    const newType = e.target.value as ZoneContent['type'];
                    if (newType === 'text') {
                        onChange({ type: 'text', value: '' });
                    } else if (newType === 'pageNumber') {
                        onChange({ type: 'pageNumber', format: '{page}/{total}' });
                    } else if (newType === 'image') {
                        onChange({ type: 'image', src: '' });
                    } else {
                        onChange({ type: 'empty' });
                    }
                }}
                className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
                <option value="empty">Empty</option>
                <option value="text">Text</option>
                <option value="pageNumber">Page Number</option>
                <option value="image">Image</option>
            </select>

            {zone.type === 'text' && (
                <Input
                    type="text"
                    placeholder="Enter text or {{expression}}"
                    value={localText}
                    onChange={(e) => setLocalText(e.target.value)}
                    onBlur={() => {
                        if (localText !== (zone as { value: string }).value) {
                            onChange({ ...zone, value: localText });
                        }
                    }}
                    className="h-8 text-xs"
                />
            )}

            {zone.type === 'pageNumber' && (
                <select
                    value={(zone as { format: PageNumberFormat }).format}
                    onChange={(e) =>
                        onChange({ ...zone, format: e.target.value as PageNumberFormat })
                    }
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    {PAGE_NUMBER_FORMATS.map((fmt) => (
                        <option key={fmt.value} value={fmt.value}>
                            {fmt.label}
                        </option>
                    ))}
                </select>
            )}

            {zone.type === 'image' && (
                <Input
                    type="text"
                    placeholder="Image URL"
                    value={(zone as { src: string }).src}
                    onChange={(e) => onChange({ ...zone, src: e.target.value })}
                    className="h-8 text-xs"
                />
            )}
        </div>
    );
}

export function HeaderFooterConfigDialog({
    open,
    onOpenChange,
    type,
    config,
    onSave,
}: HeaderFooterConfigDialogProps) {
    const isHeader = type === 'header';
    const defaultConfig = isHeader ? DEFAULT_HEADER_CONFIG : DEFAULT_FOOTER_CONFIG;

    const [localConfig, setLocalConfig] = React.useState<HeaderConfig | FooterConfig>(config);
    const [localHeight, setLocalHeight] = React.useState(config.height);

    React.useEffect(() => {
        setLocalConfig(config);
        setLocalHeight(config.height);
    }, [config, open]);

    const handleZoneChange = (position: ZonePosition, zone: ZoneContent) => {
        setLocalConfig((prev) => ({
            ...prev,
            zones: {
                ...prev.zones,
                [position]: zone,
            },
        }));
    };

    const handleSave = () => {
        onSave({ ...localConfig, height: localHeight });
        onOpenChange(false);
    };

    const handleCancel = () => {
        setLocalConfig(config);
        setLocalHeight(config.height);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Configure {isHeader ? 'Header' : 'Footer'}</DialogTitle>
                    <DialogDescription>
                        Set up the {isHeader ? 'header' : 'footer'} zones and appearance.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Height */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium">Height (px)</Label>
                        <Input
                            type="number"
                            min={14}
                            max={142}
                            value={localHeight}
                            onChange={(e) => setLocalHeight(parseFloat(e.target.value) || defaultConfig.height)}
                            className="h-8 text-xs"
                        />
                    </div>

                    {/* Zones */}
                    <div className="space-y-3">
                        <Label className="text-xs font-medium text-muted-foreground">Content Zones</Label>
                        <div className="grid grid-cols-3 gap-3">
                            <ZoneEditor
                                label="Left"
                                zone={localConfig.zones.left}
                                onChange={(zone) => handleZoneChange('left', zone)}
                            />
                            <ZoneEditor
                                label="Center"
                                zone={localConfig.zones.center}
                                onChange={(zone) => handleZoneChange('center', zone)}
                            />
                            <ZoneEditor
                                label="Right"
                                zone={localConfig.zones.right}
                                onChange={(zone) => handleZoneChange('right', zone)}
                            />
                        </div>
                    </div>

                    {/* Border */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="border-enabled"
                                checked={
                                    isHeader
                                        ? (localConfig as HeaderConfig).bottomBorder?.enabled ?? false
                                        : (localConfig as FooterConfig).topBorder?.enabled ?? false
                                }
                                onChange={(e) => {
                                    if (isHeader) {
                                        setLocalConfig((prev) => ({
                                            ...prev,
                                            bottomBorder: {
                                                ...(prev as HeaderConfig).bottomBorder,
                                                enabled: e.target.checked,
                                            },
                                        }));
                                    } else {
                                        setLocalConfig((prev) => ({
                                            ...prev,
                                            topBorder: {
                                                ...(prev as FooterConfig).topBorder,
                                                enabled: e.target.checked,
                                            },
                                        }));
                                    }
                                }}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="border-enabled" className="text-xs cursor-pointer">
                                Show {isHeader ? 'bottom' : 'top'} border
                            </Label>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
