import { useMemo } from 'react';
import { FiZap, FiDownload } from 'react-icons/fi';
import { useImpositionStore } from '../store';
import { UploadButton } from './UploadButton';
import { ItemCard } from './ItemCard';
import { StatsCard } from './StatsCard';

export function Sidebar() {
  const items = useImpositionStore((s) => s.items);
  const parentItems = useMemo(() => items.filter((item) => !item.parentId), [items]);
  const autoRandomize = useImpositionStore((s) => s.autoRandomize);
  const setAutoRandomize = useImpositionStore((s) => s.setAutoRandomize);
  const autoPlace = useImpositionStore((s) => s.autoPlace);
  const exportPdf = useImpositionStore((s) => s.exportPdf);

  return (
    <aside className="sidebar">
      <div>
        <p className="eyebrow">Imposição</p>
        <h1>Montador A4</h1>
      </div>

      <div className="sidebar-panel">
        <span className="sidebar-panel__label">Importar</span>
        <span className="sidebar-panel__meta">PNG · JPG · WEBP</span>
      </div>

      <UploadButton />

      <div className="actions-row">
        <button type="button" onClick={autoPlace} className="ui-button">
          <FiZap size={16} />
          Posicionar automaticamente
        </button>
        <button
          type="button"
          onClick={() => setAutoRandomize(!autoRandomize)}
          className={
            autoRandomize ? 'ui-button ui-button--success' : 'ui-button'
          }
        >
          {autoRandomize ? 'Aleatoriedade ativada' : 'Ativar aleatoriedade'}
        </button>
      </div>

      <button
        type="button"
        onClick={exportPdf}
        className="ui-button ui-button--primary"
      >
        <FiDownload size={16} />
        Exportar PDF
      </button>

      <StatsCard />

      <div className="items-list">
        {parentItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </aside>
  );
}
