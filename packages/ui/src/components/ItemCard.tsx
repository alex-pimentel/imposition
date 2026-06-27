import type { ImpositionItem } from '@imposition/core';
import { useImpositionStore, selectSelectedItem } from '../store';

type ItemCardProps = {
  item: ImpositionItem;
};

export function ItemCard({ item }: ItemCardProps) {
  const selectedItem = useImpositionStore(selectSelectedItem);
  const setSelectedId = useImpositionStore((s) => s.setSelectedId);

  const isSelected =
    selectedItem?.id === item.id || selectedItem?.parentId === item.id;

  return (
    <button
      type="button"
      className={isSelected ? 'item-card selected' : 'item-card'}
      onClick={() => setSelectedId(item.id)}
    >
      <img src={item.src} alt={item.name} />
      <span>
        {item.name}
        {item.copies > 1 && (
          <span className="item-card__copies"> ({item.copies}×)</span>
        )}
      </span>
    </button>
  );
}
