import React, { useState } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import { useImpositionStore } from '../store';

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
  );
}
