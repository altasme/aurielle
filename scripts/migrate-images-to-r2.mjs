#!/usr/bin/env node
// One-time migration: moves every product photo and Website Management
// hero image off Cloudinary onto Cloudflare R2. Downloads each
// Cloudinary asset, resizes it with sharp into the same fixed variants
// the app now serves (see src/lib/product-image-url.ts /
// src/lib/image-resize-client.ts), uploads the result to R2 via its
// S3-compatible API, and updates the DB row to point at it. Run this
// AFTER supabase/migrations/0020_r2_images.sql and AFTER creating the
// R2 bucket + a custom domain for it.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//   R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... \
//   R2_BUCKET_NAME=... R2_PUBLIC_BASE_URL=... \
//   node scripts/migrate-images-to-r2.mjs [outDir]
//
// Writes a manifest.json to outDir (default ./image-backup/<timestamp>/)
// recording every row's old Cloudinary URL and new R2 key, in case a
// row ever needs tracing back by hand -- the Cloudinary assets
// themselves are left alone; only the DB's cloudinary_* columns are
// cleared, signalling that row is now served from R2.

import { createClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const env = process.env;
const required = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_BASE_URL",
];
const missing = required.filter((key) => !env[key]);
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const outDir = process.argv[2] ?? path.join("image-backup", `r2-migration-${new Date().toISOString().replace(/[:.]/g, "-")}`);
mkdirSync(outDir, { recursive: true });

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
});

async function uploadToR2(key, buffer) {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: "image/webp",
    }),
  );
}

async function fetchImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function resizeToWebp(buffer, maxDimension, quality = 85) {
  return sharp(buffer)
    .resize(maxDimension, maxDimension, { fit: "inside", withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
}

const manifest = [];
let migrated = 0;
let failed = 0;

console.log("Migrating product images...");
const { data: images, error: imagesError } = await supabase
  .from("product_images")
  .select("id, cloudinary_url, r2_key")
  .is("r2_key", null)
  .not("cloudinary_url", "is", null);
if (imagesError) throw imagesError;

for (const image of images ?? []) {
  try {
    const original = await fetchImage(image.cloudinary_url);
    const [full, thumb] = await Promise.all([resizeToWebp(original, 1200), resizeToWebp(original, 500)]);
    const r2Key = `products/migrated/${image.id}`;
    await Promise.all([uploadToR2(`${r2Key}/full.webp`, full), uploadToR2(`${r2Key}/thumb.webp`, thumb)]);

    const { error } = await supabase
      .from("product_images")
      .update({ r2_key: r2Key, cloudinary_public_id: null, cloudinary_url: null })
      .eq("id", image.id);
    if (error) throw error;

    manifest.push({ table: "product_images", id: image.id, oldUrl: image.cloudinary_url, r2Key, ok: true });
    migrated++;
  } catch (err) {
    manifest.push({ table: "product_images", id: image.id, oldUrl: image.cloudinary_url, ok: false, error: String(err) });
    failed++;
    console.error(`  FAILED product_images ${image.id}: ${err}`);
  }
}

console.log("Migrating site content hero images...");
const { data: slots, error: slotsError } = await supabase
  .from("site_image_slots")
  .select("id, page, slot_key, image_url, cloudinary_public_id")
  .not("cloudinary_public_id", "is", null);
if (slotsError) throw slotsError;

for (const slot of slots ?? []) {
  try {
    const original = await fetchImage(slot.image_url);
    const hero = await resizeToWebp(original, 1920);
    const r2Key = `site-content/${slot.page}/${slot.slot_key}.webp`;
    await uploadToR2(r2Key, hero);
    const newUrl = `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${r2Key}`;

    const { error } = await supabase
      .from("site_image_slots")
      .update({ image_url: newUrl, cloudinary_public_id: null })
      .eq("id", slot.id);
    if (error) throw error;

    manifest.push({ table: "site_image_slots", id: slot.id, oldUrl: slot.image_url, r2Key, ok: true });
    migrated++;
  } catch (err) {
    manifest.push({ table: "site_image_slots", id: slot.id, oldUrl: slot.image_url, ok: false, error: String(err) });
    failed++;
    console.error(`  FAILED site_image_slots ${slot.id}: ${err}`);
  }
}

writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\nDone: ${migrated} migrated, ${failed} failed. Manifest: ${outDir}/manifest.json`);
if (failed > 0) process.exitCode = 1;
