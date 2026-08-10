import { supabase } from "@/lib/supabase/client";

export type Perfume = {
  slug: string;
  name: string;
  scentProfile: string[];
  available: boolean;
};

type PerfumeRow = {
  slug: string;
  name: string;
  scent_profile: string[] | null;
  available: boolean;
};

const PUBLIC_COLUMNS = "slug, name, scent_profile, available";

function toPerfume(row: PerfumeRow): Perfume {
  return {
    slug: row.slug,
    name: row.name,
    scentProfile: row.scent_profile ?? [],
    available: row.available,
  };
}

export async function getPerfumes(): Promise<Perfume[]> {
  const { data, error } = await supabase
    .from("perfumes")
    .select(PUBLIC_COLUMNS)
    .order("name");
  if (error) throw error;
  return (data ?? []).map(toPerfume);
}

export async function getFeaturedPerfumes(limit = 4): Promise<Perfume[]> {
  const { data, error } = await supabase
    .from("perfumes")
    .select(PUBLIC_COLUMNS)
    .eq("featured", true)
    .order("name")
    .limit(limit);
  if (error) throw error;
  if (data && data.length > 0) return data.map(toPerfume);

  // Nothing marked featured yet in the admin CMS — fall back to the
  // first `limit` perfumes so the homepage preview isn't empty.
  const all = await getPerfumes();
  return all.slice(0, limit);
}

export async function getPerfumeBySlug(
  slug: string,
): Promise<Perfume | undefined> {
  const { data, error } = await supabase
    .from("perfumes")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? toPerfume(data) : undefined;
}
