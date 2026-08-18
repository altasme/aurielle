import "server-only";
import { createHash } from "node:crypto";

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

export type CloudinaryUploadResult = { publicId: string; url: string };

export async function uploadImage(
  file: Blob,
  folder: string,
): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const paramsToSign = { folder, timestamp };
  const signature = sign(paramsToSign, apiSecret);

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const data = (await res.json()) as { public_id?: string; secure_url?: string; error?: { message: string } };
  if (!res.ok || !data.public_id || !data.secure_url) {
    throw new Error(data.error?.message ?? "Cloudinary upload failed");
  }
  return { publicId: data.public_id, url: data.secure_url };
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
