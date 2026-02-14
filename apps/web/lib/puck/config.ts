import type { Config } from '@puckeditor/core';
import { TextBlock, type TextBlockProps } from '@/components/report-components/text-block';
import { HeadingBlock, type HeadingBlockProps } from '@/components/report-components/heading-block';
import { ImageBlock, type ImageBlockProps } from '@/components/report-components/image-block';
import { Spacer, type SpacerProps } from '@/components/report-components/spacer';
import { Divider, type DividerProps } from '@/components/report-components/divider';
import { PageBreak, type PageBreakProps } from '@/components/report-components/page-break';
import { ReportHeader, type ReportHeaderProps } from '@/components/report-components/report-header';
import { ReportFooter, type ReportFooterProps } from '@/components/report-components/report-footer';
import { DataTable, type DataTableProps } from '@/components/report-components/data-table';

type PuckComponents = {
  TextBlock: TextBlockProps;
  HeadingBlock: HeadingBlockProps;
  ImageBlock: ImageBlockProps;
  Spacer: SpacerProps;
  Divider: DividerProps;
  PageBreak: PageBreakProps;
  ReportHeader: ReportHeaderProps;
  ReportFooter: ReportFooterProps;
  DataTable: DataTableProps;
};

export const puckConfig: Config<PuckComponents> = {
  categories: {
    layout: {
      title: 'Layout',
      components: ['Spacer', 'Divider', 'PageBreak'],
    },
    content: {
      title: 'Content',
      components: ['TextBlock', 'HeadingBlock', 'ImageBlock'],
    },
    header_footer: {
      title: 'Header & Footer',
      components: ['ReportHeader', 'ReportFooter'],
    },
    data: {
      title: 'Data',
      components: ['DataTable'],
    },
  },
  components: {
    TextBlock,
    HeadingBlock,
    ImageBlock,
    Spacer,
    Divider,
    PageBreak,
    ReportHeader,
    ReportFooter,
    DataTable,
  },
};
