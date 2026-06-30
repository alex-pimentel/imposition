import { Minus, Plus, X } from 'lucide-react';
import { useImpositionStore } from '../store';
import { Button } from './ui/button';

export function ZoomHUD() {
  const { zoom } = useImpositionStore((s) => s.canvasView);
  const setCanvasZoom = useImpositionStore((s) => s.setCanvasZoom);
  const resetCanvasView = useImpositionStore((s) => s.resetCanvasView);

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-card/95 p-1 shadow-lg backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setCanvasZoom(zoom - 0.1)}
      >
        <Minus size={16} />
      </Button>
      <span className="min-w-[3rem] text-center text-xs font-medium text-card-foreground">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setCanvasZoom(zoom + 0.1)}
      >
        <Plus size={16} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={resetCanvasView}
        title="Resetar visualização"
      >
        <X size={16} />
      </Button>
    </div>
  );
}
