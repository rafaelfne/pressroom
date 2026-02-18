/**
 * Server-safe Puck configuration for SSR rendering
 *
 * This config mirrors the editor config but replaces DropZone-based components
 * with server-safe render functions. DropZone uses React context only available
 * in the Puck editor and cannot be used in server-side rendering.
 *
 * Key differences from editor config:
 * - GridRow, GridColumn, Container, Section: Replace <DropZone> with placeholder divs
 * - Puck's <Render> component resolves zone children from data tree, so these
 *   components only need to provide the structural wrapper
 *
 * @example Usage in html-generator.ts
 * ```typescript
 * import { serverPuckConfig } from '@/lib/puck/server-config';
 * import { Render } from '@puckeditor/core';
 * import { renderToStaticMarkup } from 'react-dom/server';
 *
 * const element = createElement(Render, {
 *   config: serverPuckConfig, // Use server config instead of editor config
 *   data: templateData,
 * });
 * const html = renderToStaticMarkup(element);
 * ```
 */

import type { Config, ComponentConfig } from '@puckeditor/core';
import { puckConfig } from './config';
import type { GridRowProps } from '@/components/report-components/grid-row';
import type { GridColumnProps } from '@/components/report-components/grid-column';
import type { ContainerProps } from '@/components/report-components/container';
import type { SectionProps } from '@/components/report-components/section';
import { getPageBreakStyle } from '@/lib/utils/page-break';

// Column configuration for GridRow (copied from grid-row.tsx for server use)
type ColumnConfig = {
  template: string;
  count: number;
};

const columnMap: Record<Exclude<GridRowProps['columns'], 'custom'>, ColumnConfig> = {
  '2-equal': { template: '1fr 1fr', count: 2 },
  '3-equal': { template: '1fr 1fr 1fr', count: 3 },
  '4-equal': { template: '1fr 1fr 1fr 1fr', count: 4 },
  '1-3_2-3': { template: '1fr 2fr', count: 2 },
  '2-3_1-3': { template: '2fr 1fr', count: 2 },
};

// Shadow map for Container (copied from container.tsx for server use)
const shadowMap: Record<ContainerProps['shadow'], string> = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.15)',
};

// Vertical align map for GridColumn (copied from grid-column.tsx for server use)
const verticalAlignMap: Record<GridColumnProps['verticalAlign'], string> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
};

/**
 * Server-safe GridRow render function
 * Replaces DropZone with placeholder divs that Puck's <Render> can populate
 */
const serverGridRow: ComponentConfig<GridRowProps> = {
  ...puckConfig.components.GridRow,
  render: ({ columns, customColumns, gap, pageBreakBehavior, puck }) => {
    let template: string;
    let count: number;

    if (columns === 'custom') {
      template = customColumns || '1fr 1fr';

      // Parse column count from the template string
      const repeatMatch = template.match(/^repeat\(\s*(\d+)\s*,/);
      if (repeatMatch) {
        // Handle repeat(N, ...) syntax
        count = parseInt(repeatMatch[1], 10);
      } else if (/[(),]/.test(template)) {
        // Other complex syntax (minmax, fit-content, etc.) — fall back to 2
        count = 2;
      } else {
        // Simple space-separated values like "1fr 2fr 1fr"
        count = template.split(/\s+/).filter(Boolean).length;
      }
    } else {
      const config = columnMap[columns];
      template = config.template;
      count = config.count;
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: template,
          gap: `${gap}px`,
          ...getPageBreakStyle(pageBreakBehavior),
        }}
      >
        {Array.from({ length: count }, (_, i) => (
          <div key={i} style={{ minHeight: '40px' }}>
            {puck.renderDropZone({ zone: `${puck.id}-column-${i}` })}
          </div>
        ))}
      </div>
    );
  },
};

/**
 * Server-safe GridColumn render function
 * Replaces DropZone with placeholder div that Puck's <Render> can populate
 */
const serverGridColumn: ComponentConfig<GridColumnProps> = {
  ...puckConfig.components.GridColumn,
  render: ({ backgroundColor, padding, borderWidth, borderColor, verticalAlign, pageBreakBehavior, puck }) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: verticalAlignMap[verticalAlign],
        backgroundColor,
        padding: `${padding}px`,
        borderWidth: `${borderWidth}px`,
        borderStyle: borderWidth !== '0' ? 'solid' : 'none',
        borderColor,
        ...getPageBreakStyle(pageBreakBehavior),
      }}
    >
      {puck.renderDropZone({ zone: `${puck.id}-content` })}
    </div>
  ),
};

/**
 * Server-safe Container render function
 * Replaces DropZone with placeholder div that Puck's <Render> can populate
 */
const serverContainer: ComponentConfig<ContainerProps> = {
  ...puckConfig.components.Container,
  render: ({ padding, borderWidth, borderColor, borderRadius, backgroundColor, shadow, minHeight, pageBreakBehavior, puck }) => (
    <div
      style={{
        padding: `${padding}px`,
        borderWidth: `${borderWidth}px`,
        borderStyle: borderWidth !== '0' ? 'solid' : 'none',
        borderColor,
        borderRadius: `${borderRadius}px`,
        backgroundColor,
        boxShadow: shadowMap[shadow],
        minHeight: `${minHeight}px`,
        ...getPageBreakStyle(pageBreakBehavior),
      }}
    >
      {puck.renderDropZone({ zone: `${puck.id}-content` })}
    </div>
  ),
};

/**
 * Server-safe Section render function
 * Replaces DropZone with placeholder div that Puck's <Render> can populate
 */
const serverSection: ComponentConfig<SectionProps> = {
  ...puckConfig.components.Section,
  render: ({ title, showDivider, backgroundColor, padding, pageBreakBehavior, puck }) => (
    <div
      role="region"
      aria-label={title}
      style={{
        backgroundColor,
        padding: `${padding}px`,
        ...getPageBreakStyle(pageBreakBehavior),
      }}
    >
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          marginBottom: '8px',
          pageBreakAfter: 'avoid',
        }}
      >
        {title}
      </h2>
      {showDivider === 'true' && (
        <hr
          style={{
            borderTop: '1px solid #e5e7eb',
            borderBottom: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            marginBottom: '12px',
            marginTop: 0,
          }}
        />
      )}
      {puck.renderDropZone({ zone: `${puck.id}-content` })}
    </div>
  ),
};

/**
 * Server-safe Puck configuration
 *
 * Use this config when rendering templates server-side (e.g., in PDF generation,
 * preview rendering, or API responses). The editor should continue to use the
 * standard `puckConfig` from './config'.
 *
 * All other components (TextBlock, ChartBlock, etc.) work identically in both
 * editor and server contexts, so they're re-exported from the base config.
 */
export const serverPuckConfig: Config = {
  ...puckConfig,
  components: {
    ...puckConfig.components,
    // Override DropZone-dependent components with server-safe versions
    GridRow: serverGridRow,
    GridColumn: serverGridColumn,
    Container: serverContainer,
    Section: serverSection,
    // All other components are server-safe as-is:
    // TextBlock, HeadingBlock, ImageBlock, Spacer, Divider, PageBreak,
    // ReportHeader, ReportFooter, DataTable, ChartBlock
  },
};
