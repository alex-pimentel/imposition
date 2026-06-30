import { create } from 'zustand';
import type { ImpositionItem } from '@imposition/core';
import {
  readImageData,
  isAcceptedImageFile,
  getDefaultSizeMm,
  makeId,
  getImageFormat,
  placeItems,
  findFreeSpot,
  calculateUtilization,
  pxToMm,
  mmToPx,
  clampPosition,
  PAGE_WIDTH_PX,
  PAGE_HEIGHT_PX,
} from '@imposition/core';

export type CanvasView = {
  zoom: number;
  pan: { x: number; y: number };
};

export type ImpositionState = {
  items: ImpositionItem[];
  selectedId: string;

  interactiveGrid: boolean;
  canvasView: CanvasView;
  pageMarginMm: number;
};

export type ImpositionActions = {
  addImages: (files: FileList | null) => Promise<void>;
  updateItem: (id: string, updates: Partial<ImpositionItem>) => void;
  removeFromList: (id: string) => void;
  setSelectedId: (id: string) => void;

  setInteractiveGrid: (value: boolean) => void;
  setPageMargin: (margin: number) => void;
  updateCopies: (parentId: string, newCopies: number) => void;
  autoPlace: () => void;
  resetLayout: () => void;
  resetCanvasView: () => void;
  setCanvasZoom: (zoom: number) => void;
  setCanvasPan: (pan: { x: number; y: number }) => void;
  duplicateItem: (id: string) => void;
  sendToBack: (id: string) => void;
  bringToFront: (id: string) => void;
  alignCenter: (id: string, axis: 'x' | 'y') => void;
  exportPdf: () => Promise<void>;
  selectFirst: () => void;
};

export type ImpositionStore = ImpositionState & ImpositionActions;

const DEFAULT_CANVAS_VIEW: CanvasView = {
  zoom: 1,
  pan: { x: 0, y: 0 },
};

