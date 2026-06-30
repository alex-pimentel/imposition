import type { ImpositionItem } from '@imposition/core';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useImpositionStore, selectSelectedItem } from '../store';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

type ItemCardProps = {
  item: ImpositionItem;
};

export function ItemCard({ item }: ItemCardProps) {
  const selectedItem = useImpositionStore(selectSelectedItem);
  const setSelectedId = useImpositionStore((s) => s.setSelectedId);
  const updateCopies = useImpositionStore((s) => s.updateCopies);
  const removeFromList = useImpositionStore((s) => s.removeFromList);

  const isSelected =
    selectedItem?.id === item.id || selectedItem?.parentId === item.id;

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-border bg-card p-2 transition-colors',
        isSelected && 'border-primary/50 bg-primary/10',
        item.copies === 0 && 'opacity-60',
      )}
    >
      <button
        type="button"
        className="flex flex-1 items-center gap-3 overflow-hidden text-left"
        onClick={() => setSelectedId(item.id)}
      >
        <img
          src={item.src}
          alt={item.name}
          className="h-12 w-12 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-card-foreground">
            {item.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.copies} {item.copies === 1 ? 'cópia' : 'cópias'}
          </p>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => updateCopies(item.id, item.copies - 1)}
          disabled={item.copies <= 0}
        >
          <Minus size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => updateCopies(item.id, item.copies + 1)}
        >
          <Plus size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive/90"
          onClick={() => removeFromList(item.id)}
          title="Remover da listagem"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}
