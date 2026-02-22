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
import { ImageBlock } from '@/components/report-components/image-block';
import { Spacer } from '@/components/report-components/spacer';
import { Divider, type DividerProps } from '@/components/report-components/divider';
import { PageBreak } from '@/components/report-components/page-break';
import { DataTable } from '@/components/report-components/data-table';
import { Container, type ContainerProps } from '@/components/report-components/container';
import { GridRow } from '@/components/report-components/grid-row';
import { GridColumn } from '@/components/report-components/grid-column';
import { Section } from '@/components/report-components/section';
import { ServerChartBlock } from '@/components/report-components/server-chart-block';
import { FlexBox, type FlexBoxProps } from '@/components/report-components/flex-box';
import { resolveStylableValue, resolveSpacing, type SpacingValue } from '@/lib/types/style-system';
import { getPageBreakStyle } from '@/lib/utils/page-break';
import { googleFontUrl } from '@/lib/utils/google-fonts';

// ============================================================================
// Server-safe render overrides for components that use hooks in their client
// render functions. These replicate the rendering logic without any React hooks.
// ============================================================================

const ServerTextBlock: Config['components'][string] = {
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
            marginTop,
            marginRight,
            marginBottom,
            marginLeft,
            ...getPageBreakStyle(pageBreakBehavior),
          }}
          className="p-2"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </>
    );
  },
};

const ServerHeadingBlock: Config['components'][string] = {
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

    return (
      <Tag
        style={{
          color: resolvedColor,
          fontFamily: fontFamily ? `"${fontFamily}", sans-serif` : undefined,
          marginTop,
          marginRight,
          marginBottom,
          marginLeft,
          ...getPageBreakStyle(pageBreakBehavior),
        }}
        className="p-2"
      >
        {text}
      </Tag>
    );
  },
};

const ServerDivider: Config['components'][string] = {
  ...Divider,
  render: ({ orientation, color, thickness, lineStyle, pageBreakBehavior }: DividerProps) => {
    const resolvedColor = resolveStylableValue(color) ?? '#e5e7eb';

    if (orientation === 'vertical') {
      return (
        <div
          style={{
            display: 'inline-block',
            width: `${thickness}px`,
            alignSelf: 'stretch',
            minHeight: '24px',
            borderLeft: `${thickness}px ${lineStyle} ${resolvedColor}`,
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
          borderTop: `${thickness}px ${lineStyle} ${resolvedColor}`,
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

const ServerFlexBox: Config['components'][string] = {
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

    const content = puck.renderDropZone({ zone: `${id}-content` });

    const spacingValue: SpacingValue = (paddingTop || paddingRight || paddingBottom || paddingLeft)
      ? { mode: 'individual', top: `${paddingTop || '0'}px`, right: `${paddingRight || '0'}px`, bottom: `${paddingBottom || '0'}px`, left: `${paddingLeft || '0'}px` }
      : { mode: 'all', all: `${padding}px` };
    const finalPadding = resolveSpacing(spacingValue) ?? '0px';

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: direction,
          flexWrap: wrap,
          justifyContent,
          alignItems,
          gap: `${gap}px`,
          padding: finalPadding,
          backgroundColor: resolvedBackgroundColor,
          borderWidth: `${borderWidth}px`,
          borderStyle: borderWidth !== '0' ? 'solid' : 'none',
          borderColor,
          borderRadius: `${borderRadius}px`,
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

const ServerContainer: Config['components'][string] = {
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

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: `${padding}px`,
          borderWidth: `${borderWidth}px`,
          borderStyle: borderWidth !== '0' ? 'solid' : 'none',
          borderColor: resolvedBorderColor,
          borderRadius: `${borderRadius}px`,
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
    ImageBlock,
    Spacer,
    Divider: ServerDivider,
    PageBreak,
    DataTable,
    ChartBlock: ServerChartBlock,
    Container: ServerContainer,
    GridRow,
    GridColumn,
    Section,
    FlexBox: ServerFlexBox,
  },
};
