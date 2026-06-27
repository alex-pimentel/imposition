import React, { useRef } from 'react';
import { useImpositionStore } from '../store';
import { PreviewItem } from './PreviewItem';
import { useDrag } from '../hooks/useDrag';
import { useRotate } from '../hooks/useRotate';
import { useResize } from '../hooks/useResize';

export function PagePreview() {
  const items = useImpositionStore((s) => s.items);
  const pageFrameRef = useRef<HTMLDivElement>(null);
  const dragHook = useDrag();
  const rotateHook = useRotate();
  const resizeHook = useResize();

  return (
    <div className="page-preview">
      <div className="page-frame" ref={pageFrameRef}>
        {items.map((item) => (
          <PreviewItem
            key={item.id}
            item={item}
            pageFrameRef={pageFrameRef}
            dragHook={dragHook}
            rotateHook={rotateHook}
            resizeHook={resizeHook}
          />
        ))}
      </div>
    </div>
  );
}
