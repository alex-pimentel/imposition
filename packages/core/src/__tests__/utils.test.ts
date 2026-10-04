import { describe, expect, it } from 'vitest';
import {
  clamp,
  mmToPx,
  pxToMm,
  roundPxToMm,
  visualBBox,
  mmToUnit,
  unitToMm,
  makeId,
  clampPosition,
} from '../utils';
import { MM_TO_PX, PAGE_WIDTH_PX, PAGE_HEIGHT_PX } from '../constants';

describe('utils', () => {
  it('converts between mm and px', () => {
    expect(mmToPx(10)).toBeCloseTo(10 * MM_TO_PX, 6);
    expect(pxToMm(MM_TO_PX * 10)).toBeCloseTo(10, 6);
    expect(mmToPx(pxToMm(123))).toBeCloseTo(123, 6);
  });

  it('clamps values to the given range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it('rounds pixels to whole millimetres', () => {
    expect(roundPxToMm(mmToPx(8.4))).toBeCloseTo(mmToPx(8), 6);
    expect(roundPxToMm(mmToPx(8.6))).toBeCloseTo(mmToPx(9), 6);
  });

  it('computes an axis-aligned bounding box for rotations', () => {
    expect(visualBBox(100, 50, 0)).toEqual({ w: 100, h: 50 });
    const rotated = visualBBox(100, 50, 90);
    expect(rotated.w).toBeCloseTo(50, 6);
    expect(rotated.h).toBeCloseTo(100, 6);
  });

  it('converts mm to display units', () => {
    expect(mmToUnit(20, 'mm')).toBe(20);
    expect(mmToUnit(20, 'cm')).toBe(2);
    expect(unitToMm(2, 'cm')).toBe(20);
    expect(unitToMm(7, 'mm')).toBe(7);
  });

  it('generates reasonably unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => makeId()));
    expect(ids.size).toBeGreaterThan(90);
  });

  it('clamps positions within the page bounds', () => {
    const w = mmToPx(50);
    const h = mmToPx(50);
    const inside = clampPosition(w, h, w, h, 0);
    expect(inside).toEqual({ x: w, y: h });

    const negative = clampPosition(-1000, -1000, w, h, 0);
    expect(negative.x).toBeGreaterThanOrEqual(0);
    expect(negative.y).toBeGreaterThanOrEqual(0);

    const beyond = clampPosition(99999, 99999, w, h, 0);
    expect(beyond.x).toBeLessThanOrEqual(PAGE_WIDTH_PX - w);
    expect(beyond.y).toBeLessThanOrEqual(PAGE_HEIGHT_PX - h);
  });
});