export const useImpositionStore = create<ImpositionStore>((set, get) => ({
  items: [],
  selectedId: '',
  interactiveGrid: true,
  canvasView: DEFAULT_CANVAS_VIEW,
  pageMarginMm: 8,

  setSelectedId: (id) => set({ selectedId: id }),

  setInteractiveGrid: (value) => set({ interactiveGrid: value }),

  setPageMargin: (margin) => set({ pageMarginMm: Math.max(0, margin) }),

  selectFirst: () => {
    const { items, selectedId } = get();
    const parents = items.filter((item) => !item.parentId);
    if (parents.length > 0 && !selectedId) {
      set({ selectedId: parents[0].id });
    }
  },

  addImages: async (files) => {
    if (!files) return;

    const fileArray = Array.from(files).filter(isAcceptedImageFile);
    if (fileArray.length === 0) return;

    const pageMargin = get().pageMarginMm;
    const loaded = await Promise.all(
      fileArray.map(async (file): Promise<ImpositionItem | null> => {
        try {
          const data = await readImageData(file);
          const defaults = getDefaultSizeMm(data.naturalWidth, data.naturalHeight);

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
            marginMm: pageMargin,
          };
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
      set((state) => ({ items: [...state.items, ...validItems] }));
    }
  },

  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    }));
  },

  removeFromList: (id) => {
    set((state) => {
      const filtered = state.items.filter(
        (item) => item.id !== id && item.parentId !== id,
      );
      const parents = filtered.filter((item) => !item.parentId);
      const newSelectedId =
        state.selectedId === id ||
        state.items.find((i) => i.parentId === id)?.id === state.selectedId
          ? parents.length > 0
            ? parents[0].id
            : ''
          : state.selectedId;
      return { items: filtered, selectedId: newSelectedId };
    });
  },

  duplicateItem: (id) => {
    const pageMargin = get().pageMarginMm;
    set((state) => {
      const source = state.items.find((item) => item.id === id);
      if (!source) return state;

      const parent = source.parentId
        ? state.items.find((item) => item.id === source.parentId)
        : source;
      if (!parent) return state;

      const newId = makeId();
      const sheetItems = state.items.filter((item) => item.copies > 0);
      const pos = findFreeSpot(sheetItems, parent.widthMm, parent.heightMm, pageMargin);

      const newItem: ImpositionItem = {
        ...parent,
        id: newId,
        parentId: undefined,
        copies: 1,
        x: pos.x,
        y: pos.y,
        rotation: 0,
      };

      return {
        items: [...state.items, newItem],
        selectedId: newId,
      };
    });
  },

  sendToBack: (id) => {
    set((state) => {
      const item = state.items.find((i) => i.id === id);
      if (!item) return state;
      const rest = state.items.filter((i) => i.id !== id);
      return { items: [item, ...rest] };
    });
  },

  bringToFront: (id) => {
    set((state) => {
      const item = state.items.find((i) => i.id === id);
      if (!item) return state;
      const rest = state.items.filter((i) => i.id !== id);
      return { items: [...rest, item] };
    });
  },

  alignCenter: (id, axis) => {
    set((state) => {
      const item = state.items.find((i) => i.id === id);
      if (!item) return state;

      const w = mmToPx(item.widthMm);
      const h = mmToPx(item.heightMm);
      const centerX = PAGE_WIDTH_PX / 2 - w / 2;
      const centerY = PAGE_HEIGHT_PX / 2 - h / 2;

      const next = { ...item };
      if (axis === 'x') next.x = centerX;
      if (axis === 'y') next.y = centerY;

      const clamped = clampPosition(next.x, next.y, w, h, next.rotation);
      next.x = clamped.x;
      next.y = clamped.y;

      return {
        items: state.items.map((i) => (i.id === id ? next : i)),
      };
    });
  },

  updateCopies: (parentId, newCopies) => {
    const safeCopies = Math.max(0, newCopies);
    const pageMargin = get().pageMarginMm;
    set((state) => {
      const parent = state.items.find((item) => item.id === parentId);
      if (!parent) return state;

      const withoutCopies = state.items.filter(
        (item) => item.parentId !== parentId,
      );

      if (safeCopies === 0) {
        return {
          items: [
            { ...parent, copies: 0 },
            ...withoutCopies.filter((i) => i.id !== parentId),
          ],
        };
      }

      const targetCount = safeCopies - 1;
      const existingCopies = state.items.filter(
        (item) => item.parentId === parentId,
      );
      const keptCopies = existingCopies.slice(0, targetCount);

      const newCopyItems: ImpositionItem[] = [];
      for (let i = existingCopies.length + 1; i <= targetCount; i += 1) {
        const pos = findFreeSpot(
          [...withoutCopies, ...keptCopies, ...newCopyItems],
          parent.widthMm,
          parent.heightMm,
          pageMargin,
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

      return {
        items: [
          { ...parent, copies: safeCopies },
          ...keptCopies,
          ...newCopyItems,
          ...withoutCopies.filter((i) => i.id !== parentId),
        ],
      };
    });
  },

  autoPlace: () => {
    const { items, pageMarginMm } = get();
    const sheetItems = items.filter((item) => item.copies > 0);
    const placed = placeItems(sheetItems, { randomize: false, pageMarginMm });

    const placedMap = new Map(placed.map((item) => [item.id, item]));
    set({
      items: items.map((item) => {
        const p = placedMap.get(item.id);
        if (!p) return item;
        return { ...item, x: p.x, y: p.y };
      }),
    });
  },

  resetLayout: () => {
    set((state) => ({
      items: state.items.map((item) => ({ ...item, x: 0, y: 0 })),
    }));
  },

  resetCanvasView: () => set({ canvasView: DEFAULT_CANVAS_VIEW }),

  setCanvasZoom: (zoom) =>
    set((state) => ({
      canvasView: { ...state.canvasView, zoom: Math.max(0.25, Math.min(3, zoom)) },
    })),

  setCanvasPan: (pan) =>
    set((state) => ({
      canvasView: { ...state.canvasView, pan },
    })),

  exportPdf: async () => {
    const { items } = get();
    const sheetItems = items.filter((item) => item.copies > 0);
    if (sheetItems.length === 0) return;

    try {
      const { jsPDF: JsPDF } = await import('jspdf');
      const pdf = new JsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      sheetItems.forEach((item) => {
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
          -item.rotation,
        );
      });

      pdf.save('imposicao.pdf');
    } catch (error) {
      console.error('Falha ao exportar PDF', error);
    }
  },
}));

export const selectParentItems = (state: ImpositionStore) =>
  state.items.filter((item) => !item.parentId);

export const selectSelectedItem = (state: ImpositionStore) =>
  state.items.find((i) => i.id === state.selectedId) || null;

export const selectDisplayCopies = (state: ImpositionStore) => {
  const { items, selectedId } = state;
  const selected = items.find((i) => i.id === selectedId);
  if (!selected) return 1;
  if (selected.parentId) {
    const parent = items.find((p) => p.id === selected.parentId);
    return parent?.copies ?? 1;
  }
  return selected.copies;
};

export const selectTotalCopies = (state: ImpositionStore) => {
  const parents = state.items.filter((item) => !item.parentId);
  return parents.reduce((sum, p) => sum + p.copies, 0);
};

export const selectUtilization = (state: ImpositionStore) =>
  calculateUtilization(state.items);

export const selectCanvasView = (state: ImpositionStore) => state.canvasView;

export const selectInteractiveGrid = (state: ImpositionStore) =>
  state.interactiveGrid;
