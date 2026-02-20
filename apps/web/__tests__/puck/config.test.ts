import { describe, it, expect } from 'vitest';
import { puckConfig } from '@/lib/puck/config';

describe('puckConfig', () => {
  it('has all 20 components registered', () => {
    expect(puckConfig.components).toHaveProperty('TextBlock');
    expect(puckConfig.components).toHaveProperty('HeadingBlock');
    expect(puckConfig.components).toHaveProperty('ImageBlock');
    expect(puckConfig.components).toHaveProperty('Spacer');
    expect(puckConfig.components).toHaveProperty('Divider');
    expect(puckConfig.components).toHaveProperty('PageBreak');
    expect(puckConfig.components).toHaveProperty('DataTable');
    expect(puckConfig.components).toHaveProperty('ChartBlock');
    expect(puckConfig.components).toHaveProperty('Container');
    expect(puckConfig.components).toHaveProperty('GridRow');
    expect(puckConfig.components).toHaveProperty('GridColumn');
    expect(puckConfig.components).toHaveProperty('Section');
    expect(puckConfig.components).toHaveProperty('MetricCard');
    expect(puckConfig.components).toHaveProperty('StatCard');
    expect(puckConfig.components).toHaveProperty('BenchmarkTable');
    expect(puckConfig.components).toHaveProperty('EditorialCard');
    expect(puckConfig.components).toHaveProperty('EditorialGrid');
    expect(puckConfig.components).toHaveProperty('EditorialStack');
    expect(puckConfig.components).toHaveProperty('Repeater');
    expect(puckConfig.components).toHaveProperty('ConditionalBlock');
  });

  it('has layout, content, data, charts, and logic categories', () => {
    expect(puckConfig.categories).toHaveProperty('layout');
    expect(puckConfig.categories).toHaveProperty('content');
    expect(puckConfig.categories).toHaveProperty('data');
    expect(puckConfig.categories).toHaveProperty('charts');
    expect(puckConfig.categories).toHaveProperty('logic');
  });

  it('assigns Container, GridRow, GridColumn, Section, Spacer, Divider, and PageBreak to layout category', () => {
    expect(puckConfig.categories?.layout?.components).toContain('Container');
    expect(puckConfig.categories?.layout?.components).toContain('GridRow');
    expect(puckConfig.categories?.layout?.components).toContain('GridColumn');
    expect(puckConfig.categories?.layout?.components).toContain('Section');
    expect(puckConfig.categories?.layout?.components).toContain('Spacer');
    expect(puckConfig.categories?.layout?.components).toContain('Divider');
    expect(puckConfig.categories?.layout?.components).toContain('PageBreak');
  });

  it('assigns TextBlock, HeadingBlock, ImageBlock, EditorialCard, EditorialGrid, and EditorialStack to content category', () => {
    expect(puckConfig.categories?.content?.components).toContain('TextBlock');
    expect(puckConfig.categories?.content?.components).toContain('HeadingBlock');
    expect(puckConfig.categories?.content?.components).toContain('ImageBlock');
    expect(puckConfig.categories?.content?.components).toContain('EditorialCard');
    expect(puckConfig.categories?.content?.components).toContain('EditorialGrid');
    expect(puckConfig.categories?.content?.components).toContain('EditorialStack');
  });

  it('assigns DataTable, MetricCard, StatCard, and BenchmarkTable to data category', () => {
    expect(puckConfig.categories?.data?.components).toContain('DataTable');
    expect(puckConfig.categories?.data?.components).toContain('MetricCard');
    expect(puckConfig.categories?.data?.components).toContain('StatCard');
    expect(puckConfig.categories?.data?.components).toContain('BenchmarkTable');
  });

  it('assigns ChartBlock to charts category', () => {
    expect(puckConfig.categories?.charts?.components).toContain('ChartBlock');
  });

  it('assigns Repeater and ConditionalBlock to logic category', () => {
    expect(puckConfig.categories?.logic?.components).toContain('Repeater');
    expect(puckConfig.categories?.logic?.components).toContain('ConditionalBlock');
  });
});
