// ============================================================================
// Types
// ============================================================================

/** Zone content type discriminator */
export type ZoneContentType = 'text' | 'image' | 'pageNumber' | 'empty';

/** Page number format options */
export type PageNumberFormat =
  | '{page}'
  | '{page}/{total}'
  | 'Page {page} of {total}';

/** Text zone content with optional formatting */
export interface TextZoneContent {
  type: 'text';
  value: string; // Supports binding expressions like {{company.name}}
  fontSize?: number; // in pt, default 10
  fontWeight?: 'normal' | 'bold';
  color?: string; // hex color
}

/** Image zone content (logo, icon, etc.) */
export interface ImageZoneContent {
  type: 'image';
  src: string; // URL or asset path
  alt?: string;
  height?: number; // in mm, defaults to zone height
}

/** Page number zone content with format options */
export interface PageNumberZoneContent {
  type: 'pageNumber';
  format: PageNumberFormat;
  fontSize?: number; // in pt, default 10
  fontWeight?: 'normal' | 'bold';
  color?: string; // hex color
}

/** Empty zone (no content) */
export interface EmptyZoneContent {
  type: 'empty';
}

/** Union of all zone content types */
export type ZoneContent =
  | TextZoneContent
  | ImageZoneContent
  | PageNumberZoneContent
  | EmptyZoneContent;

/** Border configuration for header/footer */
export interface BorderConfig {
  enabled: boolean;
  color?: string; // hex color, default '#e5e7eb'
  thickness?: number; // in px, default 1
}

/** Header configuration (template-level) */
export interface HeaderConfig {
  enabled: boolean;
  height: number; // in px at 72 DPI, default 43
  zones: {
    left: ZoneContent;
    center: ZoneContent;
    right: ZoneContent;
  };
  bottomBorder?: BorderConfig;
  backgroundColor?: string; // hex color
}

/** Footer configuration (template-level) */
export interface FooterConfig {
  enabled: boolean;
  height: number; // in px at 72 DPI, default 34
  zones: {
    left: ZoneContent;
    center: ZoneContent;
    right: ZoneContent;
  };
  topBorder?: BorderConfig;
  backgroundColor?: string; // hex color
}

/** Combined header/footer config for template storage */
export interface HeaderFooterConfig {
  header?: HeaderConfig;
  footer?: FooterConfig;
}

/** Per-page visibility override */
export interface PageHeaderFooterOverride {
  showHeader?: boolean; // default true
  showFooter?: boolean; // default true
}

// ============================================================================
// Constants
// ============================================================================

/** Default header configuration */
export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  enabled: false,
  height: 43,
  zones: {
    left: { type: 'empty' },
    center: { type: 'empty' },
    right: { type: 'empty' },
  },
  bottomBorder: { enabled: true, color: '#e5e7eb', thickness: 1 },
};

/** Default footer configuration */
export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  enabled: false,
  height: 34,
  zones: {
    left: { type: 'empty' },
    center: { type: 'empty' },
    right: { type: 'empty' },
  },
  topBorder: { enabled: true, color: '#e5e7eb', thickness: 1 },
};

/** Default combined header/footer configuration */
export const DEFAULT_HEADER_FOOTER_CONFIG: HeaderFooterConfig = {
  header: DEFAULT_HEADER_CONFIG,
  footer: DEFAULT_FOOTER_CONFIG,
};

