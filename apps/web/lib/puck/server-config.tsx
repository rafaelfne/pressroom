/**
 * Server-safe Puck configuration for SSR/PDF rendering.
 *
 * This file intentionally does NOT import from './config' or 'chart-block.tsx',
 * because chart-block.tsx imports recharts which fails in the RSC/Turbopack
 * server bundle context.
 *
 * Components that use React hooks (useStyleGuide, useInheritedStyles) in their
 * client render functions are overridden here with server-safe renders that call
 * resolveStylableValue() directly (no hooks). In server rendering, token values
 * cannot be resolved — only inline/string values pass through.
 */

import type { Config } from '@puckeditor/core';
import { TextBlock, type TextBlockProps } from '@/components/report-components/text-block';
import { HeadingBlock, type HeadingBlockProps } from '@/components/report-components/heading-block';
import { ImageBlock, type ImageBlockProps } from '@/components/report-components/image-block';
import { Spacer, type SpacerProps } from '@/components/report-components/spacer';
import { Divider, type DividerProps } from '@/components/report-components/divider';
import { PageBreak } from '@/components/report-components/page-break';
import { DataTable } from '@/components/report-components/data-table';
import { renderDataTableBody, type DataTableProps } from '@/components/report-components/data-table-body';
import { Container, type ContainerProps } from '@/components/report-components/container';
import { GridRow, type GridRowProps } from '@/components/report-components/grid-row';
import { GridColumn, type GridColumnProps } from '@/components/report-components/grid-column';
import { Section, type SectionProps } from '@/components/report-components/section';
import { ServerChartBlock } from '@/components/report-components/server-chart-block';
import { FlexBox, type FlexBoxProps } from '@/components/report-components/flex-box';
import { resolveStylableValue, resolveSpacing, type SpacingValue } from '@/lib/types/style-system';
import { getPageBreakStyle } from '@/lib/utils/page-break';
import { googleFontUrl } from '@/lib/utils/google-fonts';

// ============================================================================
// Server-safe render overrides for components that use hooks in their client
// render functions. These replicate the rendering logic without any React hooks.
// ============================================================================

const ServerTextBlock = {
  ...TextBlock,
  render: ({
    text,
    fontSize,
    customFontSize,
    lineHeight,
    customLineHeight,
    letterSpacing,
    customLetterSpacing,
    fontFamily,
    customFontFamily,
    color,
    alignment,
    bold,
    italic,
    pageBreakBehavior,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
  }: TextBlockProps) => {
    const resolvedFontSize = fontSize === 'custom' ? `${customFontSize}px` : fontSize;
    const resolvedLineHeight = lineHeight === 'custom' ? customLineHeight : Number(lineHeight);
    const resolvedLetterSpacing = letterSpacing === 'custom' ? `${customLetterSpacing}px` : letterSpacing;
    const resolvedFontFamily = fontFamily === 'custom' ? customFontFamily : fontFamily;
    const resolvedColor = resolveStylableValue(color) ?? '#000000';
    const resolvedMarginTop = resolveStylableValue(marginTop) ?? '0';
    const resolvedMarginRight = resolveStylableValue(marginRight) ?? '0';
    const resolvedMarginBottom = resolveStylableValue(marginBottom) ?? '0';
    const resolvedMarginLeft = resolveStylableValue(marginLeft) ?? '0';

    return (
      <>
        {resolvedFontFamily && (
          <link rel="stylesheet" href={googleFontUrl(resolvedFontFamily)} />
        )}
        <div
          style={{
            fontSize: resolvedFontSize,
            lineHeight: resolvedLineHeight,
            letterSpacing: resolvedLetterSpacing,
            fontFamily: resolvedFontFamily ? `"${resolvedFontFamily}", sans-serif` : undefined,
            color: resolvedColor,
            textAlign: alignment,
            fontWeight: bold === 'true' ? 'bold' : 'normal',
            fontStyle: italic === 'true' ? 'italic' : 'normal',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            marginTop: resolvedMarginTop,
            marginRight: resolvedMarginRight,
            marginBottom: resolvedMarginBottom,
            marginLeft: resolvedMarginLeft,
            ...getPageBreakStyle(pageBreakBehavior),
          }}
          className="p-2"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </>
    );
  },
};

