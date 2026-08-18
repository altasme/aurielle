import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { Mood } from "@/lib/data/moods";

// Admin-panel pivot: the Aurielle Collection catalogue now reads live
// from the `products` table (written by the admin panel, src/lib/admin/
// products.ts), not from the static CSV-generated bundle. Only
// status='active' rows are ever returned here, matching the public RLS
// policy on this table (defense-in-depth even though this client is
// server-role and bypasses RLS). Pages using this data opt into ISR
// (see `revalidate` exports on the collection routes) and are refreshed
// on demand via revalidatePath() whenever the admin saves a change.

export type Perfume = {
  slug: string;
  name: string;
  description: string | null;
  scentProfile: string[];
  size: string | null;
  price: number | null;
  currency: string | null;
  mood: Mood | null;
  perfumeType: string | null;
  available: boolean;
  primaryImageUrl: string | null;
};

type ProductRow = {
  slug: string;
  name: string;
  description: string | null;
  size: string | null;
  price: number;
  currency: string;
  mood: string | null;
  perfume_type: string | null;
  product_tags: { tag: string }[] | null;
  product_images: { cloudinary_url: string; is_primary: boolean }[] | null;
};

function mapRow(row: ProductRow): Perfume {
  const images = row.product_images ?? [];
  const primary = images.find((img) => img.is_primary) ?? images[0];
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    scentProfile: (row.product_tags ?? []).map((t) => t.tag),
    size: row.size,
    price: Number(row.price),
    currency: row.currency,
    mood: (row.mood as Mood | null) ?? null,
    perfumeType: row.perfume_type,
    available: true,
    primaryImageUrl: primary?.cloudinary_url ?? null,
  };
}

const SELECT =
  "slug, name, description, size, price, currency, mood, perfume_type, product_tags(tag), product_images(cloudinary_url, is_primary)";

export async function getPerfumes(): Promise<Perfume[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("category", "aurielle_collection")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load perfumes: ${error.message}`);
  return (data ?? []).map((row) => mapRow(row as unknown as ProductRow));
}

export async function getFeaturedPerfumes(limit = 4): Promise<Perfume[]> {
  const perfumes = await getPerfumes();
  return perfumes.slice(0, limit);
}

export async function getPerfumeBySlug(slug: string): Promise<Perfume | undefined> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("category", "aurielle_collection")
    .eq("status", "active")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load perfume: ${error.message}`);
  return data ? mapRow(data as unknown as ProductRow) : undefined;
}
