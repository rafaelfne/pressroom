import { describe, it, expect } from 'vitest';
import { puckConfig } from '@/lib/puck/config';

describe('puckConfig', () => {
  it('has all 8 components registered', () => {
    expect(puckConfig.components).toHaveProperty('TextBlock');
    expect(puckConfig.components).toHaveProperty('HeadingBlock');
    expect(puckConfig.components).toHaveProperty('ImageBlock');
    expect(puckConfig.components).toHaveProperty('Spacer');
    expect(puckConfig.components).toHaveProperty('Divider');
    expect(puckConfig.components).toHaveProperty('PageBreak');
    expect(puckConfig.components).toHaveProperty('ReportHeader');
    expect(puckConfig.components).toHaveProperty('ReportFooter');
  });

  it('has layout, content, and header_footer categories', () => {
    expect(puckConfig.categories).toHaveProperty('layout');
    expect(puckConfig.categories).toHaveProperty('content');
    expect(puckConfig.categories).toHaveProperty('header_footer');
  });

  it('assigns Spacer, Divider, and PageBreak to layout category', () => {
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
});
