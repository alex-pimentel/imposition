import { FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { pxToMm, mmToPx, visualBBox, clamp, PAGE_WIDTH_PX, PAGE_HEIGHT_PX } from '@imposition/core';
import {
  useImpositionStore,
  selectSelectedItem,
  selectDisplayCopies,
} from '../store';

export function Toolbar() {
  const selectedItem = useImpositionStore(selectSelectedItem);
  const displayCopies = useImpositionStore(selectDisplayCopies);
  const updateItem = useImpositionStore((s) => s.updateItem);
  const removeItem = useImpositionStore((s) => s.removeItem);
  const resetLayout = useImpositionStore((s) => s.resetLayout);
  const updateCopies = useImpositionStore((s) => s.updateCopies);

  if (!selectedItem) {
    return (
      <section className="toolbar">
        <div className="toolbar-header">
          <div>
            <p className="toolbar-label">Selecionado</p>
            <h2>Nenhum item selecionado</h2>
          </div>
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
    updateItem(selectedItem.id, {
      x: clamp(mmToPx(value), vb.w / 2 - w / 2, PAGE_WIDTH_PX - w / 2 - vb.w / 2),
    });
  };

  const handleYChange = (value: number) => {
    const w = mmToPx(selectedItem.widthMm);
    const h = mmToPx(selectedItem.heightMm);
    const vb = visualBBox(w, h, selectedItem.rotation);
    updateItem(selectedItem.id, {
      y: clamp(mmToPx(value), vb.h / 2 - h / 2, PAGE_HEIGHT_PX - h / 2 - vb.h / 2),
    });
  };

  return (
    <section className="toolbar">
      <div className="toolbar-header">
        <div>
          <p className="toolbar-label">Selecionado</p>
          <h2>{selectedItem.name}</h2>
        </div>
        <div className="toolbar-actions">
          <button
            type="button"
            className="ui-button"
            onClick={() => removeItem(selectedItem.parentId || selectedItem.id)}
          >
            <FiTrash2 size={16} />
            Remover
          </button>
          <button
            type="button"
            className="ui-button"
            onClick={resetLayout}
          >
            <FiRefreshCw size={16} />
            Resetar posições
          </button>
        </div>
      </div>
      <div className="toolbar-controls">
        <label htmlFor="width-mm" className="ui-field">
          <span>Largura (mm)</span>
          <input
            id="width-mm"
            type="number"
            className="ui-input"
            value={selectedItem.widthMm}
            min={5}
            step={1}
            onChange={(e) => updateItem(selectedItem.id, { widthMm: Number(e.target.value || 0) })}
          />
        </label>
        <label htmlFor="height-mm" className="ui-field">
          <span>Altura (mm)</span>
          <input
            id="height-mm"
            type="number"
            className="ui-input"
            value={selectedItem.heightMm}
            min={5}
            step={1}
            onChange={(e) => updateItem(selectedItem.id, { heightMm: Number(e.target.value || 0) })}
          />
        </label>
        <label htmlFor="copies-count" className="ui-field">
          <span>Cópias</span>
          <input
            id="copies-count"
            type="number"
            className="ui-input"
            value={displayCopies}
            min={1}
            step={1}
            onChange={(e) =>
              updateCopies(
                selectedItem.parentId || selectedItem.id,
                Math.max(1, Number(e.target.value || 1)),
              )
            }
          />
        </label>
        <label htmlFor="rotation-deg" className="ui-field">
          <span>Rotação (°)</span>
          <input
            id="rotation-deg"
            type="number"
            className="ui-input"
            value={selectedItem.rotation}
            min={0}
            max={360}
            step={1}
            onChange={(e) => handleRotationChange(Number(e.target.value || 0))}
          />
        </label>
        <label htmlFor="margin-mm" className="ui-field">
          <span>Margem (mm)</span>
          <input
            id="margin-mm"
            type="number"
            className="ui-input"
            value={selectedItem.marginMm}
            min={0}
            step={1}
            onChange={(e) =>
              updateItem(selectedItem.id, { marginMm: Math.max(0, Number(e.target.value || 0)) })
            }
          />
        </label>
        <label htmlFor="x-mm" className="ui-field">
          <span>X (mm)</span>
          <input
            id="x-mm"
            type="number"
            className="ui-input"
            value={Math.round(pxToMm(selectedItem.x))}
            step={1}
            onChange={(e) => handleXChange(Number(e.target.value || 0))}
          />
        </label>
        <label htmlFor="y-mm" className="ui-field">
          <span>Y (mm)</span>
          <input
            id="y-mm"
            type="number"
            className="ui-input"
            value={Math.round(pxToMm(selectedItem.y))}
            step={1}
            onChange={(e) => handleYChange(Number(e.target.value || 0))}
          />
        </label>
      </div>
    </section>
  );
}
