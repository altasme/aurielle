#!/usr/bin/env node
// Downloads every image currently referenced in the database (product
// photos + Website Management hero/banner slots) into a local folder,
// as a point-in-time backup independent of Cloudinary. Read-only --
// never writes to the database or touches Cloudinary's account, just
// follows the public delivery URLs already stored in Postgres.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backup-images.mjs [outDir]
//
// Defaults outDir to ./image-backup/<timestamp>/.

import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) {
  console.error("Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backup-images.mjs [outDir]");
  process.exit(1);
}

const outDir = process.argv[2] ?? path.join("image-backup", new Date().toISOString().replace(/[:.]/g, "-"));
const productsDir = path.join(outDir, "products");
const siteDir = path.join(outDir, "site-content");
mkdirSync(productsDir, { recursive: true });
mkdirSync(siteDir, { recursive: true });

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

function extensionOf(imageUrl) {
  const match = imageUrl.match(/\.([a-zA-Z0-9]+)(?:$|\?)/);
  return match ? match[1] : "jpg";
}

function safeName(value) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function download(imageUrl, destPath) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(destPath, buffer);
  return buffer.length;
}

let ok = 0;
let failed = 0;
const manifest = [];

console.log("Fetching product images...");
const { data: products, error: productsError } = await supabase
  .from("products")
  .select("slug, category, product_images(cloudinary_url, is_primary, sort_order)");
if (productsError) throw productsError;

for (const product of products ?? []) {
  const images = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  for (const [i, img] of images.entries()) {
    const ext = extensionOf(img.cloudinary_url);
    const filename = `${safeName(product.category)}__${safeName(product.slug)}__${i + 1}${img.is_primary ? "-primary" : ""}.${ext}`;
    const dest = path.join(productsDir, filename);
    try {
      const bytes = await download(img.cloudinary_url, dest);
      manifest.push({ source: img.cloudinary_url, saved: path.relative(outDir, dest), bytes, ok: true });
      ok++;
    } catch (err) {
      manifest.push({ source: img.cloudinary_url, saved: null, ok: false, error: String(err) });
      failed++;
      console.error(`  FAILED ${product.slug} image ${i + 1}: ${err}`);
    }
  }
}

console.log("Fetching site content images...");
const { data: siteImages, error: siteError } = await supabase
  .from("site_image_slots")
  .select("page, slot_key, image_url");
if (siteError) throw siteError;

for (const slot of siteImages ?? []) {
  const ext = extensionOf(slot.image_url);
  const filename = `${safeName(slot.page)}__${safeName(slot.slot_key)}.${ext}`;
  const dest = path.join(siteDir, filename);
  try {
    const bytes = await download(slot.image_url, dest);
    manifest.push({ source: slot.image_url, saved: path.relative(outDir, dest), bytes, ok: true });
    ok++;
  } catch (err) {
    manifest.push({ source: slot.image_url, saved: null, ok: false, error: String(err) });
    failed++;
    console.error(`  FAILED ${slot.page}/${slot.slot_key}: ${err}`);
  }
}

writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\nDone: ${ok} downloaded, ${failed} failed. Output: ${outDir}`);
if (failed > 0) process.exitCode = 1;
