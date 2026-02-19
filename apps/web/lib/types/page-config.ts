import type { PdfRenderOptions } from '@/lib/rendering/pdf-renderer';

// ============================================================================
// Types
// ============================================================================

export type PaperSize = 'A4' | 'Letter' | 'Legal' | 'A3' | 'Custom';
export type Orientation = 'portrait' | 'landscape';
export type MarginPreset = 'normal' | 'narrow' | 'wide' | 'custom';

export interface PageMargins {
  top: number; // in px (96 DPI)
  right: number;
  bottom: number;
  left: number;
}

export interface PageConfig {
  paperSize: PaperSize;
  orientation: Orientation;
  margins: PageMargins;
  customWidth?: number; // in px (96 DPI), only when paperSize === 'Custom'
  customHeight?: number; // in px (96 DPI), only when paperSize === 'Custom'
}

// ============================================================================
// Constants
// ============================================================================

// Paper size dimensions in pixels at 96 DPI (width × height in portrait)
// 96 DPI is the standard screen resolution used throughout the studio
export const PAPER_SIZES: Record<
  Exclude<PaperSize, 'Custom'>,
  { width: number; height: number; label: string }
> = {
  A4: { width: 794, height: 1123, label: 'A4 (794 × 1123 px)' },
  Letter: { width: 816, height: 1056, label: 'Letter (816 × 1056 px)' },
  Legal: { width: 816, height: 1344, label: 'Legal (816 × 1344 px)' },
  A3: { width: 1123, height: 1587, label: 'A3 (1123 × 1587 px)' },
};

// Margin presets in pixels at 96 DPI
export const MARGIN_PRESETS: Record<
  Exclude<MarginPreset, 'custom'>,
  { margins: PageMargins; label: string }
> = {
  normal: {
    margins: { top: 21, right: 21, bottom: 21, left: 21 },
    label: 'Normal (21px)',
  },
  narrow: {
    margins: { top: 11, right: 11, bottom: 11, left: 11 },
    label: 'Narrow (11px)',
  },
  wide: {
    margins: { top: 32, right: 32, bottom: 32, left: 32 },
    label: 'Wide (32px)',
  },
};

