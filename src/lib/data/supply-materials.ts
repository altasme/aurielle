import { supplyMaterials as generatedMaterials } from "@/data/supply-materials.generated";

// Static catalogue (spec v4 §5): reads never touch Supabase. Data comes
// only from src/data/supply-materials.generated.ts, produced at build
// time by scripts/generate-catalogue.mjs from data/atelier-supply.csv.

export type SupplyMaterial = {
  serialNumber: number;
  slug: string;
  displayName: string;
  price: number;
  currency: string;
  pricingUnit: string;
  // Alias-only rule (spec §13a): present here only so client-side search
  // (spec §9/§10) can match against it. No component may render this
  // field on a card, PDP, meta tag, or anywhere else.
  searchAliases: string;
  available: boolean;
};

export function getSupplyMaterials(): SupplyMaterial[] {
  return generatedMaterials;
}

export function getSupplyMaterialBySlug(slug: string): SupplyMaterial | undefined {
  return generatedMaterials.find((m) => m.slug === slug);
}

export function matchesSupplyQuery(material: SupplyMaterial, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    material.displayName.toLowerCase().includes(q) ||
    material.searchAliases.toLowerCase().includes(q)
  );
}