const ServerHeadingBlock = {
  ...HeadingBlock,
  render: ({
    text,
    level,
    color,
    fontFamily,
    pageBreakBehavior,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
  }: HeadingBlockProps) => {
    const Tag = level;
    const resolvedColor = resolveStylableValue(color) ?? '#000000';
    const resolvedFontFamily = resolveStylableValue(fontFamily) ?? '';
    const resolvedMarginTop = resolveStylableValue(marginTop) ?? '0';
    const resolvedMarginRight = resolveStylableValue(marginRight) ?? '0';
    const resolvedMarginBottom = resolveStylableValue(marginBottom) ?? '0';
    const resolvedMarginLeft = resolveStylableValue(marginLeft) ?? '0';

    return (
      <Tag
        style={{
          color: resolvedColor,
          fontFamily: resolvedFontFamily ? `"${resolvedFontFamily}", sans-serif` : undefined,
          marginTop: resolvedMarginTop,
          marginRight: resolvedMarginRight,
          marginBottom: resolvedMarginBottom,
          marginLeft: resolvedMarginLeft,
          ...getPageBreakStyle(pageBreakBehavior),
        }}
        className="p-2"
      >
        {text}
      </Tag>
    );
  },
};

const ServerDivider = {
  ...Divider,
  render: ({ orientation, color, thickness, lineStyle, pageBreakBehavior }: DividerProps) => {
    const resolvedColor = resolveStylableValue(color) ?? '#e5e7eb';
    const resolvedThickness = resolveStylableValue(thickness) ?? '1';
    const thicknessCss = /[a-z%]/i.test(resolvedThickness) ? resolvedThickness : `${resolvedThickness}px`;

    if (orientation === 'vertical') {
      return (
        <div
          style={{
            display: 'inline-block',
            width: thicknessCss,
            alignSelf: 'stretch',
            minHeight: '24px',
            borderLeft: `${thicknessCss} ${lineStyle} ${resolvedColor}`,
            ...getPageBreakStyle(pageBreakBehavior),
          }}
          className="mx-2"
          role="separator"
          aria-orientation="vertical"
        />
      );
    }

    return (
      <hr
        style={{
          borderTop: `${thicknessCss} ${lineStyle} ${resolvedColor}`,
          borderBottom: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          ...getPageBreakStyle(pageBreakBehavior),
        }}
        className="my-2"
      />
    );
  },
};

const ServerSection = {
  ...Section,
  render: ({
    title,
    showDivider,
    backgroundColor,
    padding,
    pageBreakBehavior,
    puck,
    id = 'section',
  }: SectionProps & { puck: { renderDropZone: (opts: { zone: string }) => React.ReactNode }; id?: string }) => {
    const resolvedBackgroundColor = resolveStylableValue(backgroundColor) ?? 'transparent';
    const resolvedPadding = resolveStylableValue(padding) ?? '16';
    const paddingCss = /[a-z%]/i.test(resolvedPadding) ? resolvedPadding : `${resolvedPadding}px`;

    return (
      <div
        role="region"
        aria-label={title}
        style={{
          backgroundColor: resolvedBackgroundColor,
          padding: paddingCss,
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
        {puck.renderDropZone({ zone: `${id}-content` })}
      </div>
    );
  },
};

const serverVerticalAlignMap: Record<string, string> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
};

const ServerGridColumn = {
  ...GridColumn,
  render: ({
    backgroundColor,
    padding,
    borderWidth,
    borderColor,
    verticalAlign,
    pageBreakBehavior,
    puck,
    id = 'grid-column',
  }: GridColumnProps & { puck: { renderDropZone: (opts: { zone: string }) => React.ReactNode }; id?: string }) => {
    const resolvedBackgroundColor = resolveStylableValue(backgroundColor) ?? 'transparent';
    const resolvedBorderColor = resolveStylableValue(borderColor) ?? '#e5e7eb';
    const resolvedBorderWidth = resolveStylableValue(borderWidth) ?? '0';
    const resolvedPadding = resolveStylableValue(padding) ?? '0';

    const addPx = (v: string) => /[a-z%]/i.test(v) ? v : `${v}px`;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: serverVerticalAlignMap[verticalAlign] || 'flex-start',
          backgroundColor: resolvedBackgroundColor,
          padding: addPx(resolvedPadding),
          borderWidth: addPx(resolvedBorderWidth),
          borderStyle: resolvedBorderWidth !== '0' ? 'solid' : 'none',
          borderColor: resolvedBorderColor,
          ...getPageBreakStyle(pageBreakBehavior),
        }}
      >
        {puck.renderDropZone({ zone: `${id}-content` })}
      </div>
    );
  },
};

