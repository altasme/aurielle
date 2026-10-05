// Browser-only. Workers can't run a native image library like sharp,
// so resizing/re-encoding happens here, before upload, instead of on
// the server the way Cloudinary's on-the-fly transform did -- R2 only
// ever stores the exact sizes the site serves (see
// src/lib/product-image-url.ts), nothing is resized at request time.
export async function resizeImageToWebp(file: Blob, maxDimension: number, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (!blob) throw new Error("Failed to encode image");
  return blob;
}
