import { useImpositionStore, selectTotalCopies, selectUtilization } from '../store';

export function StatsCard() {
  const totalCopies = useImpositionStore(selectTotalCopies);
  const utilization = useImpositionStore(selectUtilization);

  return (
    <div className="flex items-center justify-between rounded-xl border border-sidebar-border bg-sidebar-accent/50 px-4 py-3 text-sm">
      <span className="text-sidebar-foreground/80">{totalCopies} items</span>
      <span className="font-medium text-sidebar-foreground">
        {utilization.toFixed(1)}% utilization
      </span>
    </div>
  );
}