export const DEFAULT_PAGE_CONFIG: PageConfig = {
  paperSize: 'A4',
  orientation: 'portrait',
  margins: { top: 21, right: 21, bottom: 21, left: 21 },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Returns the actual page dimensions in pixels (96 DPI), accounting for orientation.
 * Swaps width/height for landscape. For Custom, uses customWidth/customHeight
 * or falls back to A4 dimensions.
 */
export function getPageDimensions(config: PageConfig): {
  width: number;
  height: number;
} {
  let width: number;
  let height: number;

  if (config.paperSize === 'Custom') {
    // Use custom dimensions or fall back to A4
    width = config.customWidth ?? PAPER_SIZES.A4.width;
    height = config.customHeight ?? PAPER_SIZES.A4.height;
  } else {
    const paperSize = PAPER_SIZES[config.paperSize];
    width = paperSize.width;
    height = paperSize.height;
  }

  // Swap dimensions for landscape orientation
  if (config.orientation === 'landscape') {
    return { width: height, height: width };
  }

  return { width, height };
}

/**
 * Detects which margin preset matches the given margins, or returns 'custom'
 * if no match is found.
 */
export function detectMarginPreset(margins: PageMargins): MarginPreset {
  const presets = Object.entries(MARGIN_PRESETS) as [
    Exclude<MarginPreset, 'custom'>,
    { margins: PageMargins; label: string },
  ][];

  for (const [presetName, preset] of presets) {
    if (
      margins.top === preset.margins.top &&
      margins.right === preset.margins.right &&
      margins.bottom === preset.margins.bottom &&
      margins.left === preset.margins.left
    ) {
      return presetName;
    }
  }

  return 'custom';
}

/**
 * Converts pixels (96 DPI) to millimeters.
 * The studio works exclusively in pixels at 96 DPI. This function provides
 * the precise conversion used when generating PDF output via Puppeteer.
 * Formula: mm = px * 25.4 / 96
 */
export function pxToMm(px: number): number {
  return px * 25.4 / 96;
}

/**
 * Converts a PageConfig (pixel-based, 96 DPI) into PdfRenderOptions (mm-based)
 * compatible with Puppeteer.
 * - Named paper sizes: set format field directly (Puppeteer handles sizing)
 * - Custom paper size: converts 96 DPI pixels to mm strings
 * - Margins: converts 96 DPI pixels to mm strings with 4 decimal places
 *   to preserve precision through the rendering pipeline
 */
export function pageConfigToRenderOptions(
  config: PageConfig,
): PdfRenderOptions {
  const options: PdfRenderOptions = {
    orientation: config.orientation,
    margin: {
      top: `${pxToMm(config.margins.top).toFixed(4)}mm`,
      right: `${pxToMm(config.margins.right).toFixed(4)}mm`,
      bottom: `${pxToMm(config.margins.bottom).toFixed(4)}mm`,
      left: `${pxToMm(config.margins.left).toFixed(4)}mm`,
    },
  };

  if (config.paperSize === 'Custom') {
    // Use custom dimensions or fall back to A4
    const width = config.customWidth ?? PAPER_SIZES.A4.width;
    const height = config.customHeight ?? PAPER_SIZES.A4.height;
    options.width = `${pxToMm(width).toFixed(4)}mm`;
    options.height = `${pxToMm(height).toFixed(4)}mm`;
  } else {
    // Use named format
    options.format = config.paperSize;
  }

  return options;
}

/** Override type that allows partial margins for per-page overrides */
export type PageConfigOverride = Partial<Omit<PageConfig, 'margins'>> & {
  margins?: Partial<PageMargins>;
};

/**
 * Merges a per-page override with template defaults.
 * If override is undefined/empty, returns base.
 * Margins are merged individually (override.margins.top overrides base.margins.top, etc).
 */
export function mergePageConfig(
  base: PageConfig,
  override?: PageConfigOverride,
): PageConfig {
  if (!override) {
    return base;
  }

  // Safely merge margins, supporting Partial<PageMargins>
  const overrideMargins = override.margins ?? {};
  const margins: PageMargins = {
    top: overrideMargins.top ?? base.margins.top,
    right: overrideMargins.right ?? base.margins.right,
    bottom: overrideMargins.bottom ?? base.margins.bottom,
    left: overrideMargins.left ?? base.margins.left,
  };

  return {
    paperSize: override.paperSize ?? base.paperSize,
    orientation: override.orientation ?? base.orientation,
    margins,
    customWidth: override.customWidth ?? base.customWidth,
    customHeight: override.customHeight ?? base.customHeight,
  };
}

/**
 * Parse a stored page config (from database JSON) into a valid PageConfig.
 * Merges the stored partial config with DEFAULT_PAGE_CONFIG defaults.
 * Returns DEFAULT_PAGE_CONFIG if stored is null/undefined/not an object.
 */
export function parseStoredPageConfig(
  stored: unknown,
): PageConfig {
  if (!stored || typeof stored !== 'object') {
    return DEFAULT_PAGE_CONFIG;
  }

  const data = stored as Record<string, unknown>;
  return mergePageConfig(DEFAULT_PAGE_CONFIG, {
    paperSize: typeof data.paperSize === 'string' ? data.paperSize as PaperSize : undefined,
    orientation: typeof data.orientation === 'string' ? data.orientation as Orientation : undefined,
    margins: data.margins && typeof data.margins === 'object'
      ? data.margins as Partial<PageMargins>
      : undefined,
    customWidth: typeof data.customWidth === 'number' ? data.customWidth : undefined,
    customHeight: typeof data.customHeight === 'number' ? data.customHeight : undefined,
  });
}

// ============================================================================
// Pixel Conversions (96 DPI base)
// ============================================================================

/**
 * Pixels per inch at the base resolution (96 DPI - standard screen pixels).
 */
export const DPI = 96;

/**
 * Standard screen DPI for display purposes.
 */
export const SCREEN_DPI = 96;

/**
 * Conversion factor from 96 DPI to 96 DPI screen pixels.
 */
export const DPI_TO_SCREEN = SCREEN_DPI / DPI;

/**
 * Conversion factor from millimeters to pixels at 96 DPI.
 * 96 DPI = 96 pixels per inch, 1 inch = 25.4 mm
 * Therefore: 1 mm = 96 / 25.4 = 3.779527559 px
 */
export const MM_TO_PX = 96 / 25.4;

/**
 * Converts millimeters to pixels at 96 DPI, rounded to the nearest integer.
 */
export function mmToPx(mm: number): number {
  return Math.round(mm * MM_TO_PX);
}

/**
 * Converts 96 DPI pixels to screen pixels for display purposes.
 * Since the system now uses 96 DPI throughout, this is a 1:1 mapping.
 */
export function pxToScreen(px: number): number {
  return Math.round(px * DPI_TO_SCREEN);
}

/**
 * Returns page dimensions in screen pixels (at 96 DPI) for display in the canvas.
 * Since the system uses 96 DPI throughout, this returns the same dimensions.
 */
export function getPageDimensionsPx(config: PageConfig): {
  width: number;
  height: number;
} {
  const dims = getPageDimensions(config);
  return {
    width: pxToScreen(dims.width),
    height: pxToScreen(dims.height),
  };
}

/**
 * Available zoom levels for page preview (in percentage).
 */
export const ZOOM_LEVELS = [50, 75, 100, 125, 150] as const;

/**
 * Type representing a valid zoom level.
 */
export type ZoomLevel = typeof ZOOM_LEVELS[number];
