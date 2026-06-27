import { PAGE_WIDTH_PX, PAGE_HEIGHT_PX, DEFAULT_GAP_MM } from './constants';
import type { ImpositionItem } from './types';
import { mmToPx, roundPxToMm } from './utils';

const rectsOverlap = (
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

export const findFreeSpot = (
  items: ImpositionItem[],
  widthMm: number,
  heightMm: number,
) => {
  const marginPx = mmToPx(8);
  const gapPx = mmToPx(4);
  const stepPx = 8;
  const wPx = mmToPx(widthMm);
  const hPx = mmToPx(heightMm);

  const occupied = items.map((item) => ({
    left: item.x - gapPx,
    top: item.y - gapPx,
    right: item.x + mmToPx(item.widthMm) + gapPx,
    bottom: item.y + mmToPx(item.heightMm) + gapPx,
  }));

  for (let y = marginPx; y + hPx <= PAGE_HEIGHT_PX - marginPx; y += stepPx) {
    for (let x = marginPx; x + wPx <= PAGE_WIDTH_PX - marginPx; x += stepPx) {
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
  options: { randomize?: boolean } = {},
) => {
  const gapPx = mmToPx(DEFAULT_GAP_MM);
  const items = sourceItems.map((item) => ({ ...item }));

  let cursorX = 0;
  let cursorY = 0;
  let rowHeight = 0;

  const withRandom = options.randomize === true;

  items.forEach((item) => {
    const marginPx = mmToPx(item.marginMm);
    const widthPx = mmToPx(item.widthMm);
    const heightPx = mmToPx(item.heightMm);

    const rightBoundary = PAGE_WIDTH_PX - marginPx;
    const bottomBoundary = PAGE_HEIGHT_PX - marginPx;

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
