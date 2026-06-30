import { PAGE_WIDTH_PX, PAGE_HEIGHT_PX, DEFAULT_GAP_MM, DEFAULT_MARGIN_MM } from './constants';
import type { ImpositionItem } from './types';
import { mmToPx, roundPxToMm } from './utils';

const rectsOverlap = (
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

export const findFreeSpot = (
  items: ImpositionItem[],
  widthMm: number,
  heightMm: number,
  pageMarginMm = 8,
  pageWidthPx = PAGE_WIDTH_PX,
  pageHeightPx = PAGE_HEIGHT_PX,
) => {
  const marginPx = mmToPx(pageMarginMm);
  const gapPx = mmToPx(pageMarginMm / 2);
  const stepPx = 8;
  const wPx = mmToPx(widthMm);
  const hPx = mmToPx(heightMm);

  const occupied = items.map((item) => ({
    left: item.x - gapPx,
    top: item.y - gapPx,
    right: item.x + mmToPx(item.widthMm) + gapPx,
    bottom: item.y + mmToPx(item.heightMm) + gapPx,
  }));

  for (let y = marginPx; y + hPx <= pageHeightPx - marginPx; y += stepPx) {
    for (let x = marginPx; x + wPx <= pageWidthPx - marginPx; x += stepPx) {
      const candidate = { left: x, top: y, right: x + wPx, bottom: y + hPx };
      if (!occupied.some((r) => rectsOverlap(candidate, r))) {
        return { x: roundPxToMm(x), y: roundPxToMm(y) };
      }
    }
  }

  return { x: roundPxToMm(marginPx), y: roundPxToMm(marginPx) };
};

export const placeItems = (
  sourceItems: ImpositionItem[],
  options: {
    randomize?: boolean;
    pageMarginMm?: number;
    pageWidthPx?: number;
    pageHeightPx?: number;
  } = {},
) => {
  const {
    randomize = false,
    pageMarginMm,
    pageWidthPx = PAGE_WIDTH_PX,
    pageHeightPx = PAGE_HEIGHT_PX,
  } = options;
  const marginPx = mmToPx(pageMarginMm ?? DEFAULT_MARGIN_MM);
  const gapPx = mmToPx(pageMarginMm !== undefined ? pageMarginMm / 2 : DEFAULT_GAP_MM);
  const items = sourceItems.map((item) => ({ ...item }));

  let cursorX = 0;
  let cursorY = 0;
  let rowHeight = 0;

  const withRandom = randomize;

  items.forEach((item) => {
    const widthPx = mmToPx(item.widthMm);
    const heightPx = mmToPx(item.heightMm);

    const rightBoundary = pageWidthPx - marginPx;
    const bottomBoundary = pageHeightPx - marginPx;

    if (cursorX === 0 && cursorY === 0) {
      cursorX = marginPx;
      cursorY = marginPx;
    }

    if (cursorX + widthPx > rightBoundary) {
      cursorX = marginPx;
      cursorY += rowHeight + gapPx;
      rowHeight = 0;
    }

    if (cursorY + heightPx > bottomBoundary) {
      cursorX = marginPx;
      cursorY += gapPx;
    }

    item.x = roundPxToMm(cursorX + (withRandom ? Math.random() * 8 : 0));
    item.y = roundPxToMm(cursorY + (withRandom ? Math.random() * 8 : 0));

    cursorX += widthPx + gapPx;
    rowHeight = Math.max(rowHeight, heightPx);
  });

  return items;
};
