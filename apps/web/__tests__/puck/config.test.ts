import { describe, it, expect } from 'vitest';
import { puckConfig } from '@/lib/puck/config';

describe('puckConfig', () => {
  it('has all 14 components registered', () => {
    expect(puckConfig.components).toHaveProperty('TextBlock');
    expect(puckConfig.components).toHaveProperty('HeadingBlock');
    expect(puckConfig.components).toHaveProperty('ImageBlock');
    expect(puckConfig.components).toHaveProperty('Spacer');
    expect(puckConfig.components).toHaveProperty('Divider');
    expect(puckConfig.components).toHaveProperty('PageBreak');
    expect(puckConfig.components).toHaveProperty('ReportHeader');
    expect(puckConfig.components).toHaveProperty('ReportFooter');
    expect(puckConfig.components).toHaveProperty('DataTable');
    expect(puckConfig.components).toHaveProperty('ChartBlock');
    expect(puckConfig.components).toHaveProperty('Container');
    expect(puckConfig.components).toHaveProperty('GridRow');
    expect(puckConfig.components).toHaveProperty('GridColumn');
    expect(puckConfig.components).toHaveProperty('Section');
  });

  it('has layout, content, header_footer, data, and charts categories', () => {
    expect(puckConfig.categories).toHaveProperty('layout');
    expect(puckConfig.categories).toHaveProperty('content');
    expect(puckConfig.categories).toHaveProperty('header_footer');
    expect(puckConfig.categories).toHaveProperty('data');
    expect(puckConfig.categories).toHaveProperty('charts');
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

  it('assigns TextBlock, HeadingBlock, and ImageBlock to content category', () => {
    expect(puckConfig.categories?.content?.components).toContain('TextBlock');
    expect(puckConfig.categories?.content?.components).toContain('HeadingBlock');
    expect(puckConfig.categories?.content?.components).toContain('ImageBlock');
  });

  it('assigns ReportHeader and ReportFooter to header_footer category', () => {
    expect(puckConfig.categories?.header_footer?.components).toContain('ReportHeader');
    expect(puckConfig.categories?.header_footer?.components).toContain('ReportFooter');
  });

  it('assigns DataTable to data category', () => {
    expect(puckConfig.categories?.data?.components).toContain('DataTable');
  });

  it('assigns ChartBlock to charts category', () => {
    expect(puckConfig.categories?.charts?.components).toContain('ChartBlock');
  });
});
