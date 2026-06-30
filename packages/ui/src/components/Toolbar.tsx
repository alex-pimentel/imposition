import { Trash2, RefreshCw, HelpCircle } from 'lucide-react';
import { pxToMm, mmToPx, visualBBox, clamp } from '@imposition/core';
import { useImpositionStore, selectSelectedItem, selectDisplayCopies } from '../store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

function FieldTip({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle size={12} className="cursor-help text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Toolbar() {
  const selectedItem = useImpositionStore(selectSelectedItem);
  const displayCopies = useImpositionStore(selectDisplayCopies);
  const updateItem = useImpositionStore((s) => s.updateItem);
  const removeFromList = useImpositionStore((s) => s.removeFromList);
  const resetLayout = useImpositionStore((s) => s.resetLayout);
  const updateCopies = useImpositionStore((s) => s.updateCopies);
  const pageWidthMm = useImpositionStore((s) => s.pageWidthMm);
  const pageHeightMm = useImpositionStore((s) => s.pageHeightMm);

  if (!selectedItem) {
    return (
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Selected
          </p>
          <h2 className="text-sm font-semibold text-card-foreground">No item selected</h2>
        </div>
      </section>
    );
  }

  const handleRotationChange = (value: number) => {
    const newRotation = ((value % 360) + 360) % 360;
    const oldRotation = ((selectedItem.rotation % 360) + 360) % 360;
    const oldHorizontal = oldRotation % 180 < 1;
    const newHorizontal = newRotation % 180 < 1;

    if (oldHorizontal !== newHorizontal && oldRotation % 90 < 1 && newRotation % 90 < 1) {
      updateItem(selectedItem.id, {
        rotation: newRotation,
        widthMm: selectedItem.heightMm,
        heightMm: selectedItem.widthMm,
      });
    } else {
      updateItem(selectedItem.id, { rotation: newRotation });
    }
  };

  const handleXChange = (value: number) => {
    const w = mmToPx(selectedItem.widthMm);
    const h = mmToPx(selectedItem.heightMm);
    const vb = visualBBox(w, h, selectedItem.rotation);
    const pageWPx = mmToPx(pageWidthMm);
    updateItem(selectedItem.id, {
      x: clamp(mmToPx(value), vb.w / 2 - w / 2, pageWPx - w / 2 - vb.w / 2),
    });
  };

  const handleYChange = (value: number) => {
    const w = mmToPx(selectedItem.widthMm);
    const h = mmToPx(selectedItem.heightMm);
    const vb = visualBBox(w, h, selectedItem.rotation);
    const pageHPx = mmToPx(pageHeightMm);
    updateItem(selectedItem.id, {
      y: clamp(mmToPx(value), vb.h / 2 - h / 2, pageHPx - h / 2 - vb.h / 2),
    });
  };

  const targetId = selectedItem.parentId || selectedItem.id;

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Item editor
          </p>
          <h2 className="max-w-md truncate text-sm font-semibold text-card-foreground">
            {selectedItem.name}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => removeFromList(targetId)}>
            <Trash2 size={14} className="mr-1.5" />
            Remove
          </Button>
          <Button variant="outline" size="sm" onClick={resetLayout}>
            <RefreshCw size={14} className="mr-1.5" />
            Reset Position
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div className="flex w-24 flex-col gap-1.5">
          <Label htmlFor="width-mm" className="text-xs text-muted-foreground">
            Width (mm)
          </Label>
          <Input
            id="width-mm"
            type="number"
            value={selectedItem.widthMm}
            step={1}
            onChange={(e) =>
              updateItem(selectedItem.id, {
                widthMm: Number(e.target.value || 0),
              })
            }
            onBlur={() =>
              updateItem(selectedItem.id, {
                widthMm: Math.max(5, selectedItem.widthMm),
              })
            }
          />
        </div>

        <div className="flex w-24 flex-col gap-1.5">
          <Label htmlFor="height-mm" className="text-xs text-muted-foreground">
            Height (mm)
          </Label>
          <Input
            id="height-mm"
            type="number"
            value={selectedItem.heightMm}
            step={1}
            onChange={(e) =>
              updateItem(selectedItem.id, {
                heightMm: Number(e.target.value || 0),
              })
            }
            onBlur={() =>
              updateItem(selectedItem.id, {
                heightMm: Math.max(5, selectedItem.heightMm),
              })
            }
          />
        </div>

        <div className="flex w-20 flex-col gap-1.5">
          <Label htmlFor="copies-count" className="text-xs text-muted-foreground">
            Copies
          </Label>
          <Input
            id="copies-count"
            type="number"
            value={displayCopies}
            min={1}
            step={1}
            onChange={(e) => updateCopies(targetId, Math.max(1, Number(e.target.value || 1)))}
          />
        </div>

        <div className="flex w-40 flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="rotation-deg" className="text-xs text-muted-foreground">
              Rotation (°)
            </Label>
            <FieldTip>Rotation in degrees. Values between 0° and 360°.</FieldTip>
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="rotation-deg"
              type="number"
              value={selectedItem.rotation}
              min={0}
              max={360}
              step={1}
              className="w-16"
              onChange={(e) => handleRotationChange(Number(e.target.value || 0))}
            />
            <Slider
              value={[selectedItem.rotation]}
              min={0}
              max={360}
              step={1}
              onValueChange={([v]) => handleRotationChange(v)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="flex w-24 flex-col gap-1.5">
          <Label htmlFor="x-mm" className="text-xs text-muted-foreground">
            X (mm)
          </Label>
          <Input
            id="x-mm"
            type="number"
            value={Math.round(pxToMm(selectedItem.x))}
            step={1}
            onChange={(e) => handleXChange(Number(e.target.value || 0))}
          />
        </div>

        <div className="flex w-24 flex-col gap-1.5">
          <Label htmlFor="y-mm" className="text-xs text-muted-foreground">
            Y (mm)
          </Label>
          <Input
            id="y-mm"
            type="number"
            value={Math.round(pxToMm(selectedItem.y))}
            step={1}
            onChange={(e) => handleYChange(Number(e.target.value || 0))}
          />
        </div>
      </div>
    </section>
  );
}
