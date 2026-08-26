import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { DiscountType, PromotionCategory } from "@/lib/admin/promotions";

export type DiscountCodeListItem = {
  id: string;
  name: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  maxUses: number | null;
  usedCount: number;
  minSpend: number | null;
  enabled: boolean;
};

export type DiscountCodeDetail = DiscountCodeListItem & {
  category: PromotionCategory;
  internalNotes: string | null;
};

export type DiscountCodeInput = {
  category: PromotionCategory;
  name: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  maxUses: number | null;
  minSpend: number | null;
  internalNotes: string | null;
  enabled: boolean;
};

const SELECT =
  "id, category, name, code, discount_type, discount_value, starts_at, ends_at, max_uses, used_count, min_spend, internal_notes, enabled";

function mapRow(row: Record<string, unknown>): DiscountCodeDetail {
  return {
    id: row.id as string,
    category: row.category as PromotionCategory,
    name: row.name as string,
    code: row.code as string,
    discountType: row.discount_type as DiscountType,
    discountValue: Number(row.discount_value),
    startsAt: row.starts_at as string,
    endsAt: row.ends_at as string,
    maxUses: row.max_uses as number | null,
    usedCount: row.used_count as number,
    minSpend: row.min_spend === null ? null : Number(row.min_spend),
    internalNotes: row.internal_notes as string | null,
    enabled: row.enabled as boolean,
  };
}

export async function listDiscountCodes(category: PromotionCategory): Promise<DiscountCodeListItem[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("discount_codes")
    .select(SELECT)
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list discount codes: ${error.message}`);
  return (data ?? []).map(mapRow);
}

export async function getDiscountCode(id: string): Promise<DiscountCodeDetail | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("discount_codes").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to load discount code: ${error.message}`);
  return data ? mapRow(data) : null;
}

// Thrown on a (category, code) collision so the API route can surface
// a specific "that code is already in use" message instead of a
// generic 500.
export class DuplicateCodeError extends Error {}

export async function createDiscountCode(input: DiscountCodeInput): Promise<{ id: string }> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("discount_codes")
    .insert({
      category: input.category,
      name: input.name,
      code: input.code.toUpperCase(),
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

  if (error) {
    if (error.code === "23505") throw new DuplicateCodeError("That code is already in use for this category.");
    throw new Error(`Failed to create discount code: ${error.message}`);
  }
  return { id: data.id };
}

export async function updateDiscountCode(id: string, input: DiscountCodeInput): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("discount_codes")
    .update({
      name: input.name,
      code: input.code.toUpperCase(),
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

  if (error) {
    if (error.code === "23505") throw new DuplicateCodeError("That code is already in use for this category.");
    throw new Error(`Failed to update discount code: ${error.message}`);
  }
}

export async function deleteDiscountCode(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("discount_codes").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete discount code: ${error.message}`);
}
