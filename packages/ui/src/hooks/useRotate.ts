import { useEffect, useRef, useState } from 'react';
import { mmToPx } from '@imposition/core';
import { useImpositionStore } from '../store';

export function useRotate() {
  const [rotateId, setRotateId] = useState<string | null>(null);
  const rotateStart = useRef({ x: 0, y: 0, origRotation: 0, cx: 0, cy: 0 });

  const startRotate = (
    id: string,
    item: { x: number; y: number; widthMm: number; heightMm: number; rotation: number },
    pageFrameRect: DOMRect,
    e: { clientX: number; clientY: number },
  ) => {
    setRotateId(id);
    const w = mmToPx(item.widthMm);
    const h = mmToPx(item.heightMm);
    rotateStart.current = {
      x: e.clientX,
      y: e.clientY,
      origRotation: item.rotation,
      cx: pageFrameRect.left + item.x + w / 2,
      cy: pageFrameRect.top + item.y + h / 2,
    };
  };

  useEffect(() => {
    if (rotateId === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const item = useImpositionStore.getState().items.find((i) => i.id === rotateId);
      if (!item) return;

      const dx = e.clientX - rotateStart.current.cx;
      const dy = e.clientY - rotateStart.current.cy;
      const startDx = rotateStart.current.x - rotateStart.current.cx;
      const startDy = rotateStart.current.y - rotateStart.current.cy;
      const startAngle = Math.atan2(startDy, startDx);
      const currentAngle = Math.atan2(dy, dx);
      const deltaAngle = currentAngle - startAngle;
      const deltaDeg = deltaAngle * (180 / Math.PI);
      const rawRotation = rotateStart.current.origRotation + deltaDeg;
      const newRotation = ((Math.round(rawRotation) % 360) + 360 + 360) % 360;

      useImpositionStore.getState().updateItem(rotateId, { rotation: newRotation });
    };

    const handleMouseUp = () => setRotateId(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [rotateId]);

  return { startRotate, isRotating: rotateId !== null };
}
