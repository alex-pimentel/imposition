import { useMemo } from 'react';
import { Zap, Download, HelpCircle } from 'lucide-react';
import { useImpositionStore } from '../store';
import { UploadButton } from './UploadButton';
import { ItemCard } from './ItemCard';
import { StatsCard } from './StatsCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export function Sidebar() {
  const items = useImpositionStore((s) => s.items);
  const parentItems = useMemo(() => items.filter((item) => !item.parentId), [items]);
  const autoPlace = useImpositionStore((s) => s.autoPlace);
  const exportPdf = useImpositionStore((s) => s.exportPdf);
  const pageMarginMm = useImpositionStore((s) => s.pageMarginMm);
  const setPageMargin = useImpositionStore((s) => s.setPageMargin);

  return (
    <aside className="flex w-[360px] shrink-0 flex-col gap-4 border-r border-border bg-sidebar p-4 text-sidebar-foreground">
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/60">
          Imposição
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-sidebar-foreground">
          Montador A4
        </h1>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-sidebar-foreground/80">Importar imagens</p>
        <p className="text-[0.7rem] text-sidebar-foreground/50">PNG · JPG · WEBP</p>
      </div>

      <UploadButton />

      <div className="flex flex-col gap-2">
        <Button variant="secondary" onClick={autoPlace} className="w-full justify-start gap-2">
          <Zap size={16} />
          Posicionar automaticamente
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="page-margin" className="text-xs text-sidebar-foreground/80">
            Margem da página (mm)
          </Label>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle size={12} className="cursor-help text-sidebar-foreground/50" />
              </TooltipTrigger>
              <TooltipContent>
                Valor padrão aplicado a novos itens.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="page-margin"
          type="number"
          value={pageMarginMm}
          min={0}
          step={1}
          onChange={(e) => setPageMargin(Number(e.target.value || 0))}
        />
      </div>

      <Button
        onClick={exportPdf}
        className="w-full justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
      >
        <Download size={16} />
        Generate Optimized PDF
      </Button>

      <StatsCard />

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        <p className="text-xs font-medium text-sidebar-foreground/60">
          Assets ({parentItems.length})
        </p>
        <div className="flex flex-col gap-2 overflow-y-auto pr-1">
          {parentItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </aside>
  );
}
