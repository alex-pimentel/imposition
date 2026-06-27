import { useEffect, useRef, useState } from 'react';
import { mmToPx, clampPosition, roundPxToMm } from '@imposition/core';
import { useImpositionStore } from '../store';

export function useDrag() {
  const [dragId, setDragId] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, origX: 0, origY: 0 });

  const startDrag = (
    id: string,
    item: { x: number; y: number },
    e: { clientX: number; clientY: number },
  ) => {
    setDragId(id);
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
      const item = useImpositionStore.getState().items.find((i) => i.id === dragId);
      if (!item) return;
      const w = mmToPx(item.widthMm);
      const h = mmToPx(item.heightMm);
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const newX = roundPxToMm(dragStart.current.origX + dx);
      const newY = roundPxToMm(dragStart.current.origY + dy);
      const clamped = clampPosition(newX, newY, w, h, item.rotation);
      useImpositionStore.getState().updateItem(dragId, { x: clamped.x, y: clamped.y });
    };

    const handleMouseUp = () => setDragId(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragId]);

  return { startDrag, isDragging: dragId !== null };
}