const ServerDataTable = {
  ...DataTable,
  render: (props: DataTableProps) => {
    return renderDataTableBody(props, {
      rHeaderBgColor: resolveStylableValue(props.headerBgColor) ?? '#f3f4f6',
      rHeaderTextColor: resolveStylableValue(props.headerTextColor) ?? '#111827',
      rHeaderBorderColor: resolveStylableValue(props.headerBorderColor) ?? '#d1d5db',
      rHeaderFontSize: resolveStylableValue(props.headerFontSize) ?? '',
      rHeaderFontWeight: resolveStylableValue(props.headerFontWeight) ?? '600',
      rHeaderFontFamily: resolveStylableValue(props.headerFontFamily) ?? '',
      rHeaderPadding: resolveStylableValue(props.headerPadding) ?? '',
      rGroupHeaderBgColor: resolveStylableValue(props.groupHeaderBgColor) ?? '#1a5632',
      rGroupHeaderTextColor: resolveStylableValue(props.groupHeaderTextColor) ?? '#ffffff',
      rGroupHeaderBorderColor: resolveStylableValue(props.groupHeaderBorderColor) ?? '',
      rGroupHeaderFontSize: resolveStylableValue(props.groupHeaderFontSize) ?? '',
      rGroupHeaderFontWeight: resolveStylableValue(props.groupHeaderFontWeight) ?? 'bold',
      rGroupHeaderFontFamily: resolveStylableValue(props.groupHeaderFontFamily) ?? '',
      rGroupHeaderPadding: resolveStylableValue(props.groupHeaderPadding) ?? '',
      rFooterBgColor: resolveStylableValue(props.footerBgColor) ?? '#f3f4f6',
      rFooterTextColor: resolveStylableValue(props.footerTextColor) ?? '#111827',
      rFooterBorderColor: resolveStylableValue(props.footerBorderColor) ?? '#d1d5db',
      rFooterFontSize: resolveStylableValue(props.footerFontSize) ?? '',
      rFooterFontWeight: resolveStylableValue(props.footerFontWeight) ?? 'bold',
      rFooterFontFamily: resolveStylableValue(props.footerFontFamily) ?? '',
      rFooterPadding: resolveStylableValue(props.footerPadding) ?? '',
      rEvenRowColor: resolveStylableValue(props.evenRowColor) ?? 'transparent',
      rOddRowColor: resolveStylableValue(props.oddRowColor) ?? '#f9fafb',
    });
  },
};

