import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

// Admin-panel pivot: Atelier Supply now reads live from the `products`
// table (written by the admin panel, src/lib/admin/products.ts), not
// from the static CSV-generated bundle. Only status='active' rows are
// ever returned here. `pricingUnit` is the product's admin-entered
// "Size" field (spec §9 describes it as "flexible text, different
// units" -- e.g. "KG", "500ml" -- there is no separate unit column).

export type ProductImage = { url: string; isPrimary: boolean };

export type SupplyMaterial = {
  id: string;
  serialNumber: number;
  slug: string;
  displayName: string;
  description: string | null;
  price: number;
  currency: string;
  pricingUnit: string;
  productTypeId: string | null;
  productTypeName: string | null;
  // Alias-only rule (spec §13a): present here only so client-side search
  // (spec §9/§10) can match against it. No component may render this
  // field on a card, PDP, meta tag, or anywhere else. Backed by the
  // product's admin-entered tags, joined into one string.
  searchAliases: string;
  available: boolean;
  primaryImageUrl: string | null;
  // Every uploaded photo, in the admin's chosen display order (not
  // just the one card/listing thumbnail) -- powers the product page's
  // image gallery.
  images: ProductImage[];
};

type ProductRow = {
  id: string;
  serial_number: number | null;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  size: string | null;
  product_type_id: string | null;
  product_types: { name: string } | { name: string }[] | null;
  product_tags: { tag: string }[] | null;
  product_images: { cloudinary_url: string; is_primary: boolean; sort_order: number }[] | null;
};

function mapRow(row: ProductRow): SupplyMaterial {
  const images = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const primary = images.find((img) => img.is_primary) ?? images[0];
  const productType = Array.isArray(row.product_types) ? row.product_types[0] : row.product_types;
  return {
    id: row.id,
    serialNumber: row.serial_number ?? 0,
    slug: row.slug,
    displayName: row.name,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    pricingUnit: row.size ?? "",
    productTypeId: row.product_type_id,
    productTypeName: productType?.name ?? null,
    searchAliases: (row.product_tags ?? []).map((t) => t.tag).join(" "),
    available: true,
    primaryImageUrl: primary?.cloudinary_url ?? null,
    images: images.map((img) => ({ url: img.cloudinary_url, isPrimary: img.is_primary })),
  };
}

const SELECT =
  "id, serial_number, slug, name, description, price, currency, size, product_type_id, product_types(name), product_tags(tag), product_images(cloudinary_url, is_primary, sort_order)";

export async function getSupplyMaterials(): Promise<SupplyMaterial[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("category", "atelier_supply")
    .eq("status", "active")
    .order("serial_number", { ascending: true, nullsFirst: false });

  if (error) throw new Error(`Failed to load supply materials: ${error.message}`);
  return (data ?? []).map((row) => mapRow(row as unknown as ProductRow));
}

export async function getSupplyMaterialBySlug(slug: string): Promise<SupplyMaterial | undefined> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("category", "atelier_supply")
    .eq("status", "active")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load supply material: ${error.message}`);
  return data ? mapRow(data as unknown as ProductRow) : undefined;
}
