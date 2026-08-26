import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export type PromotionCategory = "aurielle_collection" | "atelier_supply";

export type CartLineInput = {
  productId: string;
  // Only meaningful for atelier_supply -- aurielle_collection products
  // have no product_type_id (see products_category_fields, 0005).
  productTypeId: string | null;
  slug: string;
  name: string;
  price: number;
  quantity: number;
};

export type PricedLine = CartLineInput & {
  lineSubtotal: number;
  promotionId: string | null;
  promotionName: string | null;
  promotionDiscountAmount: number;
  lineTotal: number;
};

export type ProductPromotionsResult = {
  lines: PricedLine[];
  subtotal: number;
  promotionDiscountTotal: number;
};

export type DiscountCodeResult =
  | { ok: true; id: string; name: string; code: string; discountAmount: number }
  | { ok: false; error: string };

function round2(n: number): number {
  return Number(n.toFixed(2));
}

type ActivePromotion = {
  id: string;
  name: string;
  discountType: "fixed" | "percent";
  discountValue: number;
  productIds: Set<string>;
  productTypeIds: Set<string>;
};

function perUnitDiscount(promo: ActivePromotion, price: number): number {
  return promo.discountType === "percent" ? price * (promo.discountValue / 100) : Math.min(promo.discountValue, price);
}

// Auto-applied, per-item discounts (Product Promotions, spec §1a/§2a).
// Every cart line is checked against every currently-active promotion
// for that category (enabled, within its date range, under its use
// cap); the promotion giving the largest discount for that specific
// line wins -- a product is never discounted by more than one
// promotion at once, which is what "don't stack" means at the item
// level (see src/lib/admin/promotions.ts's category docs).
export async function applyProductPromotions(
  category: PromotionCategory,
  lines: CartLineInput[],
): Promise<ProductPromotionsResult> {
  const supabase = getSupabaseAdminClient();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("promotions")
    .select("id, name, discount_type, discount_value, max_uses, used_count, promotion_products(product_id), promotion_product_types(product_type_id)")
    .eq("category", category)
    .eq("enabled", true)
    .lte("starts_at", nowIso)
    .gte("ends_at", nowIso);

  if (error) throw new Error(`Failed to load active promotions: ${error.message}`);

  const active: ActivePromotion[] = (data ?? [])
    .filter((row) => row.max_uses === null || row.used_count < row.max_uses)
    .map((row) => ({
      id: row.id,
      name: row.name,
      discountType: row.discount_type,
      discountValue: Number(row.discount_value),
      productIds: new Set((row.promotion_products as unknown as { product_id: string }[]).map((r) => r.product_id)),
      productTypeIds: new Set(
        (row.promotion_product_types as unknown as { product_type_id: string }[]).map((r) => r.product_type_id),
      ),
    }));

  let promotionDiscountTotal = 0;
  const pricedLines: PricedLine[] = lines.map((line) => {
    const lineSubtotal = round2(line.price * line.quantity);
    const candidates = active.filter(
      (promo) =>
        promo.productIds.has(line.productId) || (line.productTypeId !== null && promo.productTypeIds.has(line.productTypeId)),
    );

    let best: { promo: ActivePromotion; amount: number } | null = null;
    for (const promo of candidates) {
      const amount = round2(perUnitDiscount(promo, line.price) * line.quantity);
      if (!best || amount > best.amount) best = { promo, amount };
    }

    const discountAmount = best?.amount ?? 0;
    promotionDiscountTotal = round2(promotionDiscountTotal + discountAmount);

    return {
      ...line,
      lineSubtotal,
      promotionId: best?.promo.id ?? null,
      promotionName: best?.promo.name ?? null,
      promotionDiscountAmount: discountAmount,
      lineTotal: round2(lineSubtotal - discountAmount),
    };
  });

  const subtotal = round2(pricedLines.reduce((sum, line) => sum + line.lineSubtotal, 0));
  return { lines: pricedLines, subtotal, promotionDiscountTotal };
}

// Manually-entered discount code (spec §1b/§2b): order-wide, at most
// one per order, overrides any auto-applied Product Promotions for
// that order (checkout/orders route decides between the two -- codes
// don't stack with promotions or with each other).
export async function validateDiscountCode(
  category: PromotionCategory,
  rawCode: string,
  subtotal: number,
): Promise<DiscountCodeResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Please enter a discount code." };

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("discount_codes")
    .select("id, name, code, discount_type, discount_value, starts_at, ends_at, max_uses, used_count, min_spend, enabled")
    .eq("category", category)
    .eq("code", code)
    .maybeSingle();

  if (error) throw new Error(`Failed to look up discount code: ${error.message}`);
  if (!data || !data.enabled) return { ok: false, error: "That discount code isn't valid." };

  const now = new Date();
  if (now < new Date(data.starts_at)) return { ok: false, error: "That discount code isn't active yet." };
  if (now > new Date(data.ends_at)) return { ok: false, error: "That discount code has expired." };
  if (data.max_uses !== null && data.used_count >= data.max_uses) {
    return { ok: false, error: "That discount code has reached its usage limit." };
  }
  if (data.min_spend !== null && subtotal < Number(data.min_spend)) {
    return { ok: false, error: `A minimum spend of ${Number(data.min_spend)} is required for this code.` };
  }

  const discountAmount =
    data.discount_type === "percent"
      ? round2(subtotal * (Number(data.discount_value) / 100))
      : Math.min(Number(data.discount_value), subtotal);

  return { ok: true, id: data.id, name: data.name, code: data.code, discountAmount };
}

export async function incrementPromotionUsage(promotionId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.rpc("increment_promotion_usage", { promo_id: promotionId });
  if (error) console.error("Failed to increment promotion usage", error);
}

export async function incrementDiscountCodeUsage(discountCodeId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.rpc("increment_discount_code_usage", { code_id: discountCodeId });
  if (error) console.error("Failed to increment discount code usage", error);
}
