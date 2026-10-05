import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { productFullUrl, productThumbUrl, type StoredProductImage } from "@/lib/product-image-url";

// Admin-panel pivot: Atelier Supply now reads live from the `products`
// table (written by the admin panel, src/lib/admin/products.ts), not
// from the static CSV-generated bundle. Only status='active' rows are
// ever returned here. `pricingUnit` is the product's admin-entered
// "Size" field (spec §9 describes it as "flexible text, different
// units" -- e.g. "KG", "500ml" -- there is no separate unit column).

export type ProductImage = { fullUrl: string | null; thumbUrl: string | null; isPrimary: boolean };

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

// The Atelier Supply browse page only ever renders a card
// (slug/name/type/price/photo) and searches by name/aliases -- with up
// to a few hundred materials, fetching and shipping every one's full
// description and photo gallery to the client for that would be pure
// waste. Only the single-material detail page (getSupplyMaterialBySlug)
// needs the full SupplyMaterial shape.
export type SupplyMaterialCard = {
  slug: string;
  serialNumber: number;
  displayName: string;
  price: number;
  currency: string;
  pricingUnit: string;
  productTypeName: string | null;
  searchAliases: string;
  primaryImageUrl: string | null;
};

type StoredImageRow = { r2_key: string | null; cloudinary_url: string | null; is_primary: boolean; sort_order: number };

function toStoredImage(row: StoredImageRow): StoredProductImage {
  return { r2Key: row.r2_key, cloudinaryUrl: row.cloudinary_url };
}

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
  product_images: StoredImageRow[] | null;
};

type CardRow = {
  serial_number: number | null;
  slug: string;
  name: string;
  price: number;
  currency: string;
  size: string | null;
  product_types: { name: string } | { name: string }[] | null;
  product_tags: { tag: string }[] | null;
  product_images: StoredImageRow[] | null;
};

function productTypeNameOf(product_types: { name: string } | { name: string }[] | null): string | null {
  const productType = Array.isArray(product_types) ? product_types[0] : product_types;
  return productType?.name ?? null;
}

function primaryImageOf(images: StoredImageRow[]): string | null {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const primary = sorted.find((img) => img.is_primary) ?? sorted[0];
  return primary ? productThumbUrl(toStoredImage(primary)) : null;
}

function mapRow(row: ProductRow): SupplyMaterial {
  const images = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const primary = images.find((img) => img.is_primary) ?? images[0];
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
    productTypeName: productTypeNameOf(row.product_types),
    searchAliases: (row.product_tags ?? []).map((t) => t.tag).join(" "),
    available: true,
    primaryImageUrl: primary ? productThumbUrl(toStoredImage(primary)) : null,
    images: images.map((img) => ({
      fullUrl: productFullUrl(toStoredImage(img)),
      thumbUrl: productThumbUrl(toStoredImage(img)),
      isPrimary: img.is_primary,
    })),
  };
}

function mapCardRow(row: CardRow): SupplyMaterialCard {
  return {
    slug: row.slug,
    serialNumber: row.serial_number ?? 0,
    displayName: row.name,
    price: Number(row.price),
    currency: row.currency,
    pricingUnit: row.size ?? "",
    productTypeName: productTypeNameOf(row.product_types),
    searchAliases: (row.product_tags ?? []).map((t) => t.tag).join(" "),
    primaryImageUrl: primaryImageOf(row.product_images ?? []),
  };
}

const SELECT =
  "id, serial_number, slug, name, description, price, currency, size, product_type_id, product_types(name), product_tags(tag), product_images(r2_key, cloudinary_url, is_primary, sort_order)";

const CARD_SELECT =
  "serial_number, slug, name, price, currency, size, product_types(name), product_tags(tag), product_images(r2_key, cloudinary_url, is_primary, sort_order)";

export async function getSupplyMaterials(): Promise<SupplyMaterialCard[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(CARD_SELECT)
    .eq("category", "atelier_supply")
    .eq("status", "active")
    .order("serial_number", { ascending: true, nullsFirst: false });

  if (error) throw new Error(`Failed to load supply materials: ${error.message}`);
  return (data ?? []).map((row) => mapCardRow(row as unknown as CardRow));
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
