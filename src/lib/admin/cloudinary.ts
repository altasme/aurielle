import "server-only";
import { createHash } from "node:crypto";

// Legacy-asset cleanup only: every new upload now goes to R2 (see
// src/lib/admin/r2.ts) rather than Cloudinary, but this still deletes
// the Cloudinary asset behind a pre-migration row when its DB row is
// deleted or replaced (product_images.cloudinary_public_id /
// site_image_slots.cloudinary_public_id). Once
// scripts/migrate-images-to-r2.mjs has moved every image, this file
// and the Cloudinary account behind it can both go.
//
// Direct REST calls via fetch, not the official `cloudinary` SDK: that
// SDK assumes a Node runtime (fs/https modules) and isn't reliably
// edge-safe on Cloudflare Workers. fetch + a hand-built signature is
// the same approach already used for everything else server-side in
// this app (see src/lib/supabase/server.ts), and needs no dependency.
//
// Configured lazily, not at module scope, for the same reason the
// Supabase admin client is: Next's build step imports every route
// module before Cloudflare's build container has env vars attached.

function getConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured (missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET).",
    );
  }
  return { cloudName, apiKey, apiSecret };
}

function sign(params: Record<string, string>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

export async function deleteImage(publicId: string): Promise<void> {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = sign({ public_id: publicId, timestamp }, apiSecret);

  const form = new FormData();
  form.append("public_id", publicId);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body: form,
  });
  const data = (await res.json()) as { result?: string };
  // "not found" is fine to ignore: the asset (or the DB row pointing
  // at it) may already be gone; every other outcome is a real failure.
  if (!res.ok || (data.result !== "ok" && data.result !== "not found")) {
    throw new Error(`Cloudinary delete failed for ${publicId}`);
  }
}
