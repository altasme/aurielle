import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { Mood } from "@/lib/data/moods";
import { cloudinaryCardUrl } from "@/lib/cloudinary-url";

// Admin-panel pivot: the Aurielle Collection catalogue now reads live
// from the `products` table (written by the admin panel, src/lib/admin/
// products.ts), not from the static CSV-generated bundle. Only
// status='active' rows are ever returned here, matching the public RLS
// policy on this table (defense-in-depth even though this client is
// server-role and bypasses RLS). Pages using this data opt into ISR
// (see `revalidate` exports on the collection routes) and are refreshed
// on demand via revalidatePath() whenever the admin saves a change.

export type ProductImage = { url: string; isPrimary: boolean };

export type Perfume = {
  id: string;
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
  // Every uploaded photo, in the admin's chosen display order (not
  // just the one card/listing thumbnail) -- powers the product page's
  // image gallery.
  images: ProductImage[];
};

// The Collection browse page and the homepage's featured grid only
// ever render a card (slug/name/scent tags/price/photo) and filter by
// mood -- fetching and shipping every perfume's description and full
// photo gallery to the client for that would be pure waste. Only the
// single-perfume detail page (getPerfumeBySlug) needs the full Perfume
// shape.
export type PerfumeCard = {
  slug: string;
  name: string;
  scentProfile: string[];
  price: number | null;
  currency: string | null;
  mood: Mood | null;
  primaryImageUrl: string | null;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  size: string | null;
  price: number;
  currency: string;
  mood: string | null;
  perfume_type: string | null;
  product_tags: { tag: string }[] | null;
  product_images: { cloudinary_url: string; is_primary: boolean; sort_order: number }[] | null;
};

type CardRow = {
  slug: string;
  name: string;
  price: number;
  currency: string;
  mood: string | null;
  product_tags: { tag: string }[] | null;
  product_images: { cloudinary_url: string; is_primary: boolean; sort_order: number }[] | null;
};

function primaryImageOf(images: { cloudinary_url: string; is_primary: boolean; sort_order: number }[]): string | null {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const primary = sorted.find((img) => img.is_primary) ?? sorted[0];
  return primary ? cloudinaryCardUrl(primary.cloudinary_url) : null;
}

function mapRow(row: ProductRow): Perfume {
  const images = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const primary = images.find((img) => img.is_primary) ?? images[0];
  return {
    id: row.id,
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
    images: images.map((img) => ({ url: img.cloudinary_url, isPrimary: img.is_primary })),
  };
}

function mapCardRow(row: CardRow): PerfumeCard {
  return {
    slug: row.slug,
    name: row.name,
    scentProfile: (row.product_tags ?? []).map((t) => t.tag),
    price: Number(row.price),
    currency: row.currency,
    mood: (row.mood as Mood | null) ?? null,
    primaryImageUrl: primaryImageOf(row.product_images ?? []),
  };
}

const SELECT =
  "id, slug, name, description, size, price, currency, mood, perfume_type, product_tags(tag), product_images(cloudinary_url, is_primary, sort_order)";

const CARD_SELECT =
  "slug, name, price, currency, mood, product_tags(tag), product_images(cloudinary_url, is_primary, sort_order)";

export async function getPerfumes(): Promise<PerfumeCard[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(CARD_SELECT)
    .eq("category", "aurielle_collection")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load perfumes: ${error.message}`);
  return (data ?? []).map((row) => mapCardRow(row as unknown as CardRow));
}

export async function getFeaturedPerfumes(limit = 4): Promise<PerfumeCard[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(CARD_SELECT)
    .eq("category", "aurielle_collection")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load featured perfumes: ${error.message}`);
  return (data ?? []).map((row) => mapCardRow(row as unknown as CardRow));
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
