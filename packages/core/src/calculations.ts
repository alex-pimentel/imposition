import { PAGE_WIDTH_PX, PAGE_HEIGHT_PX } from './constants';
import type { ImpositionItem } from './types';
import { mmToPx, clamp } from './utils';

export const calculateUtilization = (items: ImpositionItem[]) => {
  const totalArea = PAGE_WIDTH_PX * PAGE_HEIGHT_PX;
  const usedArea = items.reduce((total, item) => {
    if (item.copies === 0) return total;
    const width = mmToPx(item.widthMm);
    const height = mmToPx(item.heightMm);
    return total + width * height;
  }, 0);

  return clamp((usedArea / totalArea) * 100, 0, 100);
};
