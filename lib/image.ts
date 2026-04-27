"use client";

/** Compress a File to a square base-64 data URL. Crops to a centered square,
 *  scales to `size`x`size`, returns a JPEG at `quality`. Keeps localStorage
 *  payloads tiny (~10–25kb) so we can persist photos client-side. */
export async function compressImage(file: File, size = 256, quality = 0.82): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload  = () => resolve(i);
    i.onerror = () => reject(new Error("Could not read this image."));
    i.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser.");

  // Center-crop to a square, then draw scaled
  const minSide = Math.min(img.width, img.height);
  const sx = (img.width  - minSide) / 2;
  const sy = (img.height - minSide) / 2;
  ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

  return canvas.toDataURL("image/jpeg", quality);
}
