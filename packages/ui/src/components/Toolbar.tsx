import { Trash2, RefreshCw, HelpCircle } from 'lucide-react';
import {
  pxToMm,
  mmToPx,
  visualBBox,
  clamp,
  PAGE_WIDTH_PX,
  PAGE_HEIGHT_PX,
} from '@imposition/core';
import {
  useImpositionStore,
  selectSelectedItem,
  selectDisplayCopies,
} from '../store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

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

  if (!selectedItem) {
    return (
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Selecionado
          </p>
          <h2 className="text-sm font-semibold text-card-foreground">
            Nenhum item selecionado
          </h2>
        </div>
      </section>
    );
  }

  const handleRotationChange = (value: number) => {
    const newRotation = ((value % 360) + 360) % 360;
    const oldRotation = ((selectedItem.rotation % 360) + 360) % 360;
    const oldHorizontal = oldRotation % 180 < 1;
    const newHorizontal = newRotation % 180 < 1;

    if (
      oldHorizontal !== newHorizontal &&
      oldRotation % 90 < 1 &&
      newRotation % 90 < 1
    ) {
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
    updateItem(selectedItem.id, {
      x: clamp(
        mmToPx(value),
        vb.w / 2 - w / 2,
        PAGE_WIDTH_PX - w / 2 - vb.w / 2,
      ),
    });
  };

  const handleYChange = (value: number) => {
    const w = mmToPx(selectedItem.widthMm);
    const h = mmToPx(selectedItem.heightMm);
    const vb = visualBBox(w, h, selectedItem.rotation);
    updateItem(selectedItem.id, {
      y: clamp(
        mmToPx(value),
        vb.h / 2 - h / 2,
        PAGE_HEIGHT_PX - h / 2 - vb.h / 2,
      ),
    });
  };

  const targetId = selectedItem.parentId || selectedItem.id;

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Editor de item
          </p>
          <h2 className="max-w-md truncate text-sm font-semibold text-card-foreground">
            {selectedItem.name}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeFromList(targetId)}
          >
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
            Largura (mm)
          </Label>
          <Input
            id="width-mm"
            type="number"
            value={selectedItem.widthMm}
            min={5}
            step={1}
            onChange={(e) =>
              updateItem(selectedItem.id, {
                widthMm: Math.max(5, Number(e.target.value || 0)),
              })
            }
          />
        </div>

        <div className="flex w-24 flex-col gap-1.5">
          <Label htmlFor="height-mm" className="text-xs text-muted-foreground">
            Altura (mm)
          </Label>
          <Input
            id="height-mm"
            type="number"
            value={selectedItem.heightMm}
            min={5}
            step={1}
            onChange={(e) =>
              updateItem(selectedItem.id, {
                heightMm: Math.max(5, Number(e.target.value || 0)),
              })
            }
          />
        </div>

        <div className="flex w-20 flex-col gap-1.5">
          <Label htmlFor="copies-count" className="text-xs text-muted-foreground">
            Cópias
          </Label>
          <Input
            id="copies-count"
            type="number"
            value={displayCopies}
            min={1}
            step={1}
            onChange={(e) =>
              updateCopies(targetId, Math.max(1, Number(e.target.value || 1)))
            }
          />
        </div>

        <div className="flex w-40 flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="rotation-deg" className="text-xs text-muted-foreground">
              Rotação (°)
            </Label>
            <FieldTip>
              Rotação em graus. Valores entre 0° e 360°.
            </FieldTip>
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
          <div className="flex items-center gap-1.5">
            <Label htmlFor="margin-mm" className="text-xs text-muted-foreground">
              Margem (mm)
            </Label>
            <FieldTip>
              Espaço mínimo ao redor do item ao posicionar automaticamente.
            </FieldTip>
          </div>
          <Input
            id="margin-mm"
            type="number"
            value={selectedItem.marginMm}
            min={0}
            step={1}
            onChange={(e) =>
              updateItem(selectedItem.id, {
                marginMm: Math.max(0, Number(e.target.value || 0)),
              })
            }
          />
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
