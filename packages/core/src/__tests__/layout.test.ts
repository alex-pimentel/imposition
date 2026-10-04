import { describe, expect, it } from 'vitest';
import { findFreeSpot, placeItems } from '../layout';
import { mmToPx } from '../utils';
import { PAGE_WIDTH_PX, PAGE_HEIGHT_PX, DEFAULT_MARGIN_MM } from '../constants';
import type { ImpositionItem } from '../types';

const makeItem = (overrides: Partial<ImpositionItem> = {}): ImpositionItem => ({
  id: 'a',
  name: 'a.png',
  src: 'data:image/png;base64,AAAA',
  naturalWidth: 100,
  naturalHeight: 100,
  widthMm: 40,
  heightMm: 40,
  copies: 1,
  x: 0,
  y: 0,
  rotation: 0,
  ...overrides,
});

describe('placeItems', () => {
  it('starts at the margin and advances deterministically', () => {
    const items = [makeItem({ id: '1' }), makeItem({ id: '2' })];
    const placed = placeItems(items, { randomize: false });

    const margin = mmToPx(DEFAULT_MARGIN_MM);
    expect(placed[0].x).toBeCloseTo(margin, 6);
    expect(placed[0].y).toBeCloseTo(margin, 6);
    expect(placed[1].x).toBeGreaterThan(placed[0].x);
    expect(placed[1].y).toBeCloseTo(margin, 6);
  });

  it('wraps to the next row when a row overflows', () => {
    const items = Array.from({ length: 10 }, (_, i) => makeItem({ id: `i${i}`, widthMm: 80 }));
    const placed = placeItems(items, { randomize: false });
    const secondRow = placed.filter((item) => item.y > mmToPx(DEFAULT_MARGIN_MM));
    expect(secondRow.length).toBeGreaterThan(0);
  });

  it('does not mutate the source items', () => {
    const source = makeItem({ id: '1', x: 0, y: 0 });
    const placed = placeItems([source], { randomize: false });
    expect(source.x).toBe(0);
    expect(placed[0]).not.toBe(source);
  });
});

describe('findFreeSpot', () => {
  it('returns the top-left margin when nothing is placed', () => {
    const spot = findFreeSpot([], 40, 40);
    expect(spot.x).toBeCloseTo(mmToPx(DEFAULT_MARGIN_MM), 6);
    expect(spot.y).toBeCloseTo(mmToPx(DEFAULT_MARGIN_MM), 6);
  });

  it('avoids overlapping an existing item', () => {
    const margin = mmToPx(DEFAULT_MARGIN_MM);
    const existing = makeItem({ x: margin, y: margin, widthMm: 40, heightMm: 40 });
    const spot = findFreeSpot([existing], 40, 40);
    const overlaps = spot.x === margin && spot.y === margin;
    expect(overlaps).toBe(false);
  });

  it('falls back to the margin when the page is full', () => {
    const full = Array.from({ length: 40 }, (_, i) =>
      makeItem({ id: `f${i}`, x: mmToPx(8), y: mmToPx(8 + i * 45), widthMm: 190, heightMm: 45 }),
    );
    const spot = findFreeSpot(full, 190, 45);
    expect(spot.x).toBeCloseTo(mmToPx(DEFAULT_MARGIN_MM), 6);
    expect(spot.y).toBeCloseTo(mmToPx(DEFAULT_MARGIN_MM), 6);
  });

  it('respects a custom page size', () => {
    const spot = findFreeSpot([], 40, 40, 8, PAGE_WIDTH_PX, PAGE_HEIGHT_PX);
    expect(spot.x).toBeGreaterThanOrEqual(0);
    expect(spot.y).toBeGreaterThanOrEqual(0);
  });
});
