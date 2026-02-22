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
import { StylableValueField } from '@/components/puck-fields/stylable-value-field';
import type { StylableValue } from '@/lib/types/style-system';

/** Helper to create a StylableValueField config entry */
function stylableField(label: string, tokenCssProperty: string, tokenCategory: string) {
  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange }: { value: StylableValue | string; onChange: (val: StylableValue) => void }) => (
      <StylableValueField
        value={value}
        onChange={onChange}
        field={{ label, tokenCssProperty, tokenCategory }}
      />
    ),
  };
}

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
        color: stylableField('Text Color', 'color', 'color'),
        marginTop: stylableField('Margin Top', 'margin', 'spacing'),
        marginRight: stylableField('Margin Right', 'margin', 'spacing'),
        marginBottom: stylableField('Margin Bottom', 'margin', 'spacing'),
        marginLeft: stylableField('Margin Left', 'margin', 'spacing'),
      } as typeof TextBlock.fields,
    },
    HeadingBlock: {
      ...withBindingResolution(HeadingBlock),
      fields: {
        ...HeadingBlock.fields!,
        color: stylableField('Text Color', 'color', 'color'),
        fontFamily: stylableField('Font Family', 'font-family', 'typography'),
        marginTop: stylableField('Margin Top', 'margin', 'spacing'),
        marginRight: stylableField('Margin Right', 'margin', 'spacing'),
        marginBottom: stylableField('Margin Bottom', 'margin', 'spacing'),
        marginLeft: stylableField('Margin Left', 'margin', 'spacing'),
      } as typeof HeadingBlock.fields,
    },
    ImageBlock,
    Spacer,
    Divider: {
      ...Divider,
      fields: {
        ...Divider.fields!,
        color: stylableField('Color', 'color', 'color'),
        thickness: stylableField('Thickness', 'border-width', 'border'),
      } as typeof Divider.fields,
    },
    PageBreak,
    DataTable: {
      ...withBindingResolution(DataTable),
      fields: {
        ...DataTable.fields!,
        headerBgColor: stylableField('Header Background Color', 'background-color', 'background'),
        headerTextColor: stylableField('Header Text Color', 'color', 'color'),
        headerBorderColor: stylableField('Header Border Color', 'border-color', 'border'),
        headerFontSize: stylableField('Header Font Size', 'font-size', 'typography'),
        headerFontWeight: stylableField('Header Font Weight', 'font-weight', 'typography'),
        headerFontFamily: stylableField('Header Font Family', 'font-family', 'typography'),
        headerPadding: stylableField('Header Padding', 'padding', 'spacing'),
        groupHeaderBgColor: stylableField('Group Header Background Color', 'background-color', 'background'),
        groupHeaderTextColor: stylableField('Group Header Text Color', 'color', 'color'),
        groupHeaderBorderColor: stylableField('Group Header Border Color', 'border-color', 'border'),
        groupHeaderFontSize: stylableField('Group Header Font Size', 'font-size', 'typography'),
        groupHeaderFontWeight: stylableField('Group Header Font Weight', 'font-weight', 'typography'),
        groupHeaderFontFamily: stylableField('Group Header Font Family', 'font-family', 'typography'),
        groupHeaderPadding: stylableField('Group Header Padding', 'padding', 'spacing'),
        footerBgColor: stylableField('Footer Background Color', 'background-color', 'background'),
        footerTextColor: stylableField('Footer Text Color', 'color', 'color'),
        footerBorderColor: stylableField('Footer Border Color', 'border-color', 'border'),
        footerFontSize: stylableField('Footer Font Size', 'font-size', 'typography'),
        footerFontWeight: stylableField('Footer Font Weight', 'font-weight', 'typography'),
        footerFontFamily: stylableField('Footer Font Family', 'font-family', 'typography'),
        footerPadding: stylableField('Footer Padding', 'padding', 'spacing'),
        evenRowColor: stylableField('Even Row Color', 'background-color', 'background'),
        oddRowColor: stylableField('Odd Row Color', 'background-color', 'background'),
      } as typeof DataTable.fields,
    },
    ChartBlock: {
      ...withBindingResolution(ChartBlock),
      fields: {
        ...ChartBlock.fields!,
        backgroundColor: stylableField('Background Color', 'background-color', 'background'),
      } as typeof ChartBlock.fields,
    },
    Container: {
      ...Container,
      fields: {
        ...Container.fields!,
        padding: stylableField('Padding', 'padding', 'spacing'),
        borderWidth: stylableField('Border Width', 'border-width', 'border'),
        borderColor: stylableField('Border Color', 'border-color', 'border'),
        borderRadius: stylableField('Border Radius', 'border-radius', 'border'),
        backgroundColor: stylableField('Background Color', 'background-color', 'background'),
      } as typeof Container.fields,
    },
    GridRow,
    GridColumn: {
      ...GridColumn,
      fields: {
        ...GridColumn.fields!,
        padding: stylableField('Padding', 'padding', 'spacing'),
        borderWidth: stylableField('Border Width', 'border-width', 'border'),
        backgroundColor: stylableField('Background Color', 'background-color', 'background'),
        borderColor: stylableField('Border Color', 'border-color', 'border'),
      } as typeof GridColumn.fields,
    },
    Section: {
      ...Section,
      fields: {
        ...Section.fields!,
        padding: stylableField('Padding', 'padding', 'spacing'),
        backgroundColor: stylableField('Background Color', 'background-color', 'background'),
      } as typeof Section.fields,
    },
    FlexBox: {
      ...FlexBox,
      fields: {
        ...FlexBox.fields!,
        gap: stylableField('Gap', 'gap', 'spacing'),
        padding: stylableField('Padding', 'padding', 'spacing'),
        paddingTop: stylableField('Padding Top', 'padding', 'spacing'),
        paddingRight: stylableField('Padding Right', 'padding', 'spacing'),
        paddingBottom: stylableField('Padding Bottom', 'padding', 'spacing'),
        paddingLeft: stylableField('Padding Left', 'padding', 'spacing'),
        backgroundColor: stylableField('Background Color', 'background-color', 'background'),
        borderWidth: stylableField('Border Width', 'border-width', 'border'),
        borderColor: stylableField('Border Color', 'border-color', 'border'),
        borderRadius: stylableField('Border Radius', 'border-radius', 'border'),
        color: stylableField('Text Color', 'color', 'color'),
        fontSize: stylableField('Font Size', 'font-size', 'typography'),
        fontFamily: stylableField('Font Family', 'font-family', 'typography'),
      } as typeof FlexBox.fields,
    },
  },
};
