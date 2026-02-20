import type { Config } from '@puckeditor/core';
import { TextBlock, type TextBlockProps } from '@/components/report-components/text-block';
import { HeadingBlock, type HeadingBlockProps } from '@/components/report-components/heading-block';
import { ImageBlock, type ImageBlockProps } from '@/components/report-components/image-block';
import { Spacer, type SpacerProps } from '@/components/report-components/spacer';
import { Divider, type DividerProps } from '@/components/report-components/divider';
import { PageBreak, type PageBreakProps } from '@/components/report-components/page-break';
import { DataTable, type DataTableProps } from '@/components/report-components/data-table';
import { ChartBlock, type ChartBlockProps } from '@/components/report-components/chart-block';
import { Container, type ContainerProps } from '@/components/report-components/container';
import { GridRow, type GridRowProps } from '@/components/report-components/grid-row';
import { GridColumn, type GridColumnProps } from '@/components/report-components/grid-column';
import { Section, type SectionProps } from '@/components/report-components/section';
import { MetricCard, type MetricCardProps } from '@/components/report-components/metric-card';
import { StatCard, type StatCardProps } from '@/components/report-components/stat-card';
import { BenchmarkTable, type BenchmarkTableProps } from '@/components/report-components/benchmark-table';
import { EditorialCard, type EditorialCardProps } from '@/components/report-components/editorial-card';
import { EditorialGrid, type EditorialGridProps } from '@/components/report-components/editorial-grid';
import { EditorialStack, type EditorialStackProps } from '@/components/report-components/editorial-stack';
import { Repeater, type RepeaterProps } from '@/components/report-components/repeater';
import { ConditionalBlock, type ConditionalBlockProps } from '@/components/report-components/conditional-block';
import { withBindingResolution } from '@/lib/puck/with-binding-resolution';
import { RichTextEditor } from '@/components/studio/rich-text-editor';

type PuckComponents = {
  TextBlock: TextBlockProps;
  HeadingBlock: HeadingBlockProps;
  ImageBlock: ImageBlockProps;
  Spacer: SpacerProps;
  Divider: DividerProps;
  PageBreak: PageBreakProps;
  DataTable: DataTableProps;
  ChartBlock: ChartBlockProps;
  Container: ContainerProps;
  GridRow: GridRowProps;
  GridColumn: GridColumnProps;
  Section: SectionProps;
  MetricCard: MetricCardProps;
  StatCard: StatCardProps;
  BenchmarkTable: BenchmarkTableProps;
  EditorialCard: EditorialCardProps;
  EditorialGrid: EditorialGridProps;
  EditorialStack: EditorialStackProps;
  Repeater: RepeaterProps;
  ConditionalBlock: ConditionalBlockProps;
};

export const puckConfig: Config<PuckComponents> = {
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
    TextBlock: {
      ...withBindingResolution<TextBlockProps>(TextBlock),
      fields: {
        ...TextBlock.fields,
        text: {
          type: 'custom' as const,
          label: 'Text',
          render: ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
            <RichTextEditor value={value} onChange={onChange} />
          ),
        },
      },
    },
    HeadingBlock: withBindingResolution<HeadingBlockProps>(HeadingBlock),
    ImageBlock,
    Spacer,
    Divider,
    PageBreak,
    DataTable: withBindingResolution<DataTableProps>(DataTable),
    ChartBlock: withBindingResolution<ChartBlockProps>(ChartBlock),
    Container,
    GridRow,
    GridColumn,
    Section,
    MetricCard: withBindingResolution<MetricCardProps>(MetricCard),
    StatCard: withBindingResolution<StatCardProps>(StatCard),
    BenchmarkTable: withBindingResolution<BenchmarkTableProps>(BenchmarkTable),
    EditorialCard: withBindingResolution<EditorialCardProps>(EditorialCard),
    EditorialGrid,
    EditorialStack,
    Repeater,
    ConditionalBlock,
  },
};
