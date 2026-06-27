import { useMemo } from 'react';
import { useImpositionStore, selectTotalCopies, selectUtilization } from '../store';

export function StatsCard() {
  const items = useImpositionStore((s) => s.items);
  const totalCopies = useImpositionStore(selectTotalCopies);
  const utilization = useImpositionStore(selectUtilization);
  const parentItems = useMemo(() => items.filter((item) => !item.parentId), [items]);

  return (
    <div className="stats-card">
      <span>
        {parentItems.length} imagens · {totalCopies} itens
      </span>
      <span>{utilization.toFixed(1)}% aproveitamento</span>
    </div>
  );
}
