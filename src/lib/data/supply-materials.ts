import seedData from "./supply-materials.json";

export type SupplyMaterial = {
  serialNumber: number;
  slug: string;
  displayName: string;
  price: number;
  currency: string;
  pricingUnit: string;
  needsReview: boolean;
  available: boolean;
};

// Local seed fallback until the Supabase project is provisioned.
// Swap the body of these functions for real `supabase.from('supply_materials')`
// queries once NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are set —
// the call sites below don't need to change.
const ALL_MATERIALS = seedData as SupplyMaterial[];

export async function getSupplyMaterials(): Promise<SupplyMaterial[]> {
  return ALL_MATERIALS.filter((m) => m.available);
}

export async function getSupplyMaterialBySlug(
  slug: string,
): Promise<SupplyMaterial | undefined> {
  return ALL_MATERIALS.find((m) => m.slug === slug && m.available);
}

export async function searchSupplyMaterials(
  query: string,
): Promise<SupplyMaterial[]> {
  const q = query.trim().toLowerCase();
  if (!q) return getSupplyMaterials();
  // NOTE: once backed by Postgres, this should also match against the
  // non-rendered `search_aliases` column (spec §10) via the
  // `supply_materials_search_idx` tsvector index — never select or
  // return that column's contents to the client.
  return ALL_MATERIALS.filter(
    (m) => m.available && m.displayName.toLowerCase().includes(q),
  );
}
