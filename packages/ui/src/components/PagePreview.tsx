import { useEffect, useRef } from 'react';
import { useImpositionStore } from '../store';
import { PreviewItem } from './PreviewItem';
import { useDrag } from '../hooks/useDrag';
import { useRotate } from '../hooks/useRotate';
import { useResize } from '../hooks/useResize';
import { Gauge } from './Gauge';
import { ZoomHUD } from './ZoomHUD';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Grip } from 'lucide-react';
import { mmToPx } from '@imposition/core';

const GRID_STEP = mmToPx(10);

export function PagePreview() {
  const items = useImpositionStore((s) => s.items);
  const visibleItems = items.filter((item) => item.copies > 0);
  const interactiveGrid = useImpositionStore((s) => s.interactiveGrid);
  const setInteractiveGrid = useImpositionStore((s) => s.setInteractiveGrid);
  const canvasView = useImpositionStore((s) => s.canvasView);
  const setCanvasPan = useImpositionStore((s) => s.setCanvasPan);
  const pageWidthMm = useImpositionStore((s) => s.pageWidthMm);
  const pageHeightMm = useImpositionStore((s) => s.pageHeightMm);
  const pageFrameRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const fitted = useRef(false);
  const dragHook = useDrag();
  const rotateHook = useRotate();
  const resizeHook = useResize();

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button !== 1 && e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.page-frame') === null) return;
    e.preventDefault();
    panStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: canvasView.pan.x,
      panY: canvasView.pan.y,
    };
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (!panStart.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setCanvasPan({
      x: panStart.current.panX + dx,
      y: panStart.current.panY + dy,
    });
  };

  const handlePanEnd = () => {
    panStart.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const nextZoom = Math.max(0.25, Math.min(3, canvasView.zoom + delta));
      useImpositionStore.getState().setCanvasZoom(nextZoom);
      return;
    }
    setCanvasPan({
      x: canvasView.pan.x,
      y: canvasView.pan.y - e.deltaY,
    });
  };

  const { zoom, pan } = canvasView;

  const pageW = mmToPx(pageWidthMm);
  const pageH = mmToPx(pageHeightMm);

  useEffect(() => {
    if (fitted.current || !containerRef.current) return;
    fitted.current = true;
    const el = containerRef.current;
    const availableH = el.clientHeight - 48;
    const fitZoom = Math.min(1, (availableH - 40) / pageH);
    const rounded = Math.round(fitZoom * 100) / 100;
    useImpositionStore.getState().setFittedZoom(rounded);
    if (fitZoom < 1) {
      useImpositionStore.getState().setCanvasZoom(rounded);
    }
  }, [pageH]);

  const pageStyle: React.CSSProperties = {
    width: `${pageW}px`,
    height: `${pageH}px`,
    backgroundColor: '#ffffff',
    ...(interactiveGrid
      ? {
          backgroundImage:
            'linear-gradient(to right, rgba(156,163,175,0.25) 1px, transparent 1px),' +
            'linear-gradient(to bottom, rgba(156,163,175,0.25) 1px, transparent 1px)',
          backgroundSize: `${GRID_STEP}px ${GRID_STEP}px`,
        }
      : {}),
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card"
      onMouseDown={handlePanStart}
      onMouseMove={handlePanMove}
      onMouseUp={handlePanEnd}
      onMouseLeave={handlePanEnd}
      onWheel={handleWheel}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <Grip size={14} className="text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Canvas</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="grid-switch" checked={interactiveGrid} onCheckedChange={setInteractiveGrid} />
          <Label htmlFor="grid-switch" className="cursor-pointer text-xs text-muted-foreground">
            Grid
          </Label>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <div
          className="relative origin-center transition-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <div className="page-frame relative shadow-xl" ref={pageFrameRef} style={pageStyle}>
            {visibleItems.map((item) => (
              <PreviewItem
                key={item.id}
                item={item}
                pageFrameRef={pageFrameRef}
                dragHook={dragHook}
                rotateHook={rotateHook}
                resizeHook={resizeHook}
              />
            ))}

            {dragHook.guidelines.map((guide, index) =>
              guide.axis === 'x' ? (
                <div
                  key={`x-${index}`}
                  className="pointer-events-none absolute top-0 bottom-0 border-l border-dashed border-primary/70"
                  style={{ left: `${guide.x}px` }}
                />
              ) : (
                <div
                  key={`y-${index}`}
                  className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-primary/70"
                  style={{ top: `${guide.y}px` }}
                />
              ),
            )}
          </div>
        </div>

        <div className="absolute bottom-4 left-4">
          <ZoomHUD />
        </div>

        <div className="absolute bottom-4 right-4">
          <Gauge />
        </div>
      </div>
    </div>
  );
}