/** Page number format labels for UI */
export const PAGE_NUMBER_FORMATS: {
  value: PageNumberFormat;
  label: string;
}[] = [
  { value: '{page}', label: '1' },
  { value: '{page}/{total}', label: '1/5' },
  { value: 'Page {page} of {total}', label: 'Page 1 of 5' },
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse a stored header/footer config (from database JSON) into a valid
 * HeaderFooterConfig. Merges the stored partial config with defaults.
 * Returns DEFAULT_HEADER_FOOTER_CONFIG if stored is null/undefined/not an object.
 */
export function parseStoredHeaderFooterConfig(
  stored: unknown,
): HeaderFooterConfig {
  if (!stored || typeof stored !== 'object') {
    return DEFAULT_HEADER_FOOTER_CONFIG;
  }

  const data = stored as Record<string, unknown>;

  return {
    header: parseHeaderConfig(data.header),
    footer: parseFooterConfig(data.footer),
  };
}

/**
 * Parse a stored header config. Returns default if invalid.
 */
function parseHeaderConfig(stored: unknown): HeaderConfig {
  if (!stored || typeof stored !== 'object') {
    return DEFAULT_HEADER_CONFIG;
  }

  const data = stored as Record<string, unknown>;

  return {
    enabled: typeof data.enabled === 'boolean' ? data.enabled : false,
    height: typeof data.height === 'number' ? data.height : 43,
    zones: parseZones(data.zones) ?? DEFAULT_HEADER_CONFIG.zones,
    bottomBorder: parseBorderConfig(data.bottomBorder),
    backgroundColor:
      typeof data.backgroundColor === 'string'
        ? data.backgroundColor
        : undefined,
  };
}

/**
 * Parse a stored footer config. Returns default if invalid.
 */
function parseFooterConfig(stored: unknown): FooterConfig {
  if (!stored || typeof stored !== 'object') {
    return DEFAULT_FOOTER_CONFIG;
  }

  const data = stored as Record<string, unknown>;

  return {
    enabled: typeof data.enabled === 'boolean' ? data.enabled : false,
    height: typeof data.height === 'number' ? data.height : 34,
    zones: parseZones(data.zones) ?? DEFAULT_FOOTER_CONFIG.zones,
    topBorder: parseBorderConfig(data.topBorder),
    backgroundColor:
      typeof data.backgroundColor === 'string'
        ? data.backgroundColor
        : undefined,
  };
}

/**
 * Parse zones object containing left, center, right zone content.
 */
function parseZones(
  stored: unknown,
): { left: ZoneContent; center: ZoneContent; right: ZoneContent } | null {
  if (!stored || typeof stored !== 'object') {
    return null;
  }

  const data = stored as Record<string, unknown>;

  const left = parseZoneContent(data.left);
  const center = parseZoneContent(data.center);
  const right = parseZoneContent(data.right);

  if (!left || !center || !right) {
    return null;
  }

  return { left, center, right };
}

/**
 * Parse a single zone content. Returns empty zone if invalid.
 */
function parseZoneContent(stored: unknown): ZoneContent {
  if (!stored || typeof stored !== 'object') {
    return { type: 'empty' };
  }

  const data = stored as Record<string, unknown>;

  switch (data.type) {
    case 'text':
      return {
        type: 'text',
        value: typeof data.value === 'string' ? data.value : '',
        fontSize: typeof data.fontSize === 'number' ? data.fontSize : undefined,
        fontWeight:
          data.fontWeight === 'normal' || data.fontWeight === 'bold'
            ? data.fontWeight
            : undefined,
        color: typeof data.color === 'string' ? data.color : undefined,
      };

    case 'image':
      return {
        type: 'image',
        src: typeof data.src === 'string' ? data.src : '',
        alt: typeof data.alt === 'string' ? data.alt : undefined,
        height: typeof data.height === 'number' ? data.height : undefined,
      };

    case 'pageNumber':
      return {
        type: 'pageNumber',
        format: isValidPageNumberFormat(data.format) ? data.format : '{page}',
        fontSize: typeof data.fontSize === 'number' ? data.fontSize : undefined,
        fontWeight:
          data.fontWeight === 'normal' || data.fontWeight === 'bold'
            ? data.fontWeight
            : undefined,
        color: typeof data.color === 'string' ? data.color : undefined,
      };

    case 'empty':
      return { type: 'empty' };

    default:
      return { type: 'empty' };
  }
}

/**
 * Parse border config. Returns default if invalid.
 */
function parseBorderConfig(stored: unknown): BorderConfig | undefined {
  if (!stored || typeof stored !== 'object') {
    return undefined;
  }

  const data = stored as Record<string, unknown>;

  return {
    enabled: typeof data.enabled === 'boolean' ? data.enabled : true,
    color: typeof data.color === 'string' ? data.color : undefined,
    thickness: typeof data.thickness === 'number' ? data.thickness : undefined,
  };
}

/**
 * Type guard for PageNumberFormat.
 */
function isValidPageNumberFormat(value: unknown): value is PageNumberFormat {
  return (
    value === '{page}' ||
    value === '{page}/{total}' ||
    value === 'Page {page} of {total}'
  );
}

/**
 * Merge per-page header/footer override with template defaults.
 * If override is undefined/empty, returns { showHeader: true, showFooter: true }.
 */
export function mergePageHeaderFooterOverride(
  override?: PageHeaderFooterOverride,
): Required<PageHeaderFooterOverride> {
  return {
    showHeader: override?.showHeader ?? true,
    showFooter: override?.showFooter ?? true,
  };
}
