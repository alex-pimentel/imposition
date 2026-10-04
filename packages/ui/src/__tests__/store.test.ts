import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ImpositionItem } from '@imposition/core';

vi.mock('@imposition/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@imposition/core')>();
  return {
    ...actual,
    readImageData: vi.fn(async (file: File) => ({
      src: `data:image/png;base64,${file.name}`,
      naturalWidth: 200,
      naturalHeight: 100,
    })),
    getImageFormat: vi.fn(() => 'PNG'),
  };
});

import {
  useImpositionStore,
  selectParentItems,
  selectSelectedItem,
  selectDisplayCopies,
  selectTotalCopies,
  selectUtilization,
  selectCanvasView,
  selectInteractiveGrid,
  type ImpositionStore,
} from '../store';

const initialState = useImpositionStore.getState();

const resetStore = () =>
  useImpositionStore.setState({ ...initialState, items: [], selectedId: '' });

const makeItem = (overrides: Partial<ImpositionItem> = {}): ImpositionItem => ({
  id: 'a',
  name: 'a.png',
  src: 'data:image/png;base64,AAAA',
  naturalWidth: 100,
  naturalHeight: 100,
  widthMm: 40,
  heightMm: 40,
  copies: 1,
  x: 10,
  y: 10,
  rotation: 0,
  ...overrides,
});

const seed = (items: ImpositionItem[], selectedId = '') =>
  useImpositionStore.setState({ items, selectedId });

describe('imposition store', () => {
  beforeEach(resetStore);
  afterEach(() => vi.clearAllMocks());

  it('starts empty with sensible defaults', () => {
    const s = useImpositionStore.getState();
    expect(s.items).toEqual([]);
    expect(s.pageWidthMm).toBe(210);
    expect(s.pageHeightMm).toBe(297);
    expect(s.pageMarginMm).toBe(8);
    expect(s.unit).toBe('mm');
  });

  it('adds accepted images and ignores unsupported files', async () => {
    const good = new File(['x'], 'a.png', { type: 'image/png' });
    const bad = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    await useImpositionStore.getState().addImages([good, bad] as unknown as FileList);
    const { items } = useImpositionStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('a.png');
    expect(items[0].copies).toBe(1);
  });

  it('does nothing when files is null', async () => {
    await useImpositionStore.getState().addImages(null);
    expect(useImpositionStore.getState().items).toEqual([]);
  });

  it('updates an existing item', () => {
    seed([makeItem({ id: '1' })]);
    useImpositionStore.getState().updateItem('1', { widthMm: 55, rotation: 30 });
    expect(useImpositionStore.getState().items[0]).toMatchObject({ widthMm: 55, rotation: 30 });
  });

  it('removes an item and its copies, reselecting a parent', () => {
    seed(
      [
        makeItem({ id: 'p1' }),
        makeItem({ id: 'c1', parentId: 'p1', copies: 0 }),
        makeItem({ id: 'p2' }),
      ],
      'p1',
    );
    useImpositionStore.getState().removeFromList('p1');
    const { items, selectedId } = useImpositionStore.getState();
    expect(items.map((i) => i.id)).toEqual(['p2']);
    expect(selectedId).toBe('p2');
  });

  it('clears selection when the last parent is removed', () => {
    seed([makeItem({ id: 'p1' })], 'p1');
    useImpositionStore.getState().removeFromList('p1');
    expect(useImpositionStore.getState().selectedId).toBe('');
  });

  it('setters clamp and toggle state', () => {
    const s = useImpositionStore.getState();
    s.setSelectedId('x');
    s.setInteractiveGrid(true);
    s.setPageMargin(-5);
    s.setPageSize(100, 200);
    s.setUnit('cm');
    const next = useImpositionStore.getState();
    expect(next.selectedId).toBe('x');
    expect(next.interactiveGrid).toBe(true);
    expect(next.pageMarginMm).toBe(0);
    expect(next.pageWidthMm).toBe(100);
    expect(next.pageHeightMm).toBe(200);
    expect(next.unit).toBe('cm');
  });

  it('selectFirst selects the first parent only when nothing is selected', () => {
    seed([makeItem({ id: 'p1' }), makeItem({ id: 'p2' })], '');
    useImpositionStore.getState().selectFirst();
    expect(useImpositionStore.getState().selectedId).toBe('p1');

    useImpositionStore.setState({ selectedId: 'p2' });
    useImpositionStore.getState().selectFirst();
    expect(useImpositionStore.getState().selectedId).toBe('p2');
  });

  it('duplicates an item and selects the copy', () => {
    seed([makeItem({ id: 'p1', widthMm: 40, heightMm: 40 })]);
    useImpositionStore.getState().duplicateItem('p1');
    const { items, selectedId } = useImpositionStore.getState();
    expect(items).toHaveLength(2);
    expect(selectedId).toBe(items[1].id);
    expect(items[1].id).not.toBe('p1');
  });

  it('duplicateItem ignores unknown ids', () => {
    seed([makeItem({ id: 'p1' })]);
    useImpositionStore.getState().duplicateItem('missing');
    expect(useImpositionStore.getState().items).toHaveLength(1);
  });

  it('reorders items with sendToBack and bringToFront', () => {
    seed([makeItem({ id: 'a' }), makeItem({ id: 'b' }), makeItem({ id: 'c' })]);
    useImpositionStore.getState().sendToBack('c');
    expect(useImpositionStore.getState().items[0].id).toBe('c');
    useImpositionStore.getState().bringToFront('c');
    expect(useImpositionStore.getState().items.at(-1)?.id).toBe('c');
  });

  it('alignCenter clamps within the page', () => {
    seed([makeItem({ id: 'a', widthMm: 40, heightMm: 40 })]);
    useImpositionStore.getState().alignCenter('a', 'x');
    const item = useImpositionStore.getState().items[0];
    expect(item.x).toBeGreaterThan(0);
    useImpositionStore.getState().alignCenter('a', 'y');
    expect(useImpositionStore.getState().items[0].y).toBeGreaterThan(0);
  });

  it('updateCopies creates and removes copies', () => {
    seed([makeItem({ id: 'p1', copies: 1 })]);
    useImpositionStore.getState().updateCopies('p1', 3);
    const withCopies = useImpositionStore.getState().items;
    expect(withCopies.filter((i) => i.parentId === 'p1')).toHaveLength(2);
    expect(useImpositionStore.getState().items.find((i) => i.id === 'p1')?.copies).toBe(3);

    useImpositionStore.getState().updateCopies('p1', 1);
    expect(useImpositionStore.getState().items.filter((i) => i.parentId === 'p1')).toHaveLength(0);

    useImpositionStore.getState().updateCopies('p1', 0);
    expect(useImpositionStore.getState().items.find((i) => i.id === 'p1')?.copies).toBe(0);
  });

  it('autoPlace repositions sheet items deterministically', () => {
    seed([makeItem({ id: 'a', x: 0, y: 0 }), makeItem({ id: 'b', x: 0, y: 0 })]);
    useImpositionStore.getState().autoPlace();
    const { items } = useImpositionStore.getState();
    expect(items[0].x).toBeGreaterThan(0);
    expect(items[0].y).toBeGreaterThan(0);
    expect(items[1].id).toBe('b');
  });

  it('resetLayout zeroes coordinates and resetCanvasView restores zoom', () => {
    seed([makeItem({ id: 'a', x: 99, y: 99 })]);
    useImpositionStore.getState().resetLayout();
    expect(useImpositionStore.getState().items[0]).toMatchObject({ x: 0, y: 0 });

    useImpositionStore.getState().setFittedZoom(0.7);
    useImpositionStore.getState().setCanvasZoom(2);
    useImpositionStore.getState().setCanvasPan({ x: 5, y: 5 });
    useImpositionStore.getState().resetCanvasView();
    expect(useImpositionStore.getState().canvasView.zoom).toBe(0.7);
    expect(useImpositionStore.getState().canvasView.pan).toEqual({ x: 0, y: 0 });
  });

  it('clamps canvas zoom between 0.25 and 3', () => {
    useImpositionStore.getState().setCanvasZoom(9);
    expect(useImpositionStore.getState().canvasView.zoom).toBe(3);
    useImpositionStore.getState().setCanvasZoom(0.01);
    expect(useImpositionStore.getState().canvasView.zoom).toBe(0.25);
  });

  it('exportPdf does nothing when there are no sheet items', async () => {
    seed([makeItem({ id: 'a', copies: 0 })]);
    await expect(useImpositionStore.getState().exportPdf()).resolves.toBeUndefined();
  });
});

