export type ImpositionItem = {
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
