import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export type PromotionCategory = "aurielle_collection" | "atelier_supply";
export type DiscountType = "fixed" | "percent";

export type PromotionListItem = {
  id: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  maxUses: number | null;
  usedCount: number;
  minSpend: number | null;
  enabled: boolean;
  productCount: number;
  productTypeCount: number;
};

export type PromotionDetail = {
  id: string;
  category: PromotionCategory;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  maxUses: number | null;
  usedCount: number;
  minSpend: number | null;
  internalNotes: string | null;
  enabled: boolean;
  productIds: string[];
  productTypeIds: string[];
};

export type PromotionInput = {
  category: PromotionCategory;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  maxUses: number | null;
  minSpend: number | null;
  internalNotes: string | null;
  enabled: boolean;
  productIds: string[];
  // Only meaningful for atelier_supply -- ignored (stored empty) for
  // aurielle_collection, since its products have no product_type_id.
  productTypeIds: string[];
};

export async function listPromotions(category: PromotionCategory): Promise<PromotionListItem[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("promotions")
    .select(
      "id, name, discount_type, discount_value, starts_at, ends_at, max_uses, used_count, min_spend, enabled, promotion_products(count), promotion_product_types(count)",
    )
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list promotions: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    maxUses: row.max_uses,
    usedCount: row.used_count,
    minSpend: row.min_spend === null ? null : Number(row.min_spend),
    enabled: row.enabled,
    productCount: (row.promotion_products as unknown as { count: number }[])[0]?.count ?? 0,
    productTypeCount: (row.promotion_product_types as unknown as { count: number }[])[0]?.count ?? 0,
  }));
}

export async function getPromotion(id: string): Promise<PromotionDetail | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("promotions")
    .select(
      "id, category, name, discount_type, discount_value, starts_at, ends_at, max_uses, used_count, min_spend, internal_notes, enabled, promotion_products(product_id), promotion_product_types(product_type_id)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load promotion: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    category: data.category,
    name: data.name,
    discountType: data.discount_type,
    discountValue: Number(data.discount_value),
    startsAt: data.starts_at,
    endsAt: data.ends_at,
    maxUses: data.max_uses,
    usedCount: data.used_count,
    minSpend: data.min_spend === null ? null : Number(data.min_spend),
    internalNotes: data.internal_notes,
    enabled: data.enabled,
    productIds: (data.promotion_products as unknown as { product_id: string }[]).map((r) => r.product_id),
    productTypeIds: (data.promotion_product_types as unknown as { product_type_id: string }[]).map(
      (r) => r.product_type_id,
    ),
  };
}

async function syncPromotionProducts(promotionId: string, productIds: string[]): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const unique = [...new Set(productIds)];

  const { error: deleteError } = await supabase
    .from("promotion_products")
    .delete()
    .eq("promotion_id", promotionId);
  if (deleteError) throw new Error(`Failed to update promotion items: ${deleteError.message}`);

  if (unique.length === 0) return;
  const { error: insertError } = await supabase
    .from("promotion_products")
    .insert(unique.map((productId) => ({ promotion_id: promotionId, product_id: productId })));
  if (insertError) throw new Error(`Failed to update promotion items: ${insertError.message}`);
}

async function syncPromotionProductTypes(promotionId: string, productTypeIds: string[]): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const unique = [...new Set(productTypeIds)];

  const { error: deleteError } = await supabase
    .from("promotion_product_types")
    .delete()
    .eq("promotion_id", promotionId);
  if (deleteError) throw new Error(`Failed to update promotion item groups: ${deleteError.message}`);

  if (unique.length === 0) return;
  const { error: insertError } = await supabase
    .from("promotion_product_types")
    .insert(unique.map((productTypeId) => ({ promotion_id: promotionId, product_type_id: productTypeId })));
  if (insertError) throw new Error(`Failed to update promotion item groups: ${insertError.message}`);
}

export async function createPromotion(input: PromotionInput): Promise<{ id: string }> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("promotions")
    .insert({
      category: input.category,
      name: input.name,
      discount_type: input.discountType,
      discount_value: input.discountValue,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      max_uses: input.maxUses,
      min_spend: input.minSpend,
      internal_notes: input.internalNotes || null,
      enabled: input.enabled,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create promotion: ${error.message}`);
  await syncPromotionProducts(data.id, input.productIds);
  if (input.category === "atelier_supply") {
    await syncPromotionProductTypes(data.id, input.productTypeIds);
  }
  return { id: data.id };
}

export async function updatePromotion(id: string, input: PromotionInput): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("promotions")
    .update({
      name: input.name,
      discount_type: input.discountType,
      discount_value: input.discountValue,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      max_uses: input.maxUses,
      min_spend: input.minSpend,
      internal_notes: input.internalNotes || null,
      enabled: input.enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(`Failed to update promotion: ${error.message}`);
  await syncPromotionProducts(id, input.productIds);
  if (input.category === "atelier_supply") {
    await syncPromotionProductTypes(id, input.productTypeIds);
  }
}

export async function deletePromotion(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete promotion: ${error.message}`);
}
