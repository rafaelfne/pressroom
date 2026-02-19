/**
 * Server-safe ChartBlock for SSR/PDF rendering.
 * Renders charts as inline SVG without importing recharts,
 * so this file is safe to use in RSC / API route contexts.
 */
import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField } from '@/lib/utils/page-break';
import type { ChartBlockProps, SeriesConfig } from './chart-block';

// Re-export the type so server-config can reference it
export type { ChartBlockProps };

// ─── Sample data (mirrors chart-block.tsx) ────────────────────────────────────

const SAMPLE_DATA = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 500 },
  { name: 'Apr', value: 280 },
  { name: 'May', value: 590 },
];

const MULTI_SERIES_SAMPLE_DATA = [
  { name: 'Jan', series1: 400, series2: 240, series3: 150 },
  { name: 'Feb', series1: 300, series2: 139, series3: 220 },
  { name: 'Mar', series1: 500, series2: 380, series3: 290 },
  { name: 'Apr', series1: 280, series2: 390, series3: 200 },
  { name: 'May', series1: 590, series2: 480, series3: 350 },
];

const STACKED_BAR_SAMPLE_DATA = [
  { category: 'Product A', segment1: 30, segment2: 40, segment3: 20 },
  { category: 'Product B', segment1: 50, segment2: 25, segment3: 35 },
  { category: 'Product C', segment1: 40, segment2: 60, segment3: 15 },
  { category: 'Product D', segment1: 35, segment2: 45, segment3: 30 },
];

// ─── SVG helpers ──────────────────────────────────────────────────────────────

const PADDING = { top: 20, right: 20, bottom: 40, left: 50 };

/**
 * Convert xAxisRotation prop to rotation angle in degrees.
 * Negative rotation matches Recharts behavior.
 */
function getRotationAngle(rotation: '0' | '45' | '90' | undefined): number {
  if (rotation === '45') return -45;
  if (rotation === '90') return -90;
  return 0;
}

function getNumericValue(row: Record<string, string | number>, field: string): number {
  const v = row[field];
  return typeof v === 'number' ? v : parseFloat(String(v)) || 0;
}

function formatYTick(value: number, format: 'number' | 'percentage' | 'currency'): string {
  if (format === 'percentage') return `${value}%`;
  if (format === 'currency') return `R$${value}`;
  return String(value);
}

