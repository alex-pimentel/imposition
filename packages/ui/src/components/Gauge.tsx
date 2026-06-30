import { useImpositionStore, selectTotalCopies, selectUtilization } from '../store';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { HelpCircle } from 'lucide-react';

export function Gauge() {
  const items = useImpositionStore((s) => s.items);
  const totalCopies = useImpositionStore(selectTotalCopies);
  const utilization = useImpositionStore(selectUtilization);
  const parentCount = items.filter((item) => !item.parentId).length;

  const radius = 36;
  const stroke = 8;
  const normalized = Math.min(100, Math.max(0, utilization)) / 100;
  const circumference = Math.PI * radius;
  const dashoffset = circumference * (1 - normalized);

  return (
    <div className="w-56 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-card-foreground">
          Resumo da Folha
        </span>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle size={14} className="cursor-help text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              Indica o aproveitamento da área útil da página A4.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex h-24 w-24 items-end justify-center">
          <svg
            viewBox="0 0 100 60"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={stroke}
              strokeLinecap="round"
            />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              className="transition-all duration-500"
            />
          </svg>
          <span className="mb-2 text-2xl font-bold text-card-foreground">
            {parentCount}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          <span className="font-medium text-card-foreground">
            {parentCount} imagens · {totalCopies} itens
          </span>
          <span>{utilization.toFixed(1)}% aproveitamento</span>
        </div>
      </div>
    </div>
  );
}
