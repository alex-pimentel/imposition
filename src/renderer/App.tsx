import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

type ImpositionItem = {
  id: string;
  name: string;
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  widthMm: number;
  heightMm: number;
  copies: number;
  x: number;
  y: number;
  rotation: number;
};

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const MM_TO_PX = 3.7795275591;
const PAGE_WIDTH_PX = PAGE_WIDTH_MM * MM_TO_PX;
const PAGE_HEIGHT_PX = PAGE_HEIGHT_MM * MM_TO_PX;
const DEFAULT_MARGIN_MM = 8;
const DEFAULT_GAP_MM = 4;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const mmToPx = (mm: number) => mm * MM_TO_PX;
const pxToMm = (px: number) => px / MM_TO_PX;

const makeId = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

const getDefaultSizeMm = (
  naturalWidth: number,
  naturalHeight: number,
): { widthMm: number; heightMm: number } => {
  const ratio = naturalWidth / naturalHeight;
  const base = 45;
  if (ratio >= 1) {
    return {
      widthMm: clamp(base * ratio, 25, 80),
      heightMm: clamp(base, 20, 80),
    };
  }
  return {
    widthMm: clamp(base, 20, 80),
    heightMm: clamp(base / ratio, 20, 80),
  };
};

const readImageData = (file: File) =>
  new Promise<{ src: string; naturalWidth: number; naturalHeight: number }>(
    (resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const { result } = reader;
        if (typeof result !== 'string') {
          reject(new Error('Erro ao ler imagem.'));
          return;
        }

        const image = new Image();
        image.onload = () => {
          resolve({
            src: result,
            naturalWidth: image.naturalWidth || image.width,
            naturalHeight: image.naturalHeight || image.height,
          });
        };
        image.onerror = () =>
          reject(new Error('Não foi possível abrir a imagem.'));
        image.src = result;
      };
      reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
      reader.readAsDataURL(file);
    },
  );

const isAcceptedImageFile = (file: File) =>
  /^image\/(png|jpe?g|webp)$/i.test(file.type) ||
  /\.(png|jpe?g|jpg|webp)$/i.test(file.name);

const calculateUtilization = (items: ImpositionItem[]) => {
  const totalArea = PAGE_WIDTH_PX * PAGE_HEIGHT_PX;
  const usedArea = items.reduce((total, item) => {
    const width = mmToPx(item.widthMm);
    const height = mmToPx(item.heightMm);
    return total + width * height * item.copies;
  }, 0);

  return clamp((usedArea / totalArea) * 100, 0, 100);
};

const placeItems = (
  sourceItems: ImpositionItem[],
  options: { randomize?: boolean } = {},
) => {
  const marginPx = mmToPx(DEFAULT_MARGIN_MM);
  const gapPx = mmToPx(DEFAULT_GAP_MM);
  const items = sourceItems.map((item) => ({ ...item }));

  let cursorX = marginPx;
  let cursorY = marginPx;
  let rowHeight = 0;

  const withRandom = options.randomize === true;

  items.forEach((item) => {
    const widthPx = mmToPx(item.widthMm);
    const heightPx = mmToPx(item.heightMm);

    const maxX = PAGE_WIDTH_PX - widthPx - marginPx;
    const maxY = PAGE_HEIGHT_PX - heightPx - marginPx;

    if (cursorX + widthPx > maxX) {
      cursorX = marginPx;
      cursorY += rowHeight + gapPx;
      rowHeight = 0;
    }

    if (cursorY + heightPx > maxY) {
      cursorY = marginPx;
      cursorX = marginPx;
      rowHeight = 0;
    }

    item.x = cursorX + (withRandom ? Math.random() * 8 : 0);
    item.y = cursorY + (withRandom ? Math.random() * 8 : 0);

    cursorX += widthPx + gapPx;
    rowHeight = Math.max(rowHeight, heightPx);
  });

  return items;
};

