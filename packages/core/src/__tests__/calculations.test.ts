import { describe, expect, it } from 'vitest';
import { calculateUtilization } from '../calculations';
import type { ImpositionItem } from '../types';

const item = (overrides: Partial<ImpositionItem> = {}): ImpositionItem => ({
  id: 'a',
  name: 'a.png',
  src: 'data:image/png;base64,AAAA',
  naturalWidth: 100,
  naturalHeight: 100,
  widthMm: 100,
  heightMm: 100,
  copies: 1,
  x: 0,
  y: 0,
  rotation: 0,
  ...overrides,
});

describe('calculateUtilization', () => {
  it('is zero when there are no items', () => {
    expect(calculateUtilization([])).toBe(0);
  });

  it('is zero when every item has zero copies', () => {
    expect(calculateUtilization([item({ copies: 0 })])).toBe(0);
  });

  it('returns a positive percentage for placed items', () => {
    const value = calculateUtilization([item()]);
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThanOrEqual(100);
  });

  it('is clamped to 100 when items exceed the page', () => {
    const items = Array.from({ length: 20 }, (_, i) => item({ id: `i${i}` }));
    expect(calculateUtilization(items)).toBe(100);
  });
});
