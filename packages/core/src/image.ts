import { clamp } from './utils';

export const getDefaultSizeMm = (
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

export const readImageData = (
  file: File,
): Promise<{ src: string; naturalWidth: number; naturalHeight: number }> =>
  new Promise((resolve, reject) => {
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
      image.onerror = () => reject(new Error('Não foi possível abrir a imagem.'));
      image.src = result;
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
    reader.readAsDataURL(file);
  });

export const isAcceptedImageFile = (file: File) =>
  /^image\/(png|jpe?g|webp)$/i.test(file.type) ||
  /\.(png|jpe?g|jpg|webp)$/i.test(file.name);

export const getImageFormat = (src: string) => {
  if (src.startsWith('data:image/png')) return 'PNG';
  if (src.startsWith('data:image/webp')) return 'WEBP';
  return 'JPEG';
};