function renderBarChart(
  data: Array<Record<string, string | number>>,
  props: ChartBlockProps,
  w: number,
  h: number,
  colorArray: string[],
  seriesConfig: SeriesConfig[],
  stacked: boolean,
): React.ReactNode {
  const { xField, yField, showGrid, showLegend, yAxisFormat, xAxisRotation } = props;
  const plotW = w - PADDING.left - PADDING.right;
  const plotH = h - PADDING.top - PADDING.bottom;

  let maxVal = 0;
  if (stacked && seriesConfig.length > 0) {
    for (const row of data) {
      const total = seriesConfig.reduce((s, sc) => s + getNumericValue(row, sc.yField), 0);
      if (total > maxVal) maxVal = total;
    }
  } else if (seriesConfig.length > 0) {
    for (const row of data) {
      for (const sc of seriesConfig) {
        const v = getNumericValue(row, sc.yField);
        if (v > maxVal) maxVal = v;
      }
    }
  } else {
    for (const row of data) {
      const v = getNumericValue(row, yField);
      if (v > maxVal) maxVal = v;
    }
  }
  if (maxVal === 0) maxVal = 1;

  const n = data.length;
  const groupW = plotW / n;
  const barW = seriesConfig.length > 1 && !stacked
    ? groupW / (seriesConfig.length + 1)
    : groupW * 0.6;

  const yTicks = 4;
  const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const frac = i / yTicks;
    const y = PADDING.top + plotH * (1 - frac);
    const val = Math.round(maxVal * frac);
    return { y, val };
  });

  const bars: React.ReactNode[] = [];

  data.forEach((row, i) => {
    const groupX = PADDING.left + i * groupW;

    if (stacked && seriesConfig.length > 0) {
      let cumY = 0;
      seriesConfig.forEach((sc, si) => {
        const val = getNumericValue(row, sc.yField);
        const barH = (val / maxVal) * plotH;
        const x = groupX + groupW * 0.2;
        const y = PADDING.top + plotH - (cumY + val) / maxVal * plotH;
        const fill = sc.color || colorArray[si % colorArray.length] || '#8884d8';
        bars.push(<rect key={`${i}-${si}`} x={x} y={y} width={barW} height={barH} fill={fill} />);
        cumY += val;
      });
    } else if (seriesConfig.length > 1) {
      seriesConfig.forEach((sc, si) => {
        const val = getNumericValue(row, sc.yField);
        const barH = (val / maxVal) * plotH;
        const x = groupX + (si + 0.5) * barW;
        const y = PADDING.top + plotH - barH;
        const fill = sc.color || colorArray[si % colorArray.length] || '#8884d8';
        bars.push(<rect key={`${i}-${si}`} x={x} y={y} width={barW * 0.9} height={barH} fill={fill} />);
      });
    } else {
      const val = getNumericValue(row, yField);
      const barH = (val / maxVal) * plotH;
      const x = groupX + groupW * 0.2;
      const y = PADDING.top + plotH - barH;
      bars.push(<rect key={i} x={x} y={y} width={barW} height={barH} fill={colorArray[0] || '#8884d8'} />);
    }
  });

  const legendItems = seriesConfig.length > 0
    ? seriesConfig.map((sc, i) => ({ label: sc.name, color: sc.color || colorArray[i % colorArray.length] || '#8884d8' }))
    : [{ label: yField, color: colorArray[0] || '#8884d8' }];

  return (
    <svg width={w} height={h} xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      {showGrid === 'true' && gridLines.map(({ y }, i) => (
        <line key={i} x1={PADDING.left} y1={y} x2={PADDING.left + plotW} y2={y}
          stroke="#e5e7eb" strokeWidth={1} strokeDasharray="3 3" />
      ))}
      <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={PADDING.top + plotH} stroke="#6b7280" strokeWidth={1} />
      <line x1={PADDING.left} y1={PADDING.top + plotH} x2={PADDING.left + plotW} y2={PADDING.top + plotH} stroke="#6b7280" strokeWidth={1} />
      {gridLines.map(({ y, val }, i) => (
        <text key={i} x={PADDING.left - 5} y={y + 4} textAnchor="end" fontSize={10} fill="#6b7280">
          {formatYTick(val, yAxisFormat)}
        </text>
      ))}
      {bars}
      {data.map((row, i) => {
        const x = PADDING.left + i * groupW + groupW / 2;
        const y = PADDING.top + plotH + 16;
        const rotation = getRotationAngle(xAxisRotation);
        const anchor = rotation !== 0 ? 'end' : 'middle';
        const transform = rotation !== 0 ? `rotate(${rotation}, ${x}, ${y})` : undefined;

        return (
          <text key={i} x={x} y={y} textAnchor={anchor} fontSize={10} fill="#6b7280"
            transform={transform}>
            {String(row[xField] ?? '')}
          </text>
        );
      })}
      {showLegend === 'true' && legendItems.map((item, i) => (
        <g key={i} transform={`translate(${PADDING.left + i * 80}, ${h - 12})`}>
          <rect x={0} y={-8} width={10} height={10} fill={item.color} />
          <text x={14} y={0} fontSize={10} fill="#374151">{item.label}</text>
        </g>
      ))}
    </svg>
  );
}

