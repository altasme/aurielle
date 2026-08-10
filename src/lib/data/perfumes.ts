import seedData from "./perfumes.json";

export type Perfume = {
  slug: string;
  name: string;
  scentProfile: string[];
  available: boolean;
};

// Placeholder catalogue using names from the client's marketing material.
// Price / size / description are intentionally omitted — see
// docs/spec/AURIELLE_SPEC_v3.md §2: "final product names, prices, sizes
// and descriptions must come from the client." Swap for a Supabase query
// once real product data is confirmed.
const ALL_PERFUMES = seedData as Perfume[];

export async function getPerfumes(): Promise<Perfume[]> {
  return ALL_PERFUMES;
}

export async function getFeaturedPerfumes(limit = 4): Promise<Perfume[]> {
  return ALL_PERFUMES.slice(0, limit);
}

export async function getPerfumeBySlug(
  slug: string,
): Promise<Perfume | undefined> {
  return ALL_PERFUMES.find((p) => p.slug === slug);
}
