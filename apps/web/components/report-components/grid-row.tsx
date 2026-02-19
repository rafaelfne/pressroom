import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AlignItems = 'start' | 'end' | 'center' | 'stretch';
type JustifyContent =
  | 'start'
  | 'end'
  | 'center'
  | 'stretch'
  | 'space-around'
  | 'space-between'
  | 'space-evenly';
type GridAutoFlow = 'row' | 'column' | 'dense' | 'row dense' | 'column dense';

export type GridRowProps = {
  /* --- Column layout (preset or custom) --- */
  columns: '2-equal' | '3-equal' | '4-equal' | '1-3_2-3' | '2-3_1-3' | 'custom';
  customColumns: string;

  /* --- grid-template-rows --- */
  gridTemplateRows: string;

  /* --- Gap (row & column) --- */
  columnGap: string;
  rowGap: string;

  /* --- Alignment: items inside cells --- */
  justifyItems: AlignItems;
  alignItems: AlignItems;

  /* --- Alignment: grid inside container --- */
  justifyContent: JustifyContent;
  alignContent: JustifyContent;

  /* --- Auto placement --- */
  gridAutoFlow: GridAutoFlow;
  gridAutoRows: string;
  gridAutoColumns: string;

  /* --- Sizing --- */
  height: string;
  minHeight: string;
  maxHeight: string;

  /* --- Spacing --- */
  padding: string;

  /* --- Page break --- */
  pageBreakBehavior: PageBreakBehavior;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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

/** Build an optional CSS property — returns empty object when value is falsy. */
const optPx = (prop: string, value: string): Record<string, string> =>
  value ? { [prop]: `${value}px` } : {};

/** Build an optional CSS property with a raw value. */
const optRaw = (prop: string, value: string): Record<string, string> =>
  value ? { [prop]: value } : {};

/* ------------------------------------------------------------------ */
/*  Shared select options                                              */
/* ------------------------------------------------------------------ */

const alignItemsOptions: { label: string; value: AlignItems }[] = [
  { label: 'Stretch (default)', value: 'stretch' },
  { label: 'Start', value: 'start' },
  { label: 'End', value: 'end' },
  { label: 'Center', value: 'center' },
];

const justifyContentOptions: { label: string; value: JustifyContent }[] = [
  { label: 'Start (default)', value: 'start' },
  { label: 'End', value: 'end' },
  { label: 'Center', value: 'center' },
  { label: 'Stretch', value: 'stretch' },
  { label: 'Space Around', value: 'space-around' },
  { label: 'Space Between', value: 'space-between' },
  { label: 'Space Evenly', value: 'space-evenly' },
];

const gridAutoFlowOptions: { label: string; value: GridAutoFlow }[] = [
  { label: 'Row (default)', value: 'row' },
  { label: 'Column', value: 'column' },
  { label: 'Dense', value: 'dense' },
  { label: 'Row Dense', value: 'row dense' },
  { label: 'Column Dense', value: 'column dense' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const GridRow: ComponentConfig<GridRowProps> = {
  label: 'Grid Row',
  fields: {
    /* --- Column layout --- */
    columns: {
      type: 'select',
      label: 'Column Layout',
      options: [
        { label: '2 Equal (1/2 + 1/2)', value: '2-equal' },
        { label: '3 Equal (1/3 + 1/3 + 1/3)', value: '3-equal' },
        { label: '4 Equal (1/4 × 4)', value: '4-equal' },
        { label: 'Narrow + Wide (1/3 + 2/3)', value: '1-3_2-3' },
        { label: 'Wide + Narrow (2/3 + 1/3)', value: '2-3_1-3' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    customColumns: {
      type: 'text',
      label: 'Custom Columns (CSS grid-template-columns)',
    },

    /* --- Row template --- */
    gridTemplateRows: {
      type: 'text',
      label: 'Row Template (CSS grid-template-rows)',
    },

    /* --- Gap --- */
    columnGap: {
      type: 'text',
      label: 'Column Gap (px)',
    },
    rowGap: {
      type: 'text',
      label: 'Row Gap (px)',
    },

    /* --- Alignment: items --- */
    justifyItems: {
      type: 'select',
      label: 'Justify Items (horizontal in cells)',
      options: alignItemsOptions,
    },
    alignItems: {
      type: 'select',
      label: 'Align Items (vertical in cells)',
      options: alignItemsOptions,
    },

    /* --- Alignment: content --- */
    justifyContent: {
      type: 'select',
      label: 'Justify Content (grid horizontal)',
      options: justifyContentOptions,
    },
    alignContent: {
      type: 'select',
      label: 'Align Content (grid vertical)',
      options: justifyContentOptions,
    },

    /* --- Auto placement --- */
    gridAutoFlow: {
      type: 'select',
      label: 'Auto Flow',
      options: gridAutoFlowOptions,
    },
    gridAutoRows: {
      type: 'text',
      label: 'Auto Rows (CSS grid-auto-rows)',
    },
    gridAutoColumns: {
      type: 'text',
      label: 'Auto Columns (CSS grid-auto-columns)',
    },

    /* --- Sizing --- */
    height: {
      type: 'text',
      label: 'Height (px)',
    },
    minHeight: {
      type: 'text',
      label: 'Min Height (px)',
    },
    maxHeight: {
      type: 'text',
      label: 'Max Height (px)',
    },

    /* --- Spacing --- */
    padding: {
      type: 'text',
      label: 'Padding (px)',
    },

    /* --- Page break --- */
    pageBreakBehavior: pageBreakField,
  },

  defaultProps: {
    columns: '2-equal',
    customColumns: '',
    gridTemplateRows: '',
    columnGap: '16',
    rowGap: '0',
    justifyItems: 'stretch',
    alignItems: 'stretch',
    justifyContent: 'start',
    alignContent: 'start',
    gridAutoFlow: 'row',
    gridAutoRows: '',
    gridAutoColumns: '',
    height: '',
    minHeight: '',
    maxHeight: '',
    padding: '',
    pageBreakBehavior: 'auto',
  },

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
  }) => {
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
