'use client';

import { useCallback, useRef } from 'react';
import { PageConfig, getPageDimensionsPx, pxToScreen, ZOOM_LEVELS } from '@/lib/types/page-config';
import { HeaderFooterConfig } from '@/lib/types/header-footer-config';
import { Button } from '@/components/ui/button';

const MIN_ZOOM = 50;
const MAX_ZOOM = 150;
const SCROLL_ZOOM_STEP = 25;
const FIT_ZOOM_ROUNDING = 5;
const FIT_PADDING_PX = 64;

export interface PaperCanvasProps {
  pageConfig: PageConfig;
  headerFooterConfig?: HeaderFooterConfig;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  children: React.ReactNode;
}

export function PaperCanvas({ pageConfig, headerFooterConfig, zoom, onZoomChange, children }: PaperCanvasProps) {
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Header/Footer dimensions - convert from 72 DPI to screen pixels
  const headerEnabled = headerFooterConfig?.header?.enabled ?? false;
  const footerEnabled = headerFooterConfig?.footer?.enabled ?? false;
  const headerHeightPx = headerEnabled ? pxToScreen(headerFooterConfig?.header?.height ?? 43) : 0;
  const footerHeightPx = footerEnabled ? pxToScreen(headerFooterConfig?.footer?.height ?? 34) : 0;

  const paperDimensions = getPageDimensionsPx(pageConfig);

  // Fit button logic - calculates zoom to fit paper within workspace
  const handleFit = useCallback(() => {
    if (!workspaceRef.current) return;

    const containerWidth = workspaceRef.current.clientWidth;
    const fitZoom = ((containerWidth - FIT_PADDING_PX) / paperDimensions.width) * 100;
    const clampedZoom =
      Math.round(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, fitZoom)) / FIT_ZOOM_ROUNDING) *
      FIT_ZOOM_ROUNDING;

    onZoomChange(clampedZoom);
  }, [paperDimensions.width, onZoomChange]);

  // Ctrl+scroll zoom handler
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (e.ctrlKey) {
        e.preventDefault();

        const delta = e.deltaY > 0 ? -SCROLL_ZOOM_STEP : SCROLL_ZOOM_STEP;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));

        onZoomChange(newZoom);
      }
    },
    [zoom, onZoomChange],
  );

  // Margin calculations - convert from 72 DPI to screen pixels
  const marginTop = pxToScreen(pageConfig.margins.top);
  const marginRight = pxToScreen(pageConfig.margins.right);
  const marginBottom = pxToScreen(pageConfig.margins.bottom);
  const marginLeft = pxToScreen(pageConfig.margins.left);

  const scaledWidth = paperDimensions.width * (zoom / 100);
  const scaledHeight = paperDimensions.height * (zoom / 100);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Zoom toolbar */}
      <div className="flex items-center justify-end px-3 py-1.5 bg-[#f5f5f5] border-b border-border/50 shrink-0" data-testid="zoom-toolbar">
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm px-3 py-1.5 border">
          <span className="text-sm text-muted-foreground" data-testid="zoom-level-display">
            {zoom}%
          </span>
          <div className="h-4 w-px bg-border" />
          <Button variant="ghost" size="sm" onClick={handleFit} className="h-7 px-2 text-xs">
            Fit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onZoomChange(100)} className="h-7 px-2 text-xs">
            100%
          </Button>
          {ZOOM_LEVELS.map((level) => (
            <Button
              key={level}
              variant={zoom === level ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onZoomChange(level)}
              className="h-7 px-2 text-xs"
            >
              {level}%
            </Button>
          ))}
        </div>
      </div>

      {/* Scrollable workspace */}
      <div
        ref={workspaceRef}
        className="flex-1 overflow-auto bg-[#f5f5f5] flex justify-center items-start py-8 px-4"
        onWheel={handleWheel}
        data-testid="canvas-workspace"
      >
        {/* Scaled wrapper - matches visual size to prevent extra scroll */}
        <div
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            flexShrink: 0,
          }}
        >
          {/* Paper sheet */}
          <div
            className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-200 relative"
            style={{
              width: `${paperDimensions.width}px`,
              height: `${paperDimensions.height}px`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
            }}
            data-testid="paper-sheet"
          >
          {/* Margin guides */}
          <div
            className="absolute pointer-events-none border border-dashed"
            style={{
              top: `${marginTop}px`,
              right: `${marginRight}px`,
              bottom: `${marginBottom}px`,
              left: `${marginLeft}px`,
              borderColor: 'rgba(0,0,0,0.1)',
            }}
            data-testid="margin-guides"
          />

          {/* Header area */}
          {headerEnabled && (
            <div
              className="absolute flex items-center justify-between px-2 border-b"
              style={{
                top: `${marginTop}px`,
                left: `${marginLeft}px`,
                right: `${marginRight}px`,
                height: `${headerHeightPx}px`,
                borderColor: headerFooterConfig?.header?.bottomBorder?.enabled
                  ? (headerFooterConfig?.header?.bottomBorder?.color ?? '#e5e7eb')
                  : 'transparent',
                backgroundColor: headerFooterConfig?.header?.backgroundColor ?? 'transparent',
              }}
              data-testid="header-area"
            >
              <div className="text-xs text-muted-foreground">Header</div>
            </div>
          )}

          {/* Content area - respects margins and header/footer */}
          <div
            className="absolute overflow-hidden"
            style={{
              top: `${marginTop + headerHeightPx}px`,
              right: `${marginRight}px`,
              bottom: `${marginBottom + footerHeightPx}px`,
              left: `${marginLeft}px`,
            }}
            data-testid="content-area"
          >
            {children}
          </div>

          {/* Footer area */}
          {footerEnabled && (
            <div
              className="absolute flex items-center justify-between px-2 border-t"
              style={{
                bottom: `${marginBottom}px`,
                left: `${marginLeft}px`,
                right: `${marginRight}px`,
                height: `${footerHeightPx}px`,
                borderColor: headerFooterConfig?.footer?.topBorder?.enabled
                  ? (headerFooterConfig?.footer?.topBorder?.color ?? '#e5e7eb')
                  : 'transparent',
                backgroundColor: headerFooterConfig?.footer?.backgroundColor ?? 'transparent',
              }}
              data-testid="footer-area"
            >
              <div className="text-xs text-muted-foreground">Footer</div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
