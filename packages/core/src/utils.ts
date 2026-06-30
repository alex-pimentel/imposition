import { MM_TO_PX, PAGE_WIDTH_PX, PAGE_HEIGHT_PX } from './constants';

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const mmToPx = (mm: number) => mm * MM_TO_PX;

export const pxToMm = (px: number) => px / MM_TO_PX;

export const roundPxToMm = (px: number) => Math.round(pxToMm(px)) * MM_TO_PX;

export const visualBBox = (wPx: number, hPx: number, rotation: number) => {
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return { w: wPx * cos + hPx * sin, h: wPx * sin + hPx * cos };
};

export const mmToUnit = (mm: number, unit: 'mm' | 'cm') => (unit === 'cm' ? mm / 10 : mm);

export const unitToMm = (value: number, unit: 'mm' | 'cm') =>
  Math.round(unit === 'cm' ? value * 10 : value);

export const makeId = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

export const clampPosition = (
  x: number,
  y: number,
  w: number,
  h: number,
  rotation: number,
  pageWidthPx = PAGE_WIDTH_PX,
  pageHeightPx = PAGE_HEIGHT_PX,
) => {
  const vb = visualBBox(w, h, rotation);
  return {
    x: clamp(x, vb.w / 2 - w / 2, pageWidthPx - w / 2 - vb.w / 2),
    y: clamp(y, vb.h / 2 - h / 2, pageHeightPx - h / 2 - vb.h / 2),
  };
};
