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
  mood: string | null;
  available: boolean;
};

// Fixed display order for the mood-based discovery section (spec ask:
// "Find Your Scent"). Moods are editorial groupings, not a formal
// fragrance-family classification, since that hasn't been confirmed
// by the client yet.
export const MOODS = ["Feminine", "Mysterious", "Elegant", "Warm", "Alluring"] as const;
export type Mood = (typeof MOODS)[number];

export function getPerfumes(): Perfume[] {
  return generatedPerfumes;
}

export function getFeaturedPerfumes(limit = 4): Perfume[] {
  return generatedPerfumes.slice(0, limit);
}

export function getPerfumeBySlug(slug: string): Perfume | undefined {
  return generatedPerfumes.find((p) => p.slug === slug);
}
