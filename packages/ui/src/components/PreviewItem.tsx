import React from 'react';
import type { ImpositionItem } from '@imposition/core';
import { mmToPx } from '@imposition/core';
import { useImpositionStore, selectSelectedItem } from '../store';
import { useDrag } from '../hooks/useDrag';
import { useRotate } from '../hooks/useRotate';
import { useResize } from '../hooks/useResize';

type PreviewItemProps = {
  item: ImpositionItem;
  pageFrameRef: React.RefObject<HTMLDivElement | null>;
  dragHook: ReturnType<typeof useDrag>;
  rotateHook: ReturnType<typeof useRotate>;
  resizeHook: ReturnType<typeof useResize>;
};

export function PreviewItem({
  item,
  pageFrameRef,
  dragHook,
  rotateHook,
  resizeHook,
}: PreviewItemProps) {
  const selectedItem = useImpositionStore(selectSelectedItem);
  const setSelectedId = useImpositionStore((s) => s.setSelectedId);

  const w = mmToPx(item.widthMm);
  const h = mmToPx(item.heightMm);
  const cx = item.x + w / 2;
  const cy = item.y + h / 2;
  const rad = (item.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const isSelected = selectedItem?.id === item.id;

  const gap = 18;
  const rotX = cx + sin * (h / 2 + gap);
  const rotY = cy - cos * (h / 2 + gap);

  const resX = cx + cos * (w / 2) - sin * (h / 2);
  const resY = cy + sin * (w / 2) + cos * (h / 2);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedId(item.id);
    dragHook.startDrag(item.id, item, e);
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(item.id);
    const rect = pageFrameRef.current!.getBoundingClientRect();
    rotateHook.startRotate(item.id, item, rect, e);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(item.id);
    const rect = pageFrameRef.current!.getBoundingClientRect();
    resizeHook.startResize(item.id, item, rect, e);
  };

  return (
    <React.Fragment key={item.id}>
      <div
        role="button"
        tabIndex={0}
        className={`preview-item ${isSelected ? 'selected' : ''}`}
        style={{
          left: `${item.x}px`,
          top: `${item.y}px`,
          width: `${w}px`,
          height: `${h}px`,
          transform: `rotate(${item.rotation}deg)`,
        }}
        onMouseDown={handleMouseDown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setSelectedId(item.id);
          }
        }}
      >
        <img src={item.src} alt={item.name} />
      </div>
      {isSelected && (
        <>
          <div
            role="button"
            tabIndex={0}
            aria-label="Rotacionar"
            className="rotation-handle"
            style={{ left: rotX, top: rotY }}
            onMouseDown={handleRotateStart}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleRotateStart(e as unknown as React.MouseEvent);
              }
            }}
          />
          <div
            role="button"
            tabIndex={0}
            aria-label="Redimensionar"
            className="resize-handle"
            style={{ left: resX, top: resY }}
            onMouseDown={handleResizeStart}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleResizeStart(e as unknown as React.MouseEvent);
              }
            }}
          />
        </>
      )}
    </React.Fragment>
  );
}
