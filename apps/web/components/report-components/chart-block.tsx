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

export type ChartBlockProps = {
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'donut';
  dataExpression: string;
  xField: string;
  yField: string;
  title: string;
  height: string;
  colors: string;
  showLegend: string;
  showGrid: string;
  showTooltip: string;
};

// Sample data for Studio preview
const SAMPLE_DATA = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 500 },
  { name: 'Apr', value: 280 },
  { name: 'May', value: 590 },
];

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
    height: {
      type: 'text',
      label: 'Height (px)',
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
  },
  defaultProps: {
    chartType: 'bar',
    dataExpression: '{{data.chartData}}',
    xField: 'name',
    yField: 'value',
    title: '',
    height: '300',
    colors: '#8884d8,#82ca9d,#ffc658,#ff7300,#0088fe',
    showLegend: 'true',
    showGrid: 'true',
    showTooltip: 'false',
  },
  render: ({
    chartType,
    dataExpression,
    xField,
    yField,
    title,
    height,
    colors,
    showLegend,
    showGrid,
    showTooltip,
  }) => {
    // Use sample data for preview (in real rendering, binding resolution will replace this)
    const data = SAMPLE_DATA;

    // Parse height to number, default to 300 if invalid
    const parsedHeight = parseInt(height, 10) || 300;

    // Parse colors string to array
    const colorArray = colors
      .split(',')
      .map((color) => color.trim())
      .filter((color) => color.length > 0);

    // Parse boolean flags
    const shouldShowLegend = showLegend === 'true';
    const shouldShowGrid = showGrid === 'true';
    const shouldShowTooltip = showTooltip === 'true';

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

    // Render title if provided
    const titleElement = title ? (
      <h3
        style={{
          margin: '0 0 12px 0',
          fontSize: '18px',
          fontWeight: 600,
          color: '#111827',
        }}
      >
        {title}
      </h3>
    ) : null;

    // Render chart based on type
    let chartElement: React.ReactNode = null;

    if (chartType === 'bar') {
      chartElement = (
        <BarChart width={600} height={parsedHeight} data={data}>
          {shouldShowGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xField} />
          <YAxis />
          {shouldShowTooltip && <Tooltip />}
          {shouldShowLegend && <Legend />}
          <Bar dataKey={yField} fill={colorArray[0] || '#8884d8'} />
        </BarChart>
      );
    } else if (chartType === 'line') {
      chartElement = (
        <LineChart width={600} height={parsedHeight} data={data}>
          {shouldShowGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xField} />
          <YAxis />
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
    } else if (chartType === 'area') {
      chartElement = (
        <AreaChart width={600} height={parsedHeight} data={data}>
          {shouldShowGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xField} />
          <YAxis />
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
    } else if (chartType === 'pie' || chartType === 'donut') {
      const innerRadius = chartType === 'donut' ? 60 : 0;
      const outerRadius = 100;

      chartElement = (
        <PieChart width={600} height={parsedHeight}>
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
      );
    }

    return (
      <div>
        {titleElement}
        <div style={containerStyle}>{chartElement}</div>
      </div>
    );
  },
};
