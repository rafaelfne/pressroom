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
import { FlexBox, type FlexBoxProps } from '@/components/report-components/flex-box';
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
  FlexBox: FlexBoxProps;
};

export const puckConfig: Config<PuckComponents> = {
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
    TextBlock: {
      ...withBindingResolution(TextBlock),
      fields: {
        ...TextBlock.fields!,
        text: {
          type: 'custom' as const,
          label: 'Text',
          render: ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
            <RichTextEditor value={value} onChange={onChange} />
          ),
        },
      } as typeof TextBlock.fields,
    },
    HeadingBlock: withBindingResolution(HeadingBlock),
    ImageBlock,
    Spacer,
    Divider,
    PageBreak,
    DataTable: withBindingResolution(DataTable),
    ChartBlock: withBindingResolution(ChartBlock),
    Container,
    GridRow,
    GridColumn,
    Section,
    FlexBox,
  },
};
