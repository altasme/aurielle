import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import type { Mood } from "@/lib/data/moods";

export type ProductCategory = "aurielle_collection" | "atelier_supply";
export type ProductStatus = "active" | "draft";

export type ProductImage = {
  id: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  isPrimary: boolean;
  sortOrder: number;
};

export type ProductListItem = {
  id: string;
  category: ProductCategory;
  name: string;
  price: number;
  currency: string;
  size: string | null;
  status: ProductStatus;
  perfumeType: string | null;
  productTypeName: string | null;
  primaryImageUrl: string | null;
};

export type ProductDetail = {
  id: string;
  category: ProductCategory;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  size: string | null;
  status: ProductStatus;
  perfumeType: string | null;
  mood: Mood | null;
  productTypeId: string | null;
  serialNumber: number | null;
  tags: string[];
  images: ProductImage[];
};

export type ProductType = { id: string; name: string; isSystem: boolean };

function mapImage(row: {
  id: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  is_primary: boolean;
  sort_order: number;
}): ProductImage {
  return {
    id: row.id,
    cloudinaryPublicId: row.cloudinary_public_id,
    cloudinaryUrl: row.cloudinary_url,
    isPrimary: row.is_primary,
    sortOrder: row.sort_order,
  };
}

export async function listProducts(params: {
  category: ProductCategory;
  search?: string;
}): Promise<ProductListItem[]> {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("products")
    .select(
      "id, category, name, price, currency, size, status, perfume_type, product_types(name), product_images(cloudinary_url, is_primary)",
    )
    .eq("category", params.category)
    .order("created_at", { ascending: false });

  if (params.search?.trim()) {
    query = query.ilike("name", `%${params.search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list products: ${error.message}`);

  return (data ?? []).map((row) => {
    const images = (row.product_images ?? []) as { cloudinary_url: string; is_primary: boolean }[];
    const primary = images.find((img) => img.is_primary) ?? images[0];
    const productType = row.product_types as unknown as { name: string } | null;
    return {
      id: row.id,
      category: row.category,
      name: row.name,
      price: Number(row.price),
      currency: row.currency,
      size: row.size,
      status: row.status,
      perfumeType: row.perfume_type,
      productTypeName: productType?.name ?? null,
      primaryImageUrl: primary?.cloudinary_url ?? null,
    };
  });
}

export async function getProduct(id: string): Promise<ProductDetail | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, category, slug, name, description, price, currency, size, status, perfume_type, mood, product_type_id, serial_number, product_tags(tag), product_images(id, cloudinary_public_id, cloudinary_url, is_primary, sort_order)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load product: ${error.message}`);
  if (!data) return null;

  const tags = ((data.product_tags ?? []) as { tag: string }[]).map((t) => t.tag);
  const images = ((data.product_images ?? []) as Parameters<typeof mapImage>[0][])
    .map(mapImage)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: data.id,
    category: data.category,
    slug: data.slug,
    name: data.name,
    description: data.description,
    price: Number(data.price),
    currency: data.currency,
    size: data.size,
    status: data.status,
    perfumeType: data.perfume_type,
    mood: data.mood,
    productTypeId: data.product_type_id,
    serialNumber: data.serial_number,
    tags,
    images,
  };
}

async function uniqueSlug(name: string): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const base = slugify(name) || "product";
  let candidate = base;
  let suffix = 2;
  for (;;) {
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export type ProductInput = {
  category: ProductCategory;
  name: string;
  description: string;
  price: number;
  currency: string;
  size: string;
  status: ProductStatus;
  tags: string[];
  // Aurielle Collection
  perfumeType?: "Perfume Oil" | "Waterbased";
  mood?: Mood;
  // Atelier Supply
  productTypeId?: string;
};

async function nextSerialNumber(): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("products")
    .select("serial_number")
    .eq("category", "atelier_supply")
    .order("serial_number", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  return (data?.serial_number ?? 0) + 1;
}

export async function createProduct(input: ProductInput): Promise<{ id: string }> {
  const supabase = getSupabaseAdminClient();
  const slug = await uniqueSlug(input.name);
  const serialNumber = input.category === "atelier_supply" ? await nextSerialNumber() : null;

  const { data, error } = await supabase
    .from("products")
    .insert({
      category: input.category,
      slug,
      name: input.name,
      description: input.description || null,
      price: input.price,
      currency: input.currency,
      size: input.size || null,
      status: input.status,
      perfume_type: input.category === "aurielle_collection" ? (input.perfumeType ?? null) : null,
      mood: input.category === "aurielle_collection" ? (input.mood ?? null) : null,
      product_type_id: input.category === "atelier_supply" ? (input.productTypeId ?? null) : null,
      serial_number: serialNumber,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(`Failed to create product: ${error?.message}`);

  await syncTags(data.id, input.tags);
  return { id: data.id };
}

export async function updateProduct(id: string, input: ProductInput): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: input.name,
      description: input.description || null,
      price: input.price,
      currency: input.currency,
      size: input.size || null,
      status: input.status,
      perfume_type: input.category === "aurielle_collection" ? (input.perfumeType ?? null) : null,
      mood: input.category === "aurielle_collection" ? (input.mood ?? null) : null,
      product_type_id: input.category === "atelier_supply" ? (input.productTypeId ?? null) : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(`Failed to update product: ${error.message}`);
  await syncTags(id, input.tags);
}

async function syncTags(productId: string, tags: string[]): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const unique = [...new Set(tags.map((t) => t.trim()).filter(Boolean))];

  const { error: deleteError } = await supabase.from("product_tags").delete().eq("product_id", productId);
  if (deleteError) throw new Error(`Failed to update tags: ${deleteError.message}`);

  if (unique.length === 0) return;
  const { error: insertError } = await supabase
    .from("product_tags")
    .insert(unique.map((tag) => ({ product_id: productId, tag })));
  if (insertError) throw new Error(`Failed to update tags: ${insertError.message}`);
}

// Deletes the product row and returns its images so the caller can
// remove the matching Cloudinary assets too (spec §15: "the system
// should also handle the associated Cloudinary assets/references").
export async function deleteProduct(id: string): Promise<{ images: ProductImage[] }> {
  const supabase = getSupabaseAdminClient();
  const { data: images } = await supabase
    .from("product_images")
    .select("id, cloudinary_public_id, cloudinary_url, is_primary, sort_order")
    .eq("product_id", id);

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete product: ${error.message}`);

  return { images: (images ?? []).map(mapImage) };
}

export async function listProductTypes(category: "atelier_supply"): Promise<ProductType[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("product_types")
    .select("id, name, is_system")
    .eq("category", category)
    .order("name");

  if (error) throw new Error(`Failed to list product types: ${error.message}`);
  return (data ?? []).map((row) => ({ id: row.id, name: row.name, isSystem: row.is_system }));
}

export async function createProductType(
  category: "atelier_supply",
  name: string,
): Promise<ProductType> {
  const supabase = getSupabaseAdminClient();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Product type name is required");

  const { data, error } = await supabase
    .from("product_types")
    .insert({ category, name: trimmed, is_system: false })
    .select("id, name, is_system")
    .single();

  if (error || !data) throw new Error(`Failed to create product type: ${error?.message}`);
  return { id: data.id, name: data.name, isSystem: data.is_system };
}
