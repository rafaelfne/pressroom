import type { PdfRenderOptions } from '@/lib/rendering/pdf-renderer';

// ============================================================================
// Types
// ============================================================================

export type PaperSize = 'A4' | 'Letter' | 'Legal' | 'A3' | 'Custom';
export type Orientation = 'portrait' | 'landscape';
export type MarginPreset = 'normal' | 'narrow' | 'wide' | 'custom';

export interface PageMargins {
  top: number; // in px (72 DPI)
  right: number;
  bottom: number;
  left: number;
}

export interface PageConfig {
  paperSize: PaperSize;
  orientation: Orientation;
  margins: PageMargins;
  customWidth?: number; // in px (72 DPI), only when paperSize === 'Custom'
  customHeight?: number; // in px (72 DPI), only when paperSize === 'Custom'
}

// ============================================================================
// Constants
// ============================================================================

// Paper size dimensions in pixels at 72 DPI (width × height in portrait)
// 72 DPI is the standard PDF/print resolution
export const PAPER_SIZES: Record<
  Exclude<PaperSize, 'Custom'>,
  { width: number; height: number; label: string }
> = {
  A4: { width: 595, height: 842, label: 'A4 (595 × 842 px)' },
  Letter: { width: 612, height: 792, label: 'Letter (612 × 792 px)' },
  Legal: { width: 612, height: 1008, label: 'Legal (612 × 1008 px)' },
  A3: { width: 842, height: 1191, label: 'A3 (842 × 1191 px)' },
};

// Margin presets in pixels at 72 DPI
export const MARGIN_PRESETS: Record<
  Exclude<MarginPreset, 'custom'>,
  { margins: PageMargins; label: string }
> = {
  normal: {
    margins: { top: 16, right: 16, bottom: 16, left: 16 },
    label: 'Normal (16px)',
  },
  narrow: {
    margins: { top: 8, right: 8, bottom: 8, left: 8 },
    label: 'Narrow (8px)',
  },
  wide: {
    margins: { top: 24, right: 24, bottom: 24, left: 24 },
    label: 'Wide (24px)',
  },
};

export const DEFAULT_PAGE_CONFIG: PageConfig = {
  paperSize: 'A4',
  orientation: 'portrait',
  margins: { top: 16, right: 16, bottom: 16, left: 16 },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Returns the actual page dimensions in pixels (72 DPI), accounting for orientation.
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
 * Converts pixels (72 DPI) to millimeters.
 * Formula: mm = px * 25.4 / 72
 */
export function pxToMm(px: number): number {
  return px * 25.4 / 72;
}

/**
 * Converts a PageConfig into PdfRenderOptions compatible with Puppeteer.
 * - Named paper sizes: set format field directly
 * - Custom paper size: converts pixels to mm strings
 * - Margins: converts pixels to mm strings
 */
export function pageConfigToRenderOptions(
  config: PageConfig,
): PdfRenderOptions {
  const options: PdfRenderOptions = {
    orientation: config.orientation,
    margin: {
      top: `${pxToMm(config.margins.top).toFixed(2)}mm`,
      right: `${pxToMm(config.margins.right).toFixed(2)}mm`,
      bottom: `${pxToMm(config.margins.bottom).toFixed(2)}mm`,
      left: `${pxToMm(config.margins.left).toFixed(2)}mm`,
    },
  };

  if (config.paperSize === 'Custom') {
    // Use custom dimensions or fall back to A4
    const width = config.customWidth ?? PAPER_SIZES.A4.width;
    const height = config.customHeight ?? PAPER_SIZES.A4.height;
    options.width = `${pxToMm(width).toFixed(2)}mm`;
    options.height = `${pxToMm(height).toFixed(2)}mm`;
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
// Pixel Conversions (72 DPI base)
// ============================================================================

/**
 * Pixels per inch at the base resolution (72 DPI - standard PDF/print).
 */
export const DPI = 72;

/**
 * Standard screen DPI for display purposes.
 */
export const SCREEN_DPI = 72;

/**
 * Conversion factor from 72 DPI to 96 DPI screen pixels.
 */
export const DPI_TO_SCREEN = SCREEN_DPI / DPI;

/**
 * Conversion factor from millimeters to pixels at 72 DPI.
 * 72 DPI = 72 pixels per inch, 1 inch = 25.4 mm
 * Therefore: 1 mm = 72 / 25.4 = 2.834645669 px
 */
export const MM_TO_PX = 72 / 25.4;

/**
 * Converts millimeters to pixels at 72 DPI, rounded to the nearest integer.
 */
export function mmToPx(mm: number): number {
  return Math.round(mm * MM_TO_PX);
}

/**
 * Converts 72 DPI pixels to 96 DPI screen pixels for display purposes.
 */
export function pxToScreen(px: number): number {
  return Math.round(px * DPI_TO_SCREEN);
}

/**
 * Returns page dimensions in screen pixels (at 96 DPI) for display in the canvas.
 * Converts from stored 72 DPI pixels to 96 DPI screen pixels.
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
