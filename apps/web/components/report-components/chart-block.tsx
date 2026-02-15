import type { ComponentConfig } from '@puckeditor/core';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export type SeriesConfig = {
  name: string;
  yField: string;
  color: string;
  type?: 'line' | 'bar' | 'area';
};

export type ChartBlockProps = {
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'donut' | 'stackedBar';
  dataExpression: string;
  xField: string;
  yField: string;
  title: string;
  subtitle: string;
  height: string;
  width: string;
  colors: string;
  showLegend: string;
  showGrid: string;
  showTooltip: string;
  series: string;
  xAxisFormat: 'category' | 'date' | 'number';
  yAxisFormat: 'number' | 'percentage' | 'currency';
  xAxisRotation: '0' | '45' | '90';
  centerLabel: string;
  backgroundColor: string;
  containerBorder: string;
};

// Sample data for Studio preview
const SAMPLE_DATA = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 500 },
  { name: 'Apr', value: 280 },
  { name: 'May', value: 590 },
];

// Sample data for multi-series charts
const MULTI_SERIES_SAMPLE_DATA = [
  { name: 'Jan', series1: 400, series2: 240, series3: 150 },
  { name: 'Feb', series1: 300, series2: 139, series3: 220 },
  { name: 'Mar', series1: 500, series2: 380, series3: 290 },
  { name: 'Apr', series1: 280, series2: 390, series3: 200 },
  { name: 'May', series1: 590, series2: 480, series3: 350 },
];

// Sample data for stacked bar chart
const STACKED_BAR_SAMPLE_DATA = [
  { category: 'Product A', segment1: 30, segment2: 40, segment3: 20 },
  { category: 'Product B', segment1: 50, segment2: 25, segment3: 35 },
  { category: 'Product C', segment1: 40, segment2: 60, segment3: 15 },
  { category: 'Product D', segment1: 35, segment2: 45, segment3: 30 },
];

// Axis formatter functions
function formatYAxisValue(value: number, format: 'number' | 'percentage' | 'currency'): string {
  if (format === 'percentage') {
    return `${value}%`;
  }
  if (format === 'currency') {
    // TODO: Make currency symbol configurable for internationalization
    return `R$ ${value}`;
  }
  return String(value);
}

function getXAxisRotationAngle(rotation: '0' | '45' | '90'): number {
  if (rotation === '45') return -45;
  if (rotation === '90') return -90;
  return 0;
}