const ServerFlexBox = {
  ...FlexBox,
  render: ({
    direction,
    wrap,
    justifyContent,
    alignItems,
    gap,
    padding,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    backgroundColor,
    borderWidth,
    borderColor,
    borderRadius,
    minHeight,
    pageBreakBehavior,
    puck,
    id = 'flexbox',
  }: FlexBoxProps & { puck: { renderDropZone: (opts: { zone: string }) => React.ReactNode }; id?: string }) => {
    const resolvedBackgroundColor = resolveStylableValue(backgroundColor) ?? 'transparent';
    const resolvedBorderColor = resolveStylableValue(borderColor) ?? '#e5e7eb';
    const resolvedBorderWidth = resolveStylableValue(borderWidth) ?? '0';
    const resolvedBorderRadius = resolveStylableValue(borderRadius) ?? '0';
    const resolvedGap = resolveStylableValue(gap) ?? '0';

    const content = puck.renderDropZone({ zone: `${id}-content` });

    const addPx = (v: string) => /[a-z%]/i.test(v) ? v : `${v}px`;

    const rPadding = resolveStylableValue(padding) ?? '0';
    const rPaddingTop = resolveStylableValue(paddingTop) ?? '';
    const rPaddingRight = resolveStylableValue(paddingRight) ?? '';
    const rPaddingBottom = resolveStylableValue(paddingBottom) ?? '';
    const rPaddingLeft = resolveStylableValue(paddingLeft) ?? '';

    const spacingValue: SpacingValue = (rPaddingTop || rPaddingRight || rPaddingBottom || rPaddingLeft)
      ? { mode: 'individual', top: addPx(rPaddingTop || '0'), right: addPx(rPaddingRight || '0'), bottom: addPx(rPaddingBottom || '0'), left: addPx(rPaddingLeft || '0') }
      : { mode: 'all', all: addPx(rPadding) };
    const finalPadding = resolveSpacing(spacingValue) ?? '0px';

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: direction,
          flexWrap: wrap,
          justifyContent,
          alignItems,
          gap: addPx(resolvedGap),
          padding: finalPadding,
          backgroundColor: resolvedBackgroundColor,
          borderWidth: addPx(resolvedBorderWidth),
          borderStyle: resolvedBorderWidth !== '0' ? 'solid' : 'none',
          borderColor: resolvedBorderColor,
          borderRadius: addPx(resolvedBorderRadius),
          minHeight: `${minHeight}px`,
          ...getPageBreakStyle(pageBreakBehavior),
        }}
      >
        {content}
      </div>
    );
  },
};

const shadowMap: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.15)',
};

const ServerContainer = {
  ...Container,
  render: ({
    padding,
    borderWidth,
    borderColor,
    borderRadius,
    backgroundColor,
    shadow,
    minHeight,
    pageBreakBehavior,
    puck,
    id = 'container',
  }: ContainerProps & { puck: { renderDropZone: (opts: { zone: string }) => React.ReactNode }; id?: string }) => {
    const resolvedBackgroundColor = resolveStylableValue(backgroundColor) ?? 'transparent';
    const resolvedBorderColor = resolveStylableValue(borderColor) ?? '#e5e7eb';
    const resolvedBorderRadius = resolveStylableValue(borderRadius) ?? '0';
    const resolvedBorderWidth = resolveStylableValue(borderWidth) ?? '0';
    const resolvedPadding = resolveStylableValue(padding) ?? '16';

    const addPx = (v: string) => /[a-z%]/i.test(v) ? v : `${v}px`;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: addPx(resolvedPadding),
          borderWidth: addPx(resolvedBorderWidth),
          borderStyle: resolvedBorderWidth !== '0' ? 'solid' : 'none',
          borderColor: resolvedBorderColor,
          borderRadius: resolvedBorderRadius.includes('px') ? resolvedBorderRadius : `${resolvedBorderRadius}px`,
          backgroundColor: resolvedBackgroundColor,
          boxShadow: shadowMap[shadow] ?? 'none',
          minHeight: `${minHeight}px`,
          ...getPageBreakStyle(pageBreakBehavior),
        }}
      >
        {puck.renderDropZone({ zone: `${id}-content` })}
      </div>
    );
  },
};

// ============================================================================
// Server-safe GridRow — replicates column logic from grid-row.tsx without
// relying on the 'use client' module export.
// ============================================================================

const serverColumnMap: Record<string, { template: string; count: number }> = {
  '2-equal': { template: '1fr 1fr', count: 2 },
  '3-equal': { template: '1fr 1fr 1fr', count: 3 },
  '4-equal': { template: '1fr 1fr 1fr 1fr', count: 4 },
  '1-3_2-3': { template: '1fr 2fr', count: 2 },
  '2-3_1-3': { template: '2fr 1fr', count: 2 },
};

