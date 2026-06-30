import { useEffect, useRef, useState } from 'react';
import { mmToPx, pxToMm, clampPosition, roundPxToMm, visualBBox } from '@imposition/core';
import { useImpositionStore } from '../store';

export type Guideline =
  | { axis: 'x'; x: number }
  | { axis: 'y'; y: number };

const SNAP_THRESHOLD = 8;

function getBBox(item: {
  x: number;
  y: number;
  widthMm: number;
  heightMm: number;
  rotation: number;
}) {
  const w = mmToPx(item.widthMm);
  const h = mmToPx(item.heightMm);
  const vb = visualBBox(w, h, item.rotation);
  const left = item.x + w / 2 - vb.w / 2;
  const top = item.y + h / 2 - vb.h / 2;
  return {
    left,
    right: left + vb.w,
    top,
    bottom: top + vb.h,
    centerX: item.x + w / 2,
    centerY: item.y + h / 2,
  };
}

function findSnaps(
  dragged: { x: number; y: number; w: number; h: number; rotation: number },
  others: { x: number; y: number; widthMm: number; heightMm: number; rotation: number }[],
) {
  const draggedBox = getBBox({
    x: dragged.x,
    y: dragged.y,
    widthMm: pxToMm(dragged.w),
    heightMm: pxToMm(dragged.h),
    rotation: dragged.rotation,
  });

  const candidates: {
    axis: 'x' | 'y';
    target: number;
    source: number;
    delta: number;
  }[] = [];

  others.forEach((item) => {
    const box = getBBox(item);
    const pairsX = [
      { target: box.left, source: draggedBox.left },
      { target: box.right, source: draggedBox.right },
      { target: box.centerX, source: draggedBox.centerX },
      { target: box.left, source: draggedBox.right },
      { target: box.right, source: draggedBox.left },
      { target: box.centerX, source: draggedBox.left },
      { target: box.centerX, source: draggedBox.right },
      { target: box.left, source: draggedBox.centerX },
      { target: box.right, source: draggedBox.centerX },
    ];
    const pairsY = [
      { target: box.top, source: draggedBox.top },
      { target: box.bottom, source: draggedBox.bottom },
      { target: box.centerY, source: draggedBox.centerY },
      { target: box.top, source: draggedBox.bottom },
      { target: box.bottom, source: draggedBox.top },
      { target: box.centerY, source: draggedBox.top },
      { target: box.centerY, source: draggedBox.bottom },
      { target: box.top, source: draggedBox.centerY },
      { target: box.bottom, source: draggedBox.centerY },
    ];

    pairsX.forEach(({ target, source }) => {
      const delta = target - source;
      if (Math.abs(delta) <= SNAP_THRESHOLD) {
        candidates.push({ axis: 'x', target, source, delta });
      }
    });
    pairsY.forEach(({ target, source }) => {
      const delta = target - source;
      if (Math.abs(delta) <= SNAP_THRESHOLD) {
        candidates.push({ axis: 'y', target, source, delta });
      }
    });
  });

  if (candidates.length === 0) {
    return { x: dragged.x, y: dragged.y, guidelines: [] as Guideline[] };
  }

  const bestX = candidates
    .filter((c) => c.axis === 'x')
    .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta))[0];
  const bestY = candidates
    .filter((c) => c.axis === 'y')
    .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta))[0];

  const snappedX = bestX ? dragged.x + bestX.delta : dragged.x;
  const snappedY = bestY ? dragged.y + bestY.delta : dragged.y;

  const guidelines: Guideline[] = [];
  if (bestX) guidelines.push({ axis: 'x', x: bestX.target });
  if (bestY) guidelines.push({ axis: 'y', y: bestY.target });

  return { x: snappedX, y: snappedY, guidelines };
}

export function useDrag() {
  const [dragId, setDragId] = useState<string | null>(null);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const dragStart = useRef({ x: 0, y: 0, origX: 0, origY: 0 });

  const startDrag = (
    id: string,
    item: { x: number; y: number },
    e: { clientX: number; clientY: number },
  ) => {
    setDragId(id);
    setGuidelines([]);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      origX: item.x,
      origY: item.y,
    };
  };

  useEffect(() => {
    if (dragId === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const state = useImpositionStore.getState();
      const item = state.items.find((i) => i.id === dragId);
      if (!item || item.copies === 0) return;

      const w = mmToPx(item.widthMm);
      const h = mmToPx(item.heightMm);
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const rawX = roundPxToMm(dragStart.current.origX + dx);
      const rawY = roundPxToMm(dragStart.current.origY + dy);

      const others = state.items.filter(
        (i) => i.id !== dragId && i.copies > 0,
      );

      const { x: snappedX, y: snappedY, guidelines: snaps } = state.interactiveGrid
        ? findSnaps(
            { x: rawX, y: rawY, w, h, rotation: item.rotation },
            others,
          )
        : { x: rawX, y: rawY, guidelines: [] as Guideline[] };

      const clamped = clampPosition(snappedX, snappedY, w, h, item.rotation);
      useImpositionStore.getState().updateItem(dragId, { x: clamped.x, y: clamped.y });
      setGuidelines(snaps);
    };

    const handleMouseUp = () => {
      setDragId(null);
      setGuidelines([]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragId]);

  return { startDrag, isDragging: dragId !== null, guidelines };
}
