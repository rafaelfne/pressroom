import { describe, it, expect } from 'vitest';
import { puckConfig } from '@/lib/puck/config';

describe('puckConfig', () => {
  it('has TextBlock and Spacer components registered', () => {
    expect(puckConfig.components).toHaveProperty('TextBlock');
    expect(puckConfig.components).toHaveProperty('Spacer');
  });

  it('has layout and content categories', () => {
    expect(puckConfig.categories).toHaveProperty('layout');
    expect(puckConfig.categories).toHaveProperty('content');
  });

  it('assigns Spacer to layout category', () => {
    expect(puckConfig.categories?.layout?.components).toContain('Spacer');
  });

  it('assigns TextBlock to content category', () => {
    expect(puckConfig.categories?.content?.components).toContain('TextBlock');
  });
});
