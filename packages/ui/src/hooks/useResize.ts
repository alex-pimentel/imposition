import { useEffect, useRef, useState } from 'react';
import { mmToPx, pxToMm, clamp } from '@imposition/core';
import { useImpositionStore } from '../store';

export function useResize() {
  const [resizeId, setResizeId] = useState<string | null>(null);
  const resizeStart = useRef({
    x: 0, y: 0, origW: 0, origH: 0,
    vpOffsetX: 0, vpOffsetY: 0,
    pfCx: 0, pfCy: 0, pfLeft: 0, pfTop: 0,
  });

  const startResize = (
    id: string,
    item: { x: number; y: number; widthMm: number; heightMm: number; rotation: number },
    pageFrameRect: DOMRect,
    e: { clientX: number; clientY: number },
  ) => {
    setResizeId(id);
    const w = mmToPx(item.widthMm);
    const h = mmToPx(item.heightMm);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      origW: w,
      origH: h,
      vpOffsetX: pageFrameRect.left,
      vpOffsetY: pageFrameRect.top,
      pfCx: item.x + w / 2,
      pfCy: item.y + h / 2,
      pfLeft: item.x,
      pfTop: item.y,
    };
  };

  useEffect(() => {
    if (resizeId === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const state = useImpositionStore.getState();
      const item = state.items.find((i) => i.id === resizeId);
      if (!item) return;

      const pageWPx = mmToPx(state.pageWidthMm);
      const pageHPx = mmToPx(state.pageHeightMm);
      const rad = (-item.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const mousePx = clamp(e.clientX - resizeStart.current.vpOffsetX, 0, pageWPx);
      const mousePy = clamp(e.clientY - resizeStart.current.vpOffsetY, 0, pageHPx);
      const dx = mousePx - resizeStart.current.pfCx;
      const dy = mousePy - resizeStart.current.pfCy;
      const localDx = dx * cos - dy * sin;
      const localDy = dx * sin + dy * cos;
      const cornerX = localDx + resizeStart.current.origW / 2;
      const cornerY = localDy + resizeStart.current.origH / 2;
      const newW = Math.max(mmToPx(5), cornerX);
      const newH = Math.max(mmToPx(5), cornerY);

      useImpositionStore.getState().updateItem(resizeId, {
        x: resizeStart.current.pfLeft,
        y: resizeStart.current.pfTop,
        widthMm: Math.round(pxToMm(newW)),
        heightMm: Math.round(pxToMm(newH)),
      });
    };

    const handleMouseUp = () => setResizeId(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeId]);

  return { startResize, isResizing: resizeId !== null };
}
