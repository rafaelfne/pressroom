'use client';

import { useCallback, useRef } from 'react';
import { PageConfig, getPageDimensionsPx, mmToPx, ZOOM_LEVELS } from '@/lib/types/page-config';
import { Button } from '@/components/ui/button';

const MIN_ZOOM = 50;
const MAX_ZOOM = 150;
const SCROLL_ZOOM_STEP = 25;
const FIT_ZOOM_ROUNDING = 5;
const FIT_PADDING_PX = 64;

export interface PaperCanvasProps {
  pageConfig: PageConfig;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  children: React.ReactNode;
}

export function PaperCanvas({ pageConfig, zoom, onZoomChange, children }: PaperCanvasProps) {
  const workspaceRef = useRef<HTMLDivElement>(null);

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

  // Margin calculations
  const marginTop = mmToPx(pageConfig.margins.top);
  const marginRight = mmToPx(pageConfig.margins.right);
  const marginBottom = mmToPx(pageConfig.margins.bottom);
  const marginLeft = mmToPx(pageConfig.margins.left);

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      {/* Zoom toolbar */}
      <div className="absolute top-2 right-2 z-10" data-testid="zoom-toolbar">
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-md px-3 py-2 border">
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
        className="flex-1 overflow-auto bg-[#F1F1F1] flex justify-center items-start py-8 px-4"
        onWheel={handleWheel}
        data-testid="canvas-workspace"
      >
        {/* Paper sheet */}
        <div
          className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-200 relative"
          style={{
            width: `${paperDimensions.width}px`,
            height: `${paperDimensions.height}px`,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
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

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
