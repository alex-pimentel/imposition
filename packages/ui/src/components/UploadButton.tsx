import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { useImpositionStore } from '../store';
import { cn } from '../lib/utils';

export function UploadButton() {
  const addImages = useImpositionStore((s) => s.addImages);
  const [isDragging, setIsDragging] = useState(false);

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

  return (
    <label
      htmlFor="image-import"
      className={cn(
        'flex min-h-[72px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/50 px-4 py-4 text-center transition-colors hover:border-primary/50 hover:bg-secondary',
        isDragging && 'border-primary bg-primary/10',
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <UploadCloud size={20} className="text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground">
        {isDragging
          ? 'Drop images here'
          : 'Drag or click to import'}
      </span>
      <input
        id="image-import"
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        multiple
        className="hidden"
        onChange={(event) => addImages(event.target.files)}
      />
    </label>
  );
}