export const ChartBlock: ComponentConfig<ChartBlockProps> = {
  label: 'Chart',
  fields: {
    chartType: {
      type: 'select',
      label: 'Chart Type',
      options: [
        { label: 'Bar', value: 'bar' },
        { label: 'Line', value: 'line' },
        { label: 'Pie', value: 'pie' },
        { label: 'Area', value: 'area' },
        { label: 'Donut', value: 'donut' },
        { label: 'Stacked Bar', value: 'stackedBar' },
      ],
    },
    dataExpression: {
      type: 'text',
      label: 'Data Source',
    },
    xField: {
      type: 'text',
      label: 'X-Axis Field',
    },
    yField: {
      type: 'text',
      label: 'Y-Axis Field',
    },
    title: {
      type: 'text',
      label: 'Title',
    },
    subtitle: {
      type: 'text',
      label: 'Subtitle',
    },
    height: {
      type: 'text',
      label: 'Height (px)',
    },
    width: {
      type: 'text',
      label: 'Width (px)',
    },
    colors: {
      type: 'text',
      label: 'Colors (comma-separated hex)',
    },
    showLegend: {
      type: 'radio',
      label: 'Show Legend',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
    showGrid: {
      type: 'radio',
      label: 'Show Grid',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
    showTooltip: {
      type: 'radio',
      label: 'Show Tooltip',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
    series: {
      type: 'text',
      label: 'Series Config (JSON)',
    },
    xAxisFormat: {
      type: 'select',
      label: 'X-Axis Format',
      options: [
        { label: 'Category', value: 'category' },
        { label: 'Date', value: 'date' },
        { label: 'Number', value: 'number' },
      ],
    },
    yAxisFormat: {
      type: 'select',
      label: 'Y-Axis Format',
      options: [
        { label: 'Number', value: 'number' },
        { label: 'Percentage', value: 'percentage' },
        { label: 'Currency', value: 'currency' },
      ],
    },
    xAxisRotation: {
      type: 'select',
      label: 'X-Axis Label Rotation',
      options: [
        { label: '0°', value: '0' },
        { label: '45°', value: '45' },
        { label: '90°', value: '90' },
      ],
    },
    centerLabel: {
      type: 'text',
      label: 'Donut Center Label',
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color',
    },
    containerBorder: {
      type: 'radio',
      label: 'Container Border',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
  },
  defaultProps: {
    chartType: 'bar',
    dataExpression: '{{data.chartData}}',
    xField: 'name',
    yField: 'value',
    title: '',
    subtitle: '',
    height: '300',
    width: '600',
    colors: '#8884d8,#82ca9d,#ffc658,#ff7300,#0088fe',
    showLegend: 'true',
    showGrid: 'true',
    showTooltip: 'false',
    series: '[]',
    xAxisFormat: 'category',
    yAxisFormat: 'number',
    xAxisRotation: '0',
    centerLabel: '',
    backgroundColor: '',
    containerBorder: 'false',
  },
  render: ({
    chartType,
    dataExpression,
    xField,
    yField,
    title,
    subtitle,
    height,
    width,
    colors,
    showLegend,
    showGrid,
    showTooltip,
    series,
    xAxisFormat, // eslint-disable-line @typescript-eslint/no-unused-vars -- Keeping in signature for Puck field registration, reserved for future implementation
    yAxisFormat,
    xAxisRotation,
    centerLabel,
    backgroundColor,
    containerBorder,
  }) => {
    // Parse series JSON string safely
    let seriesConfig: SeriesConfig[] = [];
    try {
      if (series && series.trim() !== '') {
        const parsed: unknown = JSON.parse(series);
        if (Array.isArray(parsed)) {
          seriesConfig = parsed as SeriesConfig[];
        }
      }
    } catch {
      // Invalid JSON, use empty array
      seriesConfig = [];
    }

    // Use sample data for preview (in real rendering, binding resolution will replace this)
    let data: Array<Record<string, string | number>> = SAMPLE_DATA;
    if (chartType === 'stackedBar') {
      data = STACKED_BAR_SAMPLE_DATA;
    } else if (seriesConfig.length > 0) {
      data = MULTI_SERIES_SAMPLE_DATA;
    }

    // Parse dimensions to number, with defaults
    const parsedHeight = parseInt(height, 10) || 300;
    const parsedWidth = parseInt(width, 10) || 600;

    // Parse colors string to array
    const colorArray = colors
      .split(',')
      .map((color) => color.trim())
      .filter((color) => color.length > 0);

    // Parse boolean flags
    const shouldShowLegend = showLegend === 'true';
    const shouldShowGrid = showGrid === 'true';
    const shouldShowTooltip = showTooltip === 'true';
    const shouldShowBorder = containerBorder === 'true';

    // Get axis rotation angle
    const rotationAngle = getXAxisRotationAngle(xAxisRotation);

    // Validate data
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div
          style={{
            padding: '16px',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            color: '#6b7280',
            textAlign: 'center',
            maxWidth: '100%',
            height: `${parsedHeight}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          No data available. Configure data source: {dataExpression}
        </div>
      );
    }

    // Container styles
    const containerStyle: React.CSSProperties = {
      width: '100%',
      height: `${parsedHeight}px`,
    };

    // Outer wrapper styles
    const wrapperStyle: React.CSSProperties = {
      backgroundColor: backgroundColor || 'transparent',
      border: shouldShowBorder ? '1px solid #d1d5db' : 'none',
      padding: shouldShowBorder || backgroundColor ? '16px' : '0',
      borderRadius: shouldShowBorder ? '8px' : '0',
    };

    // Render title if provided
    const titleElement = title ? (
      <h3
        style={{
          margin: '0 0 4px 0',
          fontSize: '18px',
          fontWeight: 600,
          color: '#111827',
        }}
      >
        {title}
      </h3>
    ) : null;

    // Render subtitle if provided
    const subtitleElement = subtitle ? (
      <p
        style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: 400,
          color: '#6b7280',
        }}
      >
        {subtitle}
      </p>
    ) : null;

    // Y-Axis tick formatter
    const yAxisTickFormatter = (value: number) => formatYAxisValue(value, yAxisFormat);

    // Render chart based on type
    let chartElement: React.ReactNode = null;

    if (chartType === 'bar') {
      // Multi-series or single series bar chart
      if (seriesConfig.length > 0) {
        chartElement = (
          <BarChart width={parsedWidth} height={parsedHeight} data={data}>
            {shouldShowGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xField} angle={rotationAngle} textAnchor={rotationAngle !== 0 ? 'end' : 'middle'} />
            <YAxis tickFormatter={yAxisTickFormatter} />
            {shouldShowTooltip && <Tooltip />}
            {shouldShowLegend && <Legend />}
            {seriesConfig.map((seriesItem, index) => (
              <Bar
                key={seriesItem.name}
                dataKey={seriesItem.yField}
                fill={seriesItem.color || colorArray[index % colorArray.length] || '#8884d8'}
                name={seriesItem.name}
              />
            ))}
          </BarChart>
        );
      } else {
        chartElement = (
          <BarChart width={parsedWidth} height={parsedHeight} data={data}>
            {shouldShowGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xField} angle={rotationAngle} textAnchor={rotationAngle !== 0 ? 'end' : 'middle'} />
            <YAxis tickFormatter={yAxisTickFormatter} />
            {shouldShowTooltip && <Tooltip />}
            {shouldShowLegend && <Legend />}
            <Bar dataKey={yField} fill={colorArray[0] || '#8884d8'} />
          </BarChart>
        );
      }
    } else if (chartType === 'line') {
      // Multi-series or single series line chart
      if (seriesConfig.length > 0) {
        chartElement = (
          <LineChart width={parsedWidth} height={parsedHeight} data={data}>
            {shouldShowGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xField} angle={rotationAngle} textAnchor={rotationAngle !== 0 ? 'end' : 'middle'} />
            <YAxis tickFormatter={yAxisTickFormatter} />
            {shouldShowTooltip && <Tooltip />}
            {shouldShowLegend && <Legend />}
            {seriesConfig.map((seriesItem, index) => (
              <Line
                key={seriesItem.name}
                type="monotone"
                dataKey={seriesItem.yField}
                stroke={seriesItem.color || colorArray[index % colorArray.length] || '#8884d8'}
                strokeWidth={2}
                name={seriesItem.name}
              />
            ))}
          </LineChart>
        );
      } else {
        chartElement = (
          <LineChart width={parsedWidth} height={parsedHeight} data={data}>
            {shouldShowGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xField} angle={rotationAngle} textAnchor={rotationAngle !== 0 ? 'end' : 'middle'} />
            <YAxis tickFormatter={yAxisTickFormatter} />
            {shouldShowTooltip && <Tooltip />}
            {shouldShowLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={yField}
              stroke={colorArray[0] || '#8884d8'}
              strokeWidth={2}
            />
          </LineChart>
        );
      }
    } else if (chartType === 'area') {
      // Multi-series or single series area chart
      if (seriesConfig.length > 0) {
        chartElement = (
          <AreaChart width={parsedWidth} height={parsedHeight} data={data}>
            {shouldShowGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xField} angle={rotationAngle} textAnchor={rotationAngle !== 0 ? 'end' : 'middle'} />
            <YAxis tickFormatter={yAxisTickFormatter} />
            {shouldShowTooltip && <Tooltip />}
            {shouldShowLegend && <Legend />}
            {seriesConfig.map((seriesItem, index) => (
              <Area
                key={seriesItem.name}
                type="monotone"
                dataKey={seriesItem.yField}
                stroke={seriesItem.color || colorArray[index % colorArray.length] || '#8884d8'}
                fill={seriesItem.color || colorArray[index % colorArray.length] || '#8884d8'}
                name={seriesItem.name}
              />
            ))}
          </AreaChart>
        );
      } else {
        chartElement = (
          <AreaChart width={parsedWidth} height={parsedHeight} data={data}>
            {shouldShowGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xField} angle={rotationAngle} textAnchor={rotationAngle !== 0 ? 'end' : 'middle'} />
            <YAxis tickFormatter={yAxisTickFormatter} />
            {shouldShowTooltip && <Tooltip />}
            {shouldShowLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={yField}
              stroke={colorArray[0] || '#8884d8'}
              fill={colorArray[0] || '#8884d8'}
            />
          </AreaChart>
        );
      }
    } else if (chartType === 'stackedBar') {
      // Stacked bar chart (vertical layout)
      if (seriesConfig.length > 0) {
        chartElement = (
          <BarChart width={parsedWidth} height={parsedHeight} data={data} layout="vertical">
            {shouldShowGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis type="number" tickFormatter={yAxisTickFormatter} />
            <YAxis type="category" dataKey={xField} />
            {shouldShowTooltip && <Tooltip />}
            {shouldShowLegend && <Legend />}
            {seriesConfig.map((seriesItem, index) => (
              <Bar
                key={seriesItem.name}
                dataKey={seriesItem.yField}
                fill={seriesItem.color || colorArray[index % colorArray.length] || '#8884d8'}
                stackId="stack"
                name={seriesItem.name}
              />
            ))}
          </BarChart>
        );
      } else {
        chartElement = (
          <BarChart width={parsedWidth} height={parsedHeight} data={data} layout="vertical">
            {shouldShowGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis type="number" tickFormatter={yAxisTickFormatter} />
            <YAxis type="category" dataKey={xField} />
            {shouldShowTooltip && <Tooltip />}
            {shouldShowLegend && <Legend />}
            <Bar dataKey={yField} fill={colorArray[0] || '#8884d8'} stackId="stack" />
          </BarChart>
        );
      }
    } else if (chartType === 'pie' || chartType === 'donut') {
      const innerRadius = chartType === 'donut' ? 60 : 0;
      const outerRadius = 100;

      chartElement = (
        <div style={{ position: 'relative', width: parsedWidth, height: parsedHeight }}>
          <PieChart width={parsedWidth} height={parsedHeight}>
            <Pie
              data={data}
              dataKey={yField}
              nameKey={xField}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              fill={colorArray[0] || '#8884d8'}
              label
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colorArray[index % colorArray.length] || '#8884d8'}
                />
              ))}
            </Pie>
            {shouldShowTooltip && <Tooltip />}
            {shouldShowLegend && <Legend />}
          </PieChart>
          {chartType === 'donut' && centerLabel && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 600,
                color: '#111827',
                pointerEvents: 'none',
              }}
            >
              {centerLabel}
            </div>
          )}
        </div>
      );
    }

    return (
      <div style={wrapperStyle}>
        {titleElement}
        {subtitleElement}
        <div style={containerStyle}>{chartElement}</div>
      </div>
    );
  },
};
