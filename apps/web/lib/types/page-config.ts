import type { PdfRenderOptions } from '@/lib/rendering/pdf-renderer';

// ============================================================================
// Types
// ============================================================================

export type PaperSize = 'A4' | 'Letter' | 'Legal' | 'A3' | 'Custom';
export type Orientation = 'portrait' | 'landscape';
export type MarginPreset = 'normal' | 'narrow' | 'wide' | 'custom';

export interface PageMargins {
  top: number; // in mm
  right: number;
  bottom: number;
  left: number;
}

export interface PageConfig {
  paperSize: PaperSize;
  orientation: Orientation;
  margins: PageMargins;
  customWidth?: number; // in mm, only when paperSize === 'Custom'
  customHeight?: number; // in mm, only when paperSize === 'Custom'
}

// ============================================================================
// Constants
// ============================================================================

// Paper size dimensions in mm (width × height in portrait)
export const PAPER_SIZES: Record<
  Exclude<PaperSize, 'Custom'>,
  { width: number; height: number; label: string }
> = {
  A4: { width: 210, height: 297, label: 'A4 (210 × 297 mm)' },
  Letter: { width: 215.9, height: 279.4, label: 'Letter (8.5 × 11 in)' },
  Legal: { width: 215.9, height: 355.6, label: 'Legal (8.5 × 14 in)' },
  A3: { width: 297, height: 420, label: 'A3 (297 × 420 mm)' },
};

export const MARGIN_PRESETS: Record<
  Exclude<MarginPreset, 'custom'>,
  { margins: PageMargins; label: string }
> = {
  normal: {
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    label: 'Normal (20mm)',
  },
  narrow: {
    margins: { top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 },
    label: 'Narrow (12.7mm)',
  },
  wide: {
    margins: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 },
    label: 'Wide (25.4mm)',
  },
};

export const DEFAULT_PAGE_CONFIG: PageConfig = {
  paperSize: 'A4',
  orientation: 'portrait',
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Returns the actual page dimensions in mm, accounting for orientation.
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
 * Converts a PageConfig into PdfRenderOptions compatible with Puppeteer.
 * - Named paper sizes: set format field directly
 * - Custom paper size: set width and height as mm strings
 * - Margins: converted to mm strings
 */
export function pageConfigToRenderOptions(
  config: PageConfig,
): PdfRenderOptions {
  const options: PdfRenderOptions = {
    orientation: config.orientation,
    margin: {
      top: `${config.margins.top}mm`,
      right: `${config.margins.right}mm`,
      bottom: `${config.margins.bottom}mm`,
      left: `${config.margins.left}mm`,
    },
  };

  if (config.paperSize === 'Custom') {
    // Use custom dimensions or fall back to A4
    const width = config.customWidth ?? PAPER_SIZES.A4.width;
    const height = config.customHeight ?? PAPER_SIZES.A4.height;
    options.width = `${width}mm`;
    options.height = `${height}mm`;
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
// MM to PX Conversion (96 DPI)
// ============================================================================

/**
 * Conversion factor from millimeters to pixels at 96 DPI.
 * 96 DPI = 96 pixels per inch, 1 inch = 25.4 mm
 * Therefore: 1 mm = 96 / 25.4 = 3.7795275591 px
 */
export const MM_TO_PX = 3.7795275591;

/**
 * Converts millimeters to pixels at 96 DPI, rounded to the nearest integer.
 */
export function mmToPx(mm: number): number {
  return Math.round(mm * MM_TO_PX);
}

/**
 * Returns page dimensions in pixels (at 96 DPI) for a given PageConfig.
 * Uses getPageDimensions to get mm dimensions, then converts to px.
 */
export function getPageDimensionsPx(config: PageConfig): {
  width: number;
  height: number;
} {
  const { width, height } = getPageDimensions(config);
  return {
    width: mmToPx(width),
    height: mmToPx(height),
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
