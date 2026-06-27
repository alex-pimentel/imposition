import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiDownload,
  FiRefreshCw,
  FiTrash2,
  FiZap,
  FiUploadCloud,
} from 'react-icons/fi';
import './App.css';

type ImpositionItem = {
  id: string;
  parentId?: string;
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
  marginMm: number;
};

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const MM_TO_PX = 3.7795275591;
const PAGE_WIDTH_PX = PAGE_WIDTH_MM * MM_TO_PX;
const PAGE_HEIGHT_PX = PAGE_HEIGHT_MM * MM_TO_PX;
const DEFAULT_GAP_MM = 4;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const mmToPx = (mm: number) => mm * MM_TO_PX;
const pxToMm = (px: number) => px / MM_TO_PX;
const roundPxToMm = (px: number) => Math.round(pxToMm(px)) * MM_TO_PX;

const visualBBox = (wPx: number, hPx: number, rotation: number) => {
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return { w: wPx * cos + hPx * sin, h: wPx * sin + hPx * cos };
};

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
    return total + width * height;
  }, 0);

  return clamp((usedArea / totalArea) * 100, 0, 100);
};

const rectsOverlap = (
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const findFreeSpot = (
  items: ImpositionItem[],
  widthMm: number,
  heightMm: number,
) => {
  const marginPx = mmToPx(8);
  const gapPx = mmToPx(4);
  const stepPx = 8;
  const wPx = mmToPx(widthMm);
  const hPx = mmToPx(heightMm);

  const occupied = items.map((item) => ({
    left: item.x - gapPx,
    top: item.y - gapPx,
    right: item.x + mmToPx(item.widthMm) + gapPx,
    bottom: item.y + mmToPx(item.heightMm) + gapPx,
  }));

  for (let y = marginPx; y + hPx <= PAGE_HEIGHT_PX - marginPx; y += stepPx) {
    for (let x = marginPx; x + wPx <= PAGE_WIDTH_PX - marginPx; x += stepPx) {
      const candidate = { left: x, top: y, right: x + wPx, bottom: y + hPx };
      if (!occupied.some((r) => rectsOverlap(candidate, r))) {
        return { x: roundPxToMm(x), y: roundPxToMm(y) };
      }
    }
  }

  return { x: roundPxToMm(marginPx), y: roundPxToMm(marginPx) };
};

const placeItems = (
  sourceItems: ImpositionItem[],
  options: { randomize?: boolean } = {},
) => {
  const gapPx = mmToPx(DEFAULT_GAP_MM);
  const items = sourceItems.map((item) => ({ ...item }));

  let cursorX = 0;
  let cursorY = 0;
  let rowHeight = 0;

  const withRandom = options.randomize === true;

  items.forEach((item) => {
    const marginPx = mmToPx(item.marginMm);
    const widthPx = mmToPx(item.widthMm);
    const heightPx = mmToPx(item.heightMm);

    const rightBoundary = PAGE_WIDTH_PX - marginPx;
    const bottomBoundary = PAGE_HEIGHT_PX - marginPx;

    if (cursorX === 0 && cursorY === 0) {
      cursorX = marginPx;
      cursorY = marginPx;
    }

    if (cursorX + widthPx > rightBoundary) {
      cursorX = marginPx;
      cursorY += rowHeight + gapPx;
      rowHeight = 0;
    }

    if (cursorY + heightPx > bottomBoundary) {
      cursorX = marginPx;
      cursorY += gapPx;
    }

    item.x = roundPxToMm(cursorX + (withRandom ? Math.random() * 8 : 0));
    item.y = roundPxToMm(cursorY + (withRandom ? Math.random() * 8 : 0));

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
  const pageFrameRef = useRef<HTMLDivElement>(null);

  const [dragId, setDragId] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, origX: 0, origY: 0 });

  const [rotateId, setRotateId] = useState<string | null>(null);
  const rotateStart = useRef({
    x: 0,
    y: 0,
    origRotation: 0,
    cx: 0,
    cy: 0,
  });

  const [resizeId, setResizeId] = useState<string | null>(null);
  const resizeStart = useRef({
    x: 0,
    y: 0,
    origW: 0,
    origH: 0,
    vpOffsetX: 0,
    vpOffsetY: 0,
    pfCx: 0,
    pfCy: 0,
    pfLeft: 0,
    pfTop: 0,
  });

  useEffect(() => {
    if (items.length > 0 && !selectedId) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  const parentItems = useMemo(
    () => items.filter((item) => !item.parentId),
    [items],
  );

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedId) || null,
    [items, selectedId],
  );

  const displayCopies = useMemo(() => {
    if (!selectedItem) return 1;
    if (selectedItem.parentId) {
      const parent = items.find((p) => p.id === selectedItem.parentId);
      return parent?.copies ?? 1;
    }
    return selectedItem.copies;
  }, [items, selectedItem]);

  const totalCopies = useMemo(
    () => parentItems.reduce((sum, p) => sum + p.copies, 0),
    [parentItems],
  );

  const utilization = useMemo(() => calculateUtilization(items), [items]);

  const addImages = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files).filter(isAcceptedImageFile);
    if (fileArray.length === 0) return;

    const loaded = await Promise.all(
      fileArray.map(async (file) => {
        try {
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
            marginMm: 8,
          } satisfies ImpositionItem;
        } catch (err) {
          console.error('Falha ao processar imagem', file.name, err);
          return null;
        }
      }),
    );

    const validItems = loaded.filter(
      (item): item is ImpositionItem => item !== null,
    );
    if (validItems.length > 0) {
      setItems((current) => [...current, ...validItems]);
    }
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

  const updateCopies = (parentId: string, newCopies: number) => {
    const safeCopies = Math.max(1, newCopies);
    setItems((current) => {
      const parent = current.find((item) => item.id === parentId);
      if (!parent) return current;

      const existingCopies = current.filter(
        (item) => item.parentId === parentId,
      );
      const targetCount = safeCopies - 1;

      const withoutCopies = current.filter(
        (item) => item.parentId !== parentId,
      );

      const keptCopies = existingCopies.slice(0, targetCount);

      const newCopyItems: ImpositionItem[] = [];
      for (let i = existingCopies.length + 1; i <= targetCount; i += 1) {
        const pos = findFreeSpot(
          [...withoutCopies, ...keptCopies, ...newCopyItems],
          parent.widthMm,
          parent.heightMm,
        );
        newCopyItems.push({
          ...parent,
          id: `${parentId}-copy-${i}`,
          parentId,
          copies: 1,
          x: pos.x,
          y: pos.y,
          rotation: 0,
        });
      }

      return [
        { ...parent, copies: safeCopies },
        ...keptCopies,
        ...newCopyItems,
        ...withoutCopies.filter((i) => i.id !== parentId),
      ];
    });
  };

  const removeItem = (id: string) => {
    setItems((current) =>
      current.filter((item) => item.id !== id && item.parentId !== id),
    );
    if (
      selectedId === id ||
      items.find((i) => i.parentId === id)?.id === selectedId
    ) {
      const remaining = parentItems.filter((item) => item.id !== id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : '');
    }
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

  const getImageFormat = (src: string) => {
    if (src.startsWith('data:image/png')) return 'PNG';
    if (src.startsWith('data:image/webp')) return 'WEBP';
    return 'JPEG';
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

      items.forEach((item) => {
        const { widthMm, heightMm } = item;
        const xMm = pxToMm(item.x);
        const yMm = pxToMm(item.y);

        pdf.addImage(
          item.src,
          getImageFormat(item.src),
          xMm,
          yMm,
          widthMm,
          heightMm,
          undefined,
          undefined,
          item.rotation,
        );
      });

      pdf.save('imposicao.pdf');
    } catch (error) {
      console.error('Falha ao exportar PDF', error);
    }
  };

  const handlePreviewMouseDown = (
    e: React.MouseEvent,
    id: string,
    item: ImpositionItem,
  ) => {
    e.preventDefault();
    setSelectedId(id);
    setDragId(id);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      origX: item.x,
      origY: item.y,
    };
  };

  const handleRotateStart = (e: React.MouseEvent, item: ImpositionItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(item.id);
    const w = mmToPx(item.widthMm);
    const h = mmToPx(item.heightMm);
    const rect = pageFrameRef.current!.getBoundingClientRect();
    setRotateId(item.id);
    rotateStart.current = {
      x: e.clientX,
      y: e.clientY,
      origRotation: item.rotation,
      cx: rect.left + item.x + w / 2,
      cy: rect.top + item.y + h / 2,
    };
  };

  const handleResizeStart = (e: React.MouseEvent, item: ImpositionItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(item.id);
    const w = mmToPx(item.widthMm);
    const h = mmToPx(item.heightMm);
    const rect = pageFrameRef.current!.getBoundingClientRect();
    setResizeId(item.id);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      origW: w,
      origH: h,
      vpOffsetX: rect.left,
      vpOffsetY: rect.top,
      pfCx: item.x + w / 2,
      pfCy: item.y + h / 2,
      pfLeft: item.x,
      pfTop: item.y,
    };
  };

  useEffect(() => {
    if (dragId === null) {
      return undefined;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const item = items.find((i) => i.id === dragId);
      if (!item) return;
      const w = mmToPx(item.widthMm);
      const h = mmToPx(item.heightMm);
      const vb = visualBBox(w, h, item.rotation);
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const newX = roundPxToMm(
        clamp(
          dragStart.current.origX + dx,
          vb.w / 2 - w / 2,
          PAGE_WIDTH_PX - w / 2 - vb.w / 2,
        ),
      );
      const newY = roundPxToMm(
        clamp(
          dragStart.current.origY + dy,
          vb.h / 2 - h / 2,
          PAGE_HEIGHT_PX - h / 2 - vb.h / 2,
        ),
      );
      updateItem(dragId, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setDragId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragId, items]);

  useEffect(() => {
    if (rotateId === null) return undefined;

    const handleMouseMove = (e: MouseEvent) => {
      const item = items.find((i) => i.id === rotateId);
      if (!item) return;

      const dx = e.clientX - rotateStart.current.cx;
      const dy = e.clientY - rotateStart.current.cy;
      const startDx = rotateStart.current.x - rotateStart.current.cx;
      const startDy = rotateStart.current.y - rotateStart.current.cy;
      const startAngle = Math.atan2(startDy, startDx);
      const currentAngle = Math.atan2(dy, dx);
      const deltaAngle = currentAngle - startAngle;
      const deltaDeg = deltaAngle * (180 / Math.PI);
      const rawRotation = rotateStart.current.origRotation + deltaDeg;
      const newRotation = ((Math.round(rawRotation) % 360) + 360 + 360) % 360;

      updateItem(rotateId, { rotation: newRotation });
    };

    const handleMouseUp = () => setRotateId(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [rotateId, items]);

  useEffect(() => {
    if (resizeId === null) return undefined;

    const handleMouseMove = (e: MouseEvent) => {
      const item = items.find((i) => i.id === resizeId);
      if (!item) return;

      const rad = (-item.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const mousePx = clamp(
        e.clientX - resizeStart.current.vpOffsetX,
        0,
        PAGE_WIDTH_PX,
      );
      const mousePy = clamp(
        e.clientY - resizeStart.current.vpOffsetY,
        0,
        PAGE_HEIGHT_PX,
      );
      const dx = mousePx - resizeStart.current.pfCx;
      const dy = mousePy - resizeStart.current.pfCy;
      const localDx = dx * cos - dy * sin;
      const localDy = dx * sin + dy * cos;
      const cornerX = localDx + resizeStart.current.origW / 2;
      const cornerY = localDy + resizeStart.current.origH / 2;
      const newW = Math.max(mmToPx(5), cornerX);
      const newH = Math.max(mmToPx(5), cornerY);
      updateItem(resizeId, {
        x: resizeStart.current.pfLeft,
        y: resizeStart.current.pfTop,
        widthMm: Math.round(pxToMm(newW)),
        heightMm: Math.round(pxToMm(newH)),
      });
    };

    const handleMouseUp = () => setResizeId(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeId, items]);

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
          <FiUploadCloud size={18} />
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
          <button type="button" onClick={autoPlace} className="ui-button">
            <FiZap size={16} />
            Posicionar automaticamente
          </button>
          <button
            type="button"
            onClick={() => setAutoRandomize((value) => !value)}
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

        <div className="stats-card">
          <span>
            {parentItems.length} imagens · {totalCopies} itens
          </span>
          <span>{utilization.toFixed(1)}% aproveitamento</span>
        </div>

        <div className="items-list">
          {parentItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={
                selectedItem?.id === item.id ||
                selectedItem?.parentId === item.id
                  ? 'item-card selected'
                  : 'item-card'
              }
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
          ))}
        </div>
      </aside>

      <main className="workspace">
        <section className="toolbar">
          <div className="toolbar-header">
            <div>
              <p className="toolbar-label">Selecionado</p>
              <h2>{selectedItem?.name || 'Nenhum item selecionado'}</h2>
            </div>
            {selectedItem && (
              <div className="toolbar-actions">
                <button
                  type="button"
                  className="ui-button"
                  onClick={() =>
                    removeItem(selectedItem.parentId || selectedItem.id)
                  }
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
            )}
          </div>
          {selectedItem && (
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
                  onChange={(event) =>
                    updateItem(selectedItem.id, {
                      widthMm: Number(event.target.value || 0),
                    })
                  }
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
                  onChange={(event) =>
                    updateItem(selectedItem.id, {
                      heightMm: Number(event.target.value || 0),
                    })
                  }
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
                  onChange={(event) =>
                    updateCopies(
                      selectedItem.parentId || selectedItem.id,
                      Math.max(1, Number(event.target.value || 1)),
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
                  onChange={(event) => {
                    const newRotation =
                      ((Number(event.target.value || 0) % 360) + 360) % 360;
                    const oldRotation =
                      ((selectedItem.rotation % 360) + 360) % 360;
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
                      updateItem(selectedItem.id, {
                        rotation: newRotation,
                      });
                    }
                  }}
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
                  onChange={(event) =>
                    updateItem(selectedItem.id, {
                      marginMm: Math.max(0, Number(event.target.value || 0)),
                    })
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
                  onChange={(event) => {
                    const w = mmToPx(selectedItem.widthMm);
                    const h = mmToPx(selectedItem.heightMm);
                    const vb = visualBBox(w, h, selectedItem.rotation);
                    updateItem(selectedItem.id, {
                      x: clamp(
                        mmToPx(Number(event.target.value || 0)),
                        vb.w / 2 - w / 2,
                        PAGE_WIDTH_PX - w / 2 - vb.w / 2,
                      ),
                    });
                  }}
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
                  onChange={(event) => {
                    const w = mmToPx(selectedItem.widthMm);
                    const h = mmToPx(selectedItem.heightMm);
                    const vb = visualBBox(w, h, selectedItem.rotation);
                    updateItem(selectedItem.id, {
                      y: clamp(
                        mmToPx(Number(event.target.value || 0)),
                        vb.h / 2 - h / 2,
                        PAGE_HEIGHT_PX - h / 2 - vb.h / 2,
                      ),
                    });
                  }}
                />
              </label>
            </div>
          )}
        </section>

        <div className="page-preview">
          <div className="page-frame" ref={pageFrameRef}>
            {items.map((item) => {
              const w = mmToPx(item.widthMm);
              const h = mmToPx(item.heightMm);
              const cx = item.x + w / 2;
              const cy = item.y + h / 2;
              const rad = (item.rotation * Math.PI) / 180;
              const cos = Math.cos(rad);
              const sin = Math.sin(rad);

              const isSelected = selectedItem?.id === item.id;

              const gap = 18;
              const rotX = cx + sin * (h / 2 + gap);
              const rotY = cy - cos * (h / 2 + gap);

              const resX = cx + cos * (w / 2) - sin * (h / 2);
              const resY = cy + sin * (w / 2) + cos * (h / 2);

              return (
                <React.Fragment key={item.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    className={`preview-item ${isSelected ? 'selected' : ''} ${dragId === item.id ? 'dragging' : ''}`}
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      width: `${w}px`,
                      height: `${h}px`,
                      transform: `rotate(${item.rotation}deg)`,
                    }}
                    onMouseDown={(e) =>
                      handlePreviewMouseDown(e, item.id, item)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedId(item.id);
                      }
                    }}
                  >
                    <img src={item.src} alt={item.name} />
                  </div>
                  {isSelected && (
                    <>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label="Rotacionar"
                        className="rotation-handle"
                        style={{ left: rotX, top: rotY }}
                        onMouseDown={(e) => handleRotateStart(e, item)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleRotateStart(
                              e as unknown as React.MouseEvent,
                              item,
                            );
                          }
                        }}
                      />
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label="Redimensionar"
                        className="resize-handle"
                        style={{ left: resX, top: resY }}
                        onMouseDown={(e) => handleResizeStart(e, item)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleResizeStart(
                              e as unknown as React.MouseEvent,
                              item,
                            );
                          }
                        }}
                      />
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