function renderLineAreaChart(
  data: Array<Record<string, string | number>>,
  props: ChartBlockProps,
  w: number,
  h: number,
  colorArray: string[],
  seriesConfig: SeriesConfig[],
  filled: boolean,
): React.ReactNode {
  const { xField, yField, showGrid, showLegend, yAxisFormat, xAxisRotation } = props;
  const plotW = w - PADDING.left - PADDING.right;
  const plotH = h - PADDING.top - PADDING.bottom;

  let maxVal = 0;
  const fields = seriesConfig.length > 0 ? seriesConfig.map((s) => s.yField) : [yField];
  for (const row of data) {
    for (const f of fields) {
      const v = getNumericValue(row, f);
      if (v > maxVal) maxVal = v;
    }
  }
  if (maxVal === 0) maxVal = 1;

  const xStep = data.length > 1 ? plotW / (data.length - 1) : plotW;

  const yTicks = 4;
  const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const frac = i / yTicks;
    return { y: PADDING.top + plotH * (1 - frac), val: Math.round(maxVal * frac) };
  });

  const renderSeries = (field: string, color: string, index: number) => {
    const points = data.map((row, i) => {
      const val = getNumericValue(row, field);
      const x = PADDING.left + i * xStep;
      const y = PADDING.top + plotH - (val / maxVal) * plotH;
      return `${x},${y}`;
    });
    const polylinePoints = points.join(' ');

    if (filled) {
      const first = `${PADDING.left},${PADDING.top + plotH}`;
      const last = `${PADDING.left + (data.length - 1) * xStep},${PADDING.top + plotH}`;
      const areaPoints = [first, ...points, last].join(' ');
      return (
        <g key={index}>
          <polygon points={areaPoints} fill={color} fillOpacity={0.3} />
          <polyline points={polylinePoints} fill="none" stroke={color} strokeWidth={2} />
        </g>
      );
    }
    return <polyline key={index} points={polylinePoints} fill="none" stroke={color} strokeWidth={2} />;
  };

  const legendItems = seriesConfig.length > 0
    ? seriesConfig.map((sc, i) => ({ label: sc.name, color: sc.color || colorArray[i % colorArray.length] || '#8884d8' }))
    : [{ label: yField, color: colorArray[0] || '#8884d8' }];

  return (
    <svg width={w} height={h} xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      {showGrid === 'true' && gridLines.map(({ y }, i) => (
        <line key={i} x1={PADDING.left} y1={y} x2={PADDING.left + plotW} y2={y}
          stroke="#e5e7eb" strokeWidth={1} strokeDasharray="3 3" />
      ))}
      <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={PADDING.top + plotH} stroke="#6b7280" strokeWidth={1} />
      <line x1={PADDING.left} y1={PADDING.top + plotH} x2={PADDING.left + plotW} y2={PADDING.top + plotH} stroke="#6b7280" strokeWidth={1} />
      {gridLines.map(({ y, val }, i) => (
        <text key={i} x={PADDING.left - 5} y={y + 4} textAnchor="end" fontSize={10} fill="#6b7280">
          {formatYTick(val, yAxisFormat)}
        </text>
      ))}
      {seriesConfig.length > 0
        ? seriesConfig.map((sc, i) => renderSeries(sc.yField, sc.color || colorArray[i % colorArray.length] || '#8884d8', i))
        : renderSeries(yField, colorArray[0] || '#8884d8', 0)
      }
      {data.map((row, i) => {
        const x = PADDING.left + i * xStep;
        const y = PADDING.top + plotH + 16;
        const rotation = getRotationAngle(xAxisRotation);
        const anchor = rotation !== 0 ? 'end' : 'middle';
        const transform = rotation !== 0 ? `rotate(${rotation}, ${x}, ${y})` : undefined;

        return (
          <text key={i} x={x} y={y} textAnchor={anchor} fontSize={10} fill="#6b7280"
            transform={transform}>
            {String(row[xField] ?? '')}
          </text>
        );
      })}
      {showLegend === 'true' && legendItems.map((item, i) => (
        <g key={i} transform={`translate(${PADDING.left + i * 80}, ${h - 12})`}>
          <rect x={0} y={-8} width={10} height={10} fill={item.color} />
          <text x={14} y={0} fontSize={10} fill="#374151">{item.label}</text>
        </g>
      ))}
    </svg>
  );
}

