/**
 * Server-safe Puck configuration for SSR/PDF rendering.
 *
 * This file intentionally does NOT import from './config' or 'chart-block.tsx',
 * because chart-block.tsx imports recharts which fails in the RSC/Turbopack
 * server bundle context. All other components are server-safe as-is.
 *
 * ServerChartBlock renders charts as inline SVG without recharts.
 */

import type { Config } from '@puckeditor/core';
import { TextBlock } from '@/components/report-components/text-block';
import { HeadingBlock } from '@/components/report-components/heading-block';
import { ImageBlock } from '@/components/report-components/image-block';
import { Spacer } from '@/components/report-components/spacer';
import { Divider } from '@/components/report-components/divider';
import { PageBreak } from '@/components/report-components/page-break';
import { DataTable } from '@/components/report-components/data-table';
import { Container } from '@/components/report-components/container';
import { GridRow } from '@/components/report-components/grid-row';
import { GridColumn } from '@/components/report-components/grid-column';
import { Section } from '@/components/report-components/section';
import { ServerChartBlock } from '@/components/report-components/server-chart-block';
import { MetricCard } from '@/components/report-components/metric-card';
import { StatCard } from '@/components/report-components/stat-card';
import { BenchmarkTable } from '@/components/report-components/benchmark-table';
import { EditorialCard } from '@/components/report-components/editorial-card';
import { EditorialGrid } from '@/components/report-components/editorial-grid';
import { EditorialStack } from '@/components/report-components/editorial-stack';
import { Repeater } from '@/components/report-components/repeater';
import { ConditionalBlock } from '@/components/report-components/conditional-block';

export const serverPuckConfig: Config = {
  categories: {
    layout: {
      title: 'Layout',
      components: ['Container', 'GridRow', 'GridColumn', 'Section', 'Spacer', 'Divider', 'PageBreak'],
    },
    content: {
      title: 'Content',
      components: ['TextBlock', 'HeadingBlock', 'ImageBlock', 'EditorialCard', 'EditorialGrid', 'EditorialStack'],
    },
    data: {
      title: 'Data',
      components: ['DataTable', 'MetricCard', 'StatCard', 'BenchmarkTable'],
    },
    charts: {
      title: 'Charts',
      components: ['ChartBlock'],
    },
    logic: {
      title: 'Logic',
      components: ['Repeater', 'ConditionalBlock'],
    },
  },
  components: {
    TextBlock,
    HeadingBlock,
    ImageBlock,
    Spacer,
    Divider,
    PageBreak,
    DataTable,
    ChartBlock: ServerChartBlock,
    Container,
    GridRow,
    GridColumn,
    Section,
    MetricCard,
    StatCard,
    BenchmarkTable,
    EditorialCard,
    EditorialGrid,
    EditorialStack,
    Repeater,
    ConditionalBlock,
  },
};
