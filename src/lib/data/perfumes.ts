import { perfumes as generatedPerfumes } from "@/data/perfumes.generated";

// Static catalogue (spec v4 §5): reads never touch Supabase. Data comes
// only from src/data/perfumes.generated.ts, produced at build time by
// scripts/generate-catalogue.mjs from data/perfumes.csv.

export type Perfume = {
  slug: string;
  name: string;
  description: string | null;
  scentProfile: string[];
  size: string | null;
  price: number | null;
  currency: string | null;
  available: boolean;
};

export function getPerfumes(): Perfume[] {
  return generatedPerfumes;
}

export function getFeaturedPerfumes(limit = 4): Perfume[] {
  return generatedPerfumes.slice(0, limit);
}

export function getPerfumeBySlug(slug: string): Perfume | undefined {
  return generatedPerfumes.find((p) => p.slug === slug);
}
