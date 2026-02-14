import { describe, it, expect } from 'vitest';
import { APP_NAME } from '../index';

describe('shared', () => {
  it('exports APP_NAME', () => {
    expect(APP_NAME).toBe('Pressroom');
  });
});
