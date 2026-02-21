import { describe, it, expect } from 'vitest';
import { puckConfig } from '@/lib/puck/config';

describe('puckConfig', () => {
  it('has all 13 components registered', () => {
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
    expect(puckConfig.components).toHaveProperty('FlexBox');
  });

  it('does not have removed specialized components', () => {
    expect(puckConfig.components).not.toHaveProperty('MetricCard');
    expect(puckConfig.components).not.toHaveProperty('StatCard');
    expect(puckConfig.components).not.toHaveProperty('BenchmarkTable');
    expect(puckConfig.components).not.toHaveProperty('EditorialCard');
    expect(puckConfig.components).not.toHaveProperty('EditorialGrid');
    expect(puckConfig.components).not.toHaveProperty('EditorialStack');
    expect(puckConfig.components).not.toHaveProperty('Repeater');
    expect(puckConfig.components).not.toHaveProperty('ConditionalBlock');
  });

  it('has layout, content, data, and charts categories', () => {
    expect(puckConfig.categories).toHaveProperty('layout');
    expect(puckConfig.categories).toHaveProperty('content');
    expect(puckConfig.categories).toHaveProperty('data');
    expect(puckConfig.categories).toHaveProperty('charts');
  });

  it('does not have logic category (ConditionalBlock and Repeater removed)', () => {
    expect(puckConfig.categories).not.toHaveProperty('logic');
  });

  it('assigns FlexBox, Container, GridRow, GridColumn, Section, Spacer, Divider, and PageBreak to layout category', () => {
    expect(puckConfig.categories?.layout?.components).toContain('FlexBox');
    expect(puckConfig.categories?.layout?.components).toContain('Container');
    expect(puckConfig.categories?.layout?.components).toContain('GridRow');
    expect(puckConfig.categories?.layout?.components).toContain('GridColumn');
    expect(puckConfig.categories?.layout?.components).toContain('Section');
    expect(puckConfig.categories?.layout?.components).toContain('Spacer');
    expect(puckConfig.categories?.layout?.components).toContain('Divider');
    expect(puckConfig.categories?.layout?.components).toContain('PageBreak');
  });

  it('assigns TextBlock, HeadingBlock, and ImageBlock to content category', () => {
    expect(puckConfig.categories?.content?.components).toContain('TextBlock');
    expect(puckConfig.categories?.content?.components).toContain('HeadingBlock');
    expect(puckConfig.categories?.content?.components).toContain('ImageBlock');
  });

  it('assigns DataTable to data category', () => {
    expect(puckConfig.categories?.data?.components).toContain('DataTable');
  });

  it('assigns ChartBlock to charts category', () => {
    expect(puckConfig.categories?.charts?.components).toContain('ChartBlock');
  });
});
