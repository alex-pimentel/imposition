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
} from '@imposition/core';

export type ImpositionState = {
  items: ImpositionItem[];
  selectedId: string;
  autoRandomize: boolean;
};

export type ImpositionActions = {
  addImages: (files: FileList | null) => Promise<void>;
  updateItem: (id: string, updates: Partial<ImpositionItem>) => void;
  removeItem: (id: string) => void;
  setSelectedId: (id: string) => void;
  setAutoRandomize: (value: boolean) => void;
  updateCopies: (parentId: string, newCopies: number) => void;
  autoPlace: () => void;
  resetLayout: () => void;
  exportPdf: () => Promise<void>;
  selectFirst: () => void;
};

export type ImpositionStore = ImpositionState & ImpositionActions;

export const useImpositionStore = create<ImpositionStore>((set, get) => ({
  items: [],
  selectedId: '',
  autoRandomize: false,

  setSelectedId: (id) => set({ selectedId: id }),

  setAutoRandomize: (value) => set({ autoRandomize: value }),

  selectFirst: () => {
    const { items, selectedId } = get();
    if (items.length > 0 && !selectedId) {
      set({ selectedId: items[0].id });
    }
  },

  addImages: async (files) => {
    if (!files) return;

    const fileArray = Array.from(files).filter(isAcceptedImageFile);
    if (fileArray.length === 0) return;

    const loaded = await Promise.all(
      fileArray.map(async (file) => {
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

  removeItem: (id) => {
    set((state) => {
      const filtered = state.items.filter(
        (item) => item.id !== id && item.parentId !== id,
      );
      const newSelectedId =
        state.selectedId === id ||
        state.items.find((i) => i.parentId === id)?.id === state.selectedId
          ? filtered.filter((item) => !item.parentId).length > 0
            ? filtered.filter((item) => !item.parentId)[0].id
            : ''
          : state.selectedId;
      return { items: filtered, selectedId: newSelectedId };
    });
  },

  updateCopies: (parentId, newCopies) => {
    const safeCopies = Math.max(1, newCopies);
    set((state) => {
      const parent = state.items.find((item) => item.id === parentId);
      if (!parent) return state;

      const existingCopies = state.items.filter(
        (item) => item.parentId === parentId,
      );
      const targetCount = safeCopies - 1;

      const withoutCopies = state.items.filter(
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
    const { items, autoRandomize } = get();
    set({ items: placeItems(items, { randomize: autoRandomize }) });
  },

  resetLayout: () => {
    set((state) => ({
      items: state.items.map((item) => ({ ...item, x: 0, y: 0 })),
    }));
  },

  exportPdf: async () => {
    const { items } = get();
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
