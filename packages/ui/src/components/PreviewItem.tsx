import type { ImpositionItem } from '@imposition/core';
import { mmToPx } from '@imposition/core';
import { Copy, RotateCw, Layers, AlignCenterHorizontal, AlignCenterVertical, Trash2 } from 'lucide-react';
import { useImpositionStore, selectSelectedItem } from '../store';
import { useDrag } from '../hooks/useDrag';
import { useRotate } from '../hooks/useRotate';
import { useResize } from '../hooks/useResize';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './ui/context-menu';
import { cn } from '../lib/utils';

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
  const duplicateItem = useImpositionStore((s) => s.duplicateItem);
  const updateItem = useImpositionStore((s) => s.updateItem);
  const sendToBack = useImpositionStore((s) => s.sendToBack);
  const bringToFront = useImpositionStore((s) => s.bringToFront);
  const alignCenter = useImpositionStore((s) => s.alignCenter);
  const removeFromList = useImpositionStore((s) => s.removeFromList);

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
    e.stopPropagation();
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

  const handleRotate90 = () => {
    const newRotation = ((item.rotation + 90) % 360 + 360) % 360;
    updateItem(item.id, {
      rotation: newRotation,
      widthMm: item.heightMm,
      heightMm: item.widthMm,
    });
  };

  if (item.copies === 0) return null;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className={cn(
            'absolute cursor-grab overflow-visible border border-dashed border-transparent bg-transparent p-0 outline-none active:cursor-grabbing',
            isSelected && 'border-primary/70 shadow-sm',
          )}
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
          <img
            src={item.src}
            alt={item.name}
            className="pointer-events-none h-full w-full object-contain"
            draggable={false}
          />
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={() => duplicateItem(item.id)}>
          <Copy size={14} className="mr-2" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem onClick={handleRotate90}>
          <RotateCw size={14} className="mr-2" />
          Rotate 90°
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => sendToBack(item.id)}>
          <Layers size={14} className="mr-2" />
          Send to Back
        </ContextMenuItem>
        <ContextMenuItem onClick={() => bringToFront(item.id)}>
          <Layers size={14} className="mr-2" />
          Bring to Front
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => alignCenter(item.id, 'x')}>
          <AlignCenterHorizontal size={14} className="mr-2" />
          Align Center Horizontal
        </ContextMenuItem>
        <ContextMenuItem onClick={() => alignCenter(item.id, 'y')}>
          <AlignCenterVertical size={14} className="mr-2" />
          Align Center Vertical
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => removeFromList(item.id)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 size={14} className="mr-2" />
          Remove from list
        </ContextMenuItem>
      </ContextMenuContent>

      {isSelected && (
        <>
          <div
            role="button"
            tabIndex={0}
            aria-label="Rotate"
            className="absolute z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-crosshair rounded-full border-2 border-background bg-primary shadow transition-transform hover:scale-125"
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
            aria-label="Resize"
            className="absolute z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize rounded-sm border-2 border-background bg-primary shadow transition-transform hover:scale-125"
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
    </ContextMenu>
  );
}
