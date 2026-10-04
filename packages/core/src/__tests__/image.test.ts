import { describe, expect, it } from 'vitest';
import { getDefaultSizeMm, isAcceptedImageFile, getImageFormat } from '../image';

const file = (name: string, type: string) => new File(['x'], name, { type }) as unknown as File;

describe('getDefaultSizeMm', () => {
  it('uses a landscape box for wide images', () => {
    const size = getDefaultSizeMm(200, 100);
    expect(size.widthMm).toBeGreaterThan(size.heightMm);
    expect(size.widthMm).toBeLessThanOrEqual(80);
    expect(size.heightMm).toBeGreaterThanOrEqual(20);
  });

  it('uses a portrait box for tall images', () => {
    const size = getDefaultSizeMm(100, 300);
    expect(size.heightMm).toBeGreaterThan(size.widthMm);
    expect(size.heightMm).toBeLessThanOrEqual(80);
  });

  it('clamps extreme aspect ratios to the allowed range', () => {
    const wide = getDefaultSizeMm(10000, 1);
    expect(wide.widthMm).toBeLessThanOrEqual(80);
    const tall = getDefaultSizeMm(1, 10000);
    expect(tall.heightMm).toBeLessThanOrEqual(80);
  });
});

describe('isAcceptedImageFile', () => {
  it('accepts png, jpg, jpeg and webp by mime type', () => {
    expect(isAcceptedImageFile(file('a.png', 'image/png'))).toBe(true);
    expect(isAcceptedImageFile(file('a.jpg', 'image/jpeg'))).toBe(true);
    expect(isAcceptedImageFile(file('a.webp', 'image/webp'))).toBe(true);
  });

  it('accepts by extension when the mime type is missing', () => {
    expect(isAcceptedImageFile(file('photo.JPEG', ''))).toBe(true);
    expect(isAcceptedImageFile(file('photo.webp', ''))).toBe(true);
  });

  it('rejects unsupported files', () => {
    expect(isAcceptedImageFile(file('doc.pdf', 'application/pdf'))).toBe(false);
    expect(isAcceptedImageFile(file('clip.gif', 'image/gif'))).toBe(false);
  });
});

describe('getImageFormat', () => {
  it('detects png and webp data urls', () => {
    expect(getImageFormat('data:image/png;base64,AAAA')).toBe('PNG');
    expect(getImageFormat('data:image/webp;base64,AAAA')).toBe('WEBP');
  });

  it('falls back to JPEG', () => {
    expect(getImageFormat('data:image/jpeg;base64,AAAA')).toBe('JPEG');
    expect(getImageFormat('https://example.com/x')).toBe('JPEG');
  });
});