function renderPieChart(
  data: Array<Record<string, string | number>>,
  props: ChartBlockProps,
  w: number,
  h: number,
  colorArray: string[],
  donut: boolean,
): React.ReactNode {
  const { xField, yField, showLegend, centerLabel } = props;
  const cx = w / 2;
  const cy = h / 2;
  const outerR = Math.min(w, h) / 2 - 20;
  const innerR = donut ? outerR * 0.5 : 0;

  const total = data.reduce((s, row) => s + getNumericValue(row, yField), 0) || 1;
  let angle = -Math.PI / 2;

  const slices: React.ReactNode[] = [];
  data.forEach((row, i) => {
    const val = getNumericValue(row, yField);
    const sweep = (val / total) * 2 * Math.PI;
    const x1 = cx + outerR * Math.cos(angle);
    const y1 = cy + outerR * Math.sin(angle);
    const x2 = cx + outerR * Math.cos(angle + sweep);
    const y2 = cy + outerR * Math.sin(angle + sweep);
    const ix1 = cx + innerR * Math.cos(angle + sweep);
    const iy1 = cy + innerR * Math.sin(angle + sweep);
    const ix2 = cx + innerR * Math.cos(angle);
    const iy2 = cy + innerR * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const fill = colorArray[i % colorArray.length] || '#8884d8';

    const d = donut
      ? `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} Z`;

    slices.push(<path key={i} d={d} fill={fill} stroke="#fff" strokeWidth={1} />);
    angle += sweep;
  });

  return (
    <svg width={w} height={h} xmlns="http://www.w3.org/2000/svg">
      {slices}
      {donut && centerLabel && (
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fontWeight={600} fill="#111827">
          {centerLabel}
        </text>
      )}
      {showLegend === 'true' && data.map((row, i) => (
        <g key={i} transform={`translate(${PADDING.left + i * 80}, ${h - 12})`}>
          <rect x={0} y={-8} width={10} height={10} fill={colorArray[i % colorArray.length] || '#8884d8'} />
          <text x={14} y={0} fontSize={10} fill="#374151">{String(row[xField] ?? '')}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── ServerChartBlock ─────────────────────────────────────────────────────────

export const ServerChartBlock: ComponentConfig<ChartBlockProps> = {
  label: 'Chart',
  fields: {
    chartType: {
      type: 'select', label: 'Chart Type', options: [
        { label: 'Bar', value: 'bar' },
        { label: 'Line', value: 'line' },
        { label: 'Pie', value: 'pie' },
        { label: 'Area', value: 'area' },
        { label: 'Donut', value: 'donut' },
        { label: 'Stacked Bar', value: 'stackedBar' },
      ]
    },
    dataExpression: { type: 'text', label: 'Data Source' },
    xField: { type: 'text', label: 'X-Axis Field' },
    yField: { type: 'text', label: 'Y-Axis Field' },
    title: { type: 'text', label: 'Title' },
    subtitle: { type: 'text', label: 'Subtitle' },
    height: { type: 'text', label: 'Height (px)' },
    width: { type: 'text', label: 'Width (px)' },
    colors: { type: 'text', label: 'Colors (comma-separated hex)' },
    showLegend: { type: 'radio', label: 'Show Legend', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }] },
    showGrid: { type: 'radio', label: 'Show Grid', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }] },
    showTooltip: { type: 'radio', label: 'Show Tooltip', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }] },
    series: { type: 'text', label: 'Series Config (JSON)' },
    xAxisFormat: {
      type: 'select', label: 'X-Axis Format', options: [
        { label: 'Category', value: 'category' },
        { label: 'Date', value: 'date' },
        { label: 'Number', value: 'number' },
      ]
    },
    yAxisFormat: {
      type: 'select', label: 'Y-Axis Format', options: [
        { label: 'Number', value: 'number' },
        { label: 'Percentage', value: 'percentage' },
        { label: 'Currency', value: 'currency' },
      ]
    },
    xAxisRotation: {
      type: 'select', label: 'X-Axis Label Rotation', options: [
        { label: '0°', value: '0' }, { label: '45°', value: '45' }, { label: '90°', value: '90' },
      ]
    },
    centerLabel: { type: 'text', label: 'Donut Center Label' },
    backgroundColor: { type: 'text', label: 'Background Color' },
    containerBorder: { type: 'radio', label: 'Container Border', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }] },
    pageBreakBehavior: pageBreakField,
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
    pageBreakBehavior: 'avoid',
  },
  render: ({
    chartType, xField, yField, title, subtitle, height, width,
    colors, showLegend, showGrid, series, yAxisFormat, xAxisRotation,
    centerLabel, backgroundColor, containerBorder, pageBreakBehavior,
  }) => {
    const pageBreakStyle = getPageBreakStyle(pageBreakBehavior);
    const parsedHeight = parseInt(height, 10) || 300;
    const parsedWidth = parseInt(width, 10) || 600;
    const colorArray = colors.split(',').map((c) => c.trim()).filter(Boolean);

    let seriesConfig: SeriesConfig[] = [];
    try {
      const parsed: unknown = JSON.parse(series || '[]');
      if (Array.isArray(parsed)) seriesConfig = parsed as SeriesConfig[];
    } catch { /* ignore */ }

    let data: Array<Record<string, string | number>> = SAMPLE_DATA;
    if (chartType === 'stackedBar') data = STACKED_BAR_SAMPLE_DATA;
    else if (seriesConfig.length > 0) data = MULTI_SERIES_SAMPLE_DATA;

    const chartProps = {
      chartType, xField, yField, title, subtitle, height, width,
      colors, showLegend, showGrid, showTooltip: 'false', series,
      xAxisFormat: 'category' as const, yAxisFormat, xAxisRotation,
      centerLabel, backgroundColor, containerBorder, pageBreakBehavior,
      dataExpression: '',
    };

    let chartSvg: React.ReactNode;
    if (chartType === 'bar') {
      chartSvg = renderBarChart(data, chartProps, parsedWidth, parsedHeight, colorArray, seriesConfig, false);
    } else if (chartType === 'stackedBar') {
      chartSvg = renderBarChart(data, chartProps, parsedWidth, parsedHeight, colorArray, seriesConfig, true);
    } else if (chartType === 'line') {
      chartSvg = renderLineAreaChart(data, chartProps, parsedWidth, parsedHeight, colorArray, seriesConfig, false);
    } else if (chartType === 'area') {
      chartSvg = renderLineAreaChart(data, chartProps, parsedWidth, parsedHeight, colorArray, seriesConfig, true);
    } else {
      chartSvg = renderPieChart(data, chartProps, parsedWidth, parsedHeight, colorArray, chartType === 'donut');
    }

    const wrapperStyle: React.CSSProperties = {
      backgroundColor: backgroundColor || 'transparent',
      border: containerBorder === 'true' ? '1px solid #d1d5db' : 'none',
      padding: containerBorder === 'true' || backgroundColor ? '16px' : '0',
      borderRadius: containerBorder === 'true' ? '8px' : '0',
      ...pageBreakStyle,
    };

    return (
      <div style={wrapperStyle}>
        {title && <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600, color: '#111827' }}>{title}</h3>}
        {subtitle && <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280' }}>{subtitle}</p>}
        <div style={{ width: '100%', height: `${parsedHeight}px` }}>{chartSvg}</div>
      </div>
    );
  },
};