describe('selectors', () => {
  beforeEach(resetStore);

  it('selectParentItems keeps only top-level items', () => {
    const state = {
      items: [makeItem({ id: 'p' }), makeItem({ id: 'c', parentId: 'p' })],
    } as ImpositionStore;
    expect(selectParentItems(state).map((i) => i.id)).toEqual(['p']);
  });

  it('selectSelectedItem returns the selected item or null', () => {
    seed([makeItem({ id: 'p1' })], 'p1');
    expect(selectSelectedItem(useImpositionStore.getState())?.id).toBe('p1');
    useImpositionStore.setState({ selectedId: 'nope' });
    expect(selectSelectedItem(useImpositionStore.getState())).toBeNull();
  });

  it('selectDisplayCopies follows the parent for copies', () => {
    const parent = makeItem({ id: 'p1', copies: 4 });
    const child = makeItem({ id: 'c1', parentId: 'p1', copies: 1 });
    const state = { items: [parent, child], selectedId: 'c1' } as ImpositionStore;
    expect(selectDisplayCopies(state)).toBe(4);
    expect(selectDisplayCopies({ ...state, selectedId: 'p1' })).toBe(4);
    expect(selectDisplayCopies({ ...state, selectedId: 'missing' })).toBe(1);
  });

  it('selectTotalCopies sums parent copies', () => {
    const state = {
      items: [makeItem({ id: 'p1', copies: 2 }), makeItem({ id: 'p2', copies: 3 })],
    } as ImpositionStore;
    expect(selectTotalCopies(state)).toBe(5);
  });

  it('selectUtilization reports a percentage', () => {
    seed([makeItem({ id: 'p1' })]);
    expect(selectUtilization(useImpositionStore.getState())).toBeGreaterThan(0);
  });

  it('selectCanvasView and selectInteractiveGrid expose state', () => {
    const state = useImpositionStore.getState();
    expect(selectCanvasView(state)).toBe(state.canvasView);
    expect(selectInteractiveGrid(state)).toBe(state.interactiveGrid);
  });
});
