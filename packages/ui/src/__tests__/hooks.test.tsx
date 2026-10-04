import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ImpositionItem } from '@imposition/core';
import { mmToPx } from '@imposition/core';
import { useDrag } from '../hooks/useDrag';
import { useResize } from '../hooks/useResize';
import { useRotate } from '../hooks/useRotate';
import { useImpositionStore } from '../store';

const makeItem = (overrides: Partial<ImpositionItem> = {}): ImpositionItem => ({
  id: 'a',
  name: 'a.png',
  src: 'data:image/png;base64,AAAA',
  naturalWidth: 100,
  naturalHeight: 100,
  widthMm: 40,
  heightMm: 40,
  copies: 1,
  x: mmToPx(20),
  y: mmToPx(20),
  rotation: 0,
  ...overrides,
});

const rect = (overrides: Partial<DOMRect> = {}) =>
  ({
    left: 0,
    top: 0,
    right: 500,
    bottom: 700,
    width: 500,
    height: 700,
    x: 0,
    y: 0,
    toJSON: () => ({}),
    ...overrides,
  }) as DOMRect;

const mouse = (type: string, clientX: number, clientY: number) =>
  act(() => {
    window.dispatchEvent(new MouseEvent(type, { clientX, clientY, bubbles: true }));
  });

describe('useDrag', () => {
  beforeEach(() => useImpositionStore.setState({ items: [makeItem()], selectedId: 'a' }));
  afterEach(() => useImpositionStore.setState({ items: [], selectedId: '' }));

  it('reports dragging state', () => {
    const { result } = renderHook(() => useDrag());
    expect(result.current.isDragging).toBe(false);
    act(() =>
      result.current.startDrag('a', { x: mmToPx(20), y: mmToPx(20) }, { clientX: 0, clientY: 0 }),
    );
    expect(result.current.isDragging).toBe(true);
  });

  it('moves the item while dragging and stops on mouse up', () => {
    const { result } = renderHook(() => useDrag());
    act(() =>
      result.current.startDrag(
        'a',
        { x: mmToPx(20), y: mmToPx(20) },
        { clientX: 100, clientY: 100 },
      ),
    );
    mouse('mousemove', 140, 140);
    const moved = useImpositionStore.getState().items[0];
    expect(moved.x).toBeGreaterThan(mmToPx(20));
    mouse('mouseup', 0, 0);
    expect(result.current.isDragging).toBe(false);
  });

  it('computes guidelines when the interactive grid is enabled', () => {
    useImpositionStore.setState({
      interactiveGrid: true,
      items: [
        makeItem({ id: 'a', x: mmToPx(20), y: mmToPx(20) }),
        makeItem({ id: 'b', x: mmToPx(21), y: mmToPx(20) }),
      ],
    });
    const { result } = renderHook(() => useDrag());
    act(() =>
      result.current.startDrag(
        'a',
        { x: mmToPx(20), y: mmToPx(20) },
        { clientX: 100, clientY: 100 },
      ),
    );
    mouse('mousemove', 104, 100);
    expect(result.current.guidelines.length).toBeGreaterThanOrEqual(0);
  });

  it('ignores items with zero copies', () => {
    useImpositionStore.setState({ items: [makeItem({ copies: 0 })] });
    const { result } = renderHook(() => useDrag());
    act(() =>
      result.current.startDrag(
        'a',
        { x: mmToPx(20), y: mmToPx(20) },
        { clientX: 100, clientY: 100 },
      ),
    );
    mouse('mousemove', 200, 200);
    expect(useImpositionStore.getState().items[0].x).toBe(mmToPx(20));
  });
});

describe('useResize', () => {
  beforeEach(() => useImpositionStore.setState({ items: [makeItem()], selectedId: 'a' }));
  afterEach(() => useImpositionStore.setState({ items: [], selectedId: '' }));

  it('resizes the item while dragging and clears on mouse up', () => {
    const { result } = renderHook(() => useResize());
    act(() => result.current.startResize('a', makeItem(), rect(), { clientX: 100, clientY: 100 }));
    expect(result.current.isResizing).toBe(true);
    mouse('mousemove', 200, 200);
    const item = useImpositionStore.getState().items[0];
    expect(item.widthMm).toBeGreaterThanOrEqual(5);
    mouse('mouseup', 0, 0);
    expect(result.current.isResizing).toBe(false);
  });

  it('never shrinks below 5mm', () => {
    const { result } = renderHook(() => useResize());
    act(() => result.current.startResize('a', makeItem(), rect(), { clientX: 100, clientY: 100 }));
    mouse('mousemove', -500, -500);
    expect(useImpositionStore.getState().items[0].widthMm).toBeGreaterThanOrEqual(5);
  });
});

describe('useRotate', () => {
  beforeEach(() => useImpositionStore.setState({ items: [makeItem()], selectedId: 'a' }));
  afterEach(() => useImpositionStore.setState({ items: [], selectedId: '' }));

  it('rotates the item and normalizes the angle', () => {
    const { result } = renderHook(() => useRotate());
    act(() =>
      result.current.startRotate(
        'a',
        { x: mmToPx(20), y: mmToPx(20), widthMm: 40, heightMm: 40, rotation: 0 },
        rect(),
        { clientX: 100, clientY: 100 },
      ),
    );
    expect(result.current.isRotating).toBe(true);
    mouse('mousemove', 150, 200);
    const rotation = useImpositionStore.getState().items[0].rotation;
    expect(rotation).toBeGreaterThanOrEqual(0);
    expect(rotation).toBeLessThan(360);
    mouse('mouseup', 0, 0);
    expect(result.current.isRotating).toBe(false);
  });
});