const ServerGridRow = {
  ...GridRow,
  render: ({
    columns,
    customColumns,
    gridTemplateRows,
    columnGap,
    rowGap,
    justifyItems,
    alignItems,
    justifyContent,
    alignContent,
    gridAutoFlow,
    gridAutoRows,
    gridAutoColumns,
    height,
    minHeight,
    maxHeight,
    padding,
    pageBreakBehavior,
    puck,
    id = 'grid-row',
  }: GridRowProps & { puck: { renderDropZone: (opts: { zone: string }) => React.ReactNode }; id?: string }) => {
    const optPx = (prop: string, value: string): Record<string, string> =>
      value ? { [prop]: `${value}px` } : {};
    const optRaw = (prop: string, value: string): Record<string, string> =>
      value ? { [prop]: value } : {};

    let template: string;
    let count: number;

    if (columns === 'custom') {
      template = customColumns || '1fr 1fr';
      const repeatMatch = template.match(/^repeat\(\s*(\d+)\s*,/);
      if (repeatMatch) {
        count = parseInt(repeatMatch[1], 10);
      } else if (/[(),]/.test(template)) {
        count = 2;
      } else {
        count = template.split(/\s+/).filter(Boolean).length;
      }
    } else {
      const config = serverColumnMap[columns];
      template = config.template;
      count = config.count;
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: template,
          ...optRaw('gridTemplateRows', gridTemplateRows),
          ...optPx('columnGap', columnGap),
          ...optPx('rowGap', rowGap),
          justifyItems,
          alignItems,
          justifyContent,
          alignContent,
          gridAutoFlow,
          ...optRaw('gridAutoRows', gridAutoRows),
          ...optRaw('gridAutoColumns', gridAutoColumns),
          ...optPx('height', height),
          ...optPx('minHeight', minHeight),
          ...optPx('maxHeight', maxHeight),
          ...optPx('padding', padding),
          ...getPageBreakStyle(pageBreakBehavior),
        }}
      >
        {Array.from({ length: count }, (_, i) => (
          <div key={i} style={{ minHeight: '40px' }}>
            {puck.renderDropZone({ zone: `${id}-column-${i}` })}
          </div>
        ))}
      </div>
    );
  },
};

// ============================================================================
// Server-safe ImageBlock
// ============================================================================

const ServerImageBlock = {
  ...ImageBlock,
  render: ({ src, alt, width, height, pageBreakBehavior }: ImageBlockProps) => (
    <div className="p-2" style={getPageBreakStyle(pageBreakBehavior)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} style={{ width, height, display: 'block' }} />
      ) : (
        <div
          style={{ width: '100%', height: '150px' }}
          className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded bg-gray-50 text-gray-400"
        >
          No image source
        </div>
      )}
    </div>
  ),
};

// ============================================================================
// Server-safe Spacer
// ============================================================================

const ServerSpacer = {
  ...Spacer,
  render: ({ height, pageBreakBehavior }: SpacerProps) => (
    <div style={{ height: `${height}px`, ...getPageBreakStyle(pageBreakBehavior) }} aria-hidden="true" />
  ),
};

export const serverPuckConfig: Config = {
  categories: {
    layout: {
      title: 'Layout',
      components: ['FlexBox', 'Container', 'GridRow', 'GridColumn', 'Section', 'Spacer', 'Divider', 'PageBreak'],
    },
    content: {
      title: 'Content',
      components: ['TextBlock', 'HeadingBlock', 'ImageBlock'],
    },
    data: {
      title: 'Data',
      components: ['DataTable'],
    },
    charts: {
      title: 'Charts',
      components: ['ChartBlock'],
    },
  },
  components: {
    TextBlock: ServerTextBlock,
    HeadingBlock: ServerHeadingBlock,
    ImageBlock: ServerImageBlock,
    Spacer: ServerSpacer,
    Divider: ServerDivider,
    PageBreak,
    DataTable: ServerDataTable,
    ChartBlock: ServerChartBlock,
    Container: ServerContainer,
    GridRow: ServerGridRow,
    GridColumn: ServerGridColumn,
    Section: ServerSection,
    FlexBox: ServerFlexBox,
  } as unknown as Config['components'],
};
