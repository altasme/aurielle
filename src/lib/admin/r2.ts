import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Minimal shape of the R2 binding methods this app actually calls --
// deliberately not the full @cloudflare/workers-types ambient R2Bucket
// (that package's globals conflict with the DOM lib types the
// browser-side code in this project already relies on).
interface R2BucketLike {
  put(
    key: string,
    value: ArrayBuffer | Uint8Array,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
  delete(keys: string | string[]): Promise<void>;
}

declare global {
  interface CloudflareEnv {
    IMAGES_BUCKET?: R2BucketLike;
  }
}

function getBucket(): R2BucketLike {
  const { env } = getCloudflareContext();
  if (!env.IMAGES_BUCKET) throw new Error("Missing IMAGES_BUCKET R2 binding (see wrangler.jsonc)");
  return env.IMAGES_BUCKET;
}

export async function putImage(key: string, blob: Blob): Promise<void> {
  const bucket = getBucket();
  const buffer = await blob.arrayBuffer();
  await bucket.put(key, buffer, { httpMetadata: { contentType: blob.type || "image/webp" } });
}

// Best-effort by design at every call site: a failed delete leaves an
// orphaned object with no DB reference, never a broken product or
// page (same tradeoff the Cloudinary delete helper it replaces made).
export async function deleteImages(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await getBucket().delete(keys);
}

export function r2PublicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) throw new Error("Missing R2_PUBLIC_BASE_URL");
  return `${base.replace(/\/$/, "")}/${key}`;
}
