import "server-only";
import { cloudinaryCardUrl, cloudinaryDetailUrl } from "@/lib/cloudinary-url";
import { r2PublicUrl } from "@/lib/admin/r2";

// Picks the right pre-generated R2 variant for a product photo, or
// falls back to Cloudinary's on-the-fly transform for any row that
// predates the migration script (scripts/migrate-images-to-r2.mjs) --
// see supabase/migrations/0020_r2_images.sql. Once every product_images
// row has an r2_key, the cloudinary_url fallback (and the Cloudinary
// account itself) can go.
export type StoredProductImage = { r2Key: string | null; cloudinaryUrl: string | null };

// The large photo -- product detail page's gallery main image.
export function productFullUrl(image: StoredProductImage): string | null {
  if (image.r2Key) return r2PublicUrl(`${image.r2Key}/full.webp`);
  return image.cloudinaryUrl ? cloudinaryDetailUrl(image.cloudinaryUrl) : null;
}

// The small photo -- catalogue/card grid thumbnails and the gallery's
// thumbnail strip share this one size. (Cloudinary generated three
// separate on-the-fly presets for these; R2 only has the sizes we
// actually pre-generate at upload time, so card and thumbnail-strip
// share a single small variant instead.)
export function productThumbUrl(image: StoredProductImage): string | null {
  if (image.r2Key) return r2PublicUrl(`${image.r2Key}/thumb.webp`);
  return image.cloudinaryUrl ? cloudinaryCardUrl(image.cloudinaryUrl) : null;
}