export default function App() {
  const [items, setItems] = useState<ImpositionItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [autoRandomize, setAutoRandomize] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (items.length > 0 && !selectedId) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId],
  );

  const utilization = useMemo(() => calculateUtilization(items), [items]);

  const addImages = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files).filter(isAcceptedImageFile);
    if (fileArray.length === 0) return;

    const loaded = await Promise.all(
      fileArray.map(async (file) => {
        const data = await readImageData(file);
        const defaults = getDefaultSizeMm(
          data.naturalWidth,
          data.naturalHeight,
        );

        return {
          id: makeId(),
          name: file.name,
          src: data.src,
          naturalWidth: data.naturalWidth,
          naturalHeight: data.naturalHeight,
          widthMm: defaults.widthMm,
          heightMm: defaults.heightMm,
          copies: 1,
          x: 0,
          y: 0,
          rotation: 0,
        } satisfies ImpositionItem;
      }),
    );

    setItems((current) => [...current, ...loaded]);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.types?.includes('Files')) {
      event.dataTransfer.dropEffect = 'copy';
      setIsDragging(true);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.types?.includes('Files')) {
      event.dataTransfer.dropEffect = 'copy';
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setIsDragging(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    await addImages(event.dataTransfer.files);
  };

  const updateItem = (id: string, updates: Partial<ImpositionItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const duplicateItem = (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;

    setItems((current) => [
      ...current,
      {
        ...target,
        id: makeId(),
        name: `${target.name} (cópia)`,
        x: target.x + 8,
        y: target.y + 8,
      },
    ]);
  };

  const autoPlace = () => {
    setItems((current) => placeItems(current, { randomize: autoRandomize }));
  };

  const resetLayout = () => {
    setItems((current) =>
      current.map((item) => ({
        ...item,
        x: 0,
        y: 0,
      })),
    );
  };

  const exportPdf = async () => {
    if (items.length === 0) return;

    try {
      const { jsPDF: JsPDF } = await import('jspdf');
      const pdf = new JsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      items.forEach((item, index) => {
        const widthMm = mmToPx(item.widthMm) / MM_TO_PX;
        const heightMm = mmToPx(item.heightMm) / MM_TO_PX;
        const xMm = pxToMm(item.x);
        const yMm = pxToMm(item.y);

        if (index > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          item.src,
          item.src.startsWith('data:image/png') ? 'PNG' : 'JPEG',
          xMm,
          yMm,
          widthMm,
          heightMm,
        );
      });

      pdf.save('imposicao.pdf');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Falha ao exportar PDF', error);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Imposição</p>
          <h1>Montador A4</h1>
        </div>

        <div className="sidebar-panel">
          <span className="sidebar-panel__label">Importar</span>
          <span className="sidebar-panel__meta">PNG · JPG · WEBP</span>
        </div>

        <label
          htmlFor="image-import"
          className={isDragging ? 'upload-button dragging' : 'upload-button'}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <span className="upload-text">
            {isDragging
              ? 'Solte as imagens aqui'
              : 'Arraste imagens aqui ou clique para importar'}
          </span>
          <input
            id="image-import"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            multiple
            onChange={(event) => addImages(event.target.files)}
          />
        </label>

        <div className="actions-row">
          <button type="button" onClick={autoPlace}>
            Posicionar automaticamente
          </button>
          <button
            type="button"
            onClick={() => setAutoRandomize((value) => !value)}
            className={autoRandomize ? 'toggle active' : 'toggle'}
          >
            {autoRandomize ? 'Aleatoriedade ativada' : 'Ativar aleatoriedade'}
          </button>
        </div>

        <button type="button" onClick={exportPdf} className="export-button">
          Exportar PDF
        </button>

        <div className="stats-card">
          <span>{items.length} itens</span>
          <span>{utilization.toFixed(1)}% aproveitamento</span>
        </div>

        <div className="items-list">
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              className={
                selectedItem?.id === item.id
                  ? 'item-card selected'
                  : 'item-card'
              }
              onClick={() => setSelectedId(item.id)}
            >
              <img src={item.src} alt={item.name} />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="workspace">
        <div className="toolbar">
          <div>
            <strong>{selectedItem?.name || 'Nenhum item selecionado'}</strong>
          </div>
          {selectedItem && (
            <div className="toolbar-controls">
              <label htmlFor="width-mm">
                Largura (mm)
                <input
                  id="width-mm"
                  type="number"
                  value={selectedItem.widthMm}
                  min={5}
                  step={1}
                  onChange={(event) =>
                    updateItem(selectedItem.id, {
                      widthMm: Number(event.target.value || 0),
                    })
                  }
                />
              </label>
              <label htmlFor="height-mm">
                Altura (mm)
                <input
                  id="height-mm"
                  type="number"
                  value={selectedItem.heightMm}
                  min={5}
                  step={1}
                  onChange={(event) =>
                    updateItem(selectedItem.id, {
                      heightMm: Number(event.target.value || 0),
                    })
                  }
                />
              </label>
              <label htmlFor="copies-count">
                Cópias
                <input
                  id="copies-count"
                  type="number"
                  value={selectedItem.copies}
                  min={1}
                  step={1}
                  onChange={(event) =>
                    updateItem(selectedItem.id, {
                      copies: Math.max(1, Number(event.target.value || 1)),
                    })
                  }
                />
              </label>
              <label htmlFor="x-mm">
                X (mm)
                <input
                  id="x-mm"
                  type="number"
                  value={Math.round(pxToMm(selectedItem.x) * 10) / 10}
                  step={0.1}
                  onChange={(event) =>
                    updateItem(selectedItem.id, {
                      x: mmToPx(Number(event.target.value || 0)),
                    })
                  }
                />
              </label>
              <label htmlFor="y-mm">
                Y (mm)
                <input
                  id="y-mm"
                  type="number"
                  value={Math.round(pxToMm(selectedItem.y) * 10) / 10}
                  step={0.1}
                  onChange={(event) =>
                    updateItem(selectedItem.id, {
                      y: mmToPx(Number(event.target.value || 0)),
                    })
                  }
                />
              </label>
              <button
                type="button"
                onClick={() => duplicateItem(selectedItem.id)}
              >
                Duplicar
              </button>
              <button type="button" onClick={resetLayout}>
                Resetar posições
              </button>
            </div>
          )}
        </div>

        <div className="page-preview">
          <div className="page-frame">
            {items.map((item) => (
              <button
                type="button"
                key={item.id}
                className={
                  selectedItem?.id === item.id
                    ? 'preview-item selected'
                    : 'preview-item'
                }
                style={{
                  left: `${item.x}px`,
                  top: `${item.y}px`,
                  width: `${mmToPx(item.widthMm)}px`,
                  height: `${mmToPx(item.heightMm)}px`,
                  transform: `rotate(${item.rotation}deg)`,
                }}
                onClick={() => setSelectedId(item.id)}
              >
                <img src={item.src} alt={item.name} />
                <span>{item.copies > 1 ? `${item.copies}×` : ''}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
