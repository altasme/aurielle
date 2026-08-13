#!/usr/bin/env node
// Build-time catalogue generator (spec §22). Reads the client-approved
// CSVs in data/ and emits typed, bundled TS modules under src/data/.
// Runs as an npm `prebuild` step so a bad/missing CSV fails the build
// loudly and locally, never mid-deploy.
//
// No network access, no Supabase client: this script only touches the
// filesystem. Read paths in the app import the generated output, never
// this script or the CSVs directly.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parse } from "csv-parse/sync";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataDir = path.join(rootDir, "data");
const outDir = path.join(rootDir, "src", "data");

function fail(message) {
  console.error(`\n✖ generate-catalogue: ${message}\n`);
  process.exit(1);
}

function readCsv(filename) {
  const filePath = path.join(dataDir, filename);
  let raw;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    fail(`missing ${path.relative(rootDir, filePath)}: this is the approved source CSV and must exist.`);
  }
  try {
    return parse(raw, { columns: true, skip_empty_lines: true, trim: true });
  } catch (err) {
    fail(`could not parse ${filename}: ${err.message}`);
  }
}

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSlug(base, seen) {
  let slug = base || "item";
  while (seen.has(slug)) slug += "-x";
  seen.add(slug);
  return slug;
}

// ---- Atelier Supply -------------------------------------------------

const supplyRows = readCsv("atelier-supply.csv");
const supplySlugs = new Set();

const supplyMaterials = supplyRows.map((row, i) => {
  const serialNumber = Number(row.serial_number);
  const price = Number(row.price);
  if (!row.name) fail(`atelier-supply.csv row ${i + 2}: missing name`);
  if (!Number.isFinite(serialNumber)) fail(`atelier-supply.csv row ${i + 2}: bad serial_number`);
  if (!Number.isFinite(price)) fail(`atelier-supply.csv row ${i + 2}: bad price`);

  // search_aliases is bundled for search matching only; the app must
  // never render it (spec §13a). It still ends up in the client JS
  // bundle for this static-catalogue phase, since search runs
  // client-side over the bundled dataset (spec §9). That's a deliberate
  // Phase 1 tradeoff (a few hundred rows, not sensitive/secret data;
  // aliases are just other-brand product names), not an oversight.
  return {
    serialNumber,
    slug: uniqueSlug(`${slugify(row.name)}-${String(serialNumber).padStart(3, "0")}`, supplySlugs),
    displayName: row.name,
    price,
    currency: row.currency || "USD",
    pricingUnit: row.unit || "KG",
    searchAliases: row.search_aliases || "",
    available: true,
  };
});

const dupSerials = new Set();
for (const m of supplyMaterials) {
  if (dupSerials.has(m.serialNumber)) fail(`duplicate serial_number ${m.serialNumber} in atelier-supply.csv`);
  dupSerials.add(m.serialNumber);
}

// ---- Aurielle Collection ---------------------------------------------

const perfumeRows = readCsv("perfumes.csv");
const perfumeSlugs = new Set();

const perfumes = perfumeRows.map((row, i) => {
  if (!row.name) fail(`perfumes.csv row ${i + 2}: missing name`);
  const scentProfile = (row.scent_profile || "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  const price = row.price ? Number(row.price) : null;
  if (row.price && !Number.isFinite(price)) fail(`perfumes.csv row ${i + 2}: bad price`);

  return {
    slug: uniqueSlug(slugify(row.name), perfumeSlugs),
    name: row.name,
    description: row.description || null,
    scentProfile,
    size: row.size || null,
    price,
    currency: row.currency || null,
    available: true,
  };
});

// ---- Write output -----------------------------------------------------

mkdirSync(outDir, { recursive: true });

const banner = `// GENERATED FILE: do not edit by hand.
// Produced by scripts/generate-catalogue.mjs from data/*.csv.
// Run \`npm run generate:catalogue\` (or \`npm run build\`, which runs it
// automatically as a prebuild step) to regenerate.
`;

writeFileSync(
  path.join(outDir, "supply-materials.generated.ts"),
  `${banner}
export type SupplyMaterialRecord = {
  serialNumber: number;
  slug: string;
  displayName: string;
  price: number;
  currency: string;
  pricingUnit: string;
  searchAliases: string;
  available: boolean;
};

export const supplyMaterials: SupplyMaterialRecord[] = ${JSON.stringify(supplyMaterials, null, 2)};
`,
);

writeFileSync(
  path.join(outDir, "perfumes.generated.ts"),
  `${banner}
export type PerfumeRecord = {
  slug: string;
  name: string;
  description: string | null;
  scentProfile: string[];
  size: string | null;
  price: number | null;
  currency: string | null;
  available: boolean;
};

export const perfumes: PerfumeRecord[] = ${JSON.stringify(perfumes, null, 2)};
`,
);

console.log(
  `✓ generate-catalogue: ${supplyMaterials.length} supply materials, ${perfumes.length} perfumes`,
);
