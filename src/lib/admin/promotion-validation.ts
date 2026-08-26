import "server-only";
import type { PromotionCategory, DiscountType, PromotionInput } from "@/lib/admin/promotions";

function isCategory(value: unknown): value is PromotionCategory {
  return value === "aurielle_collection" || value === "atelier_supply";
}

function isDiscountType(value: unknown): value is DiscountType {
  return value === "fixed" || value === "percent";
}

// Shared by the create (POST /api/admin/promotions) and update (PATCH
// /api/admin/promotions/[id]) routes -- kept out of route.ts files
// since Next's App Router route handlers only recognize a fixed set of
// exports (HTTP methods + a few route-config values), not arbitrary
// helper functions.
export function validatePromotionInput(body: Partial<PromotionInput>): { error: string } | { input: PromotionInput } {
  if (!isCategory(body.category)) return { error: "category must be aurielle_collection or atelier_supply" };
  if (!body.name?.trim()) return { error: "Campaign name is required" };
  if (!isDiscountType(body.discountType)) return { error: "Discount type must be fixed or percent" };
  if (typeof body.discountValue !== "number" || !Number.isFinite(body.discountValue) || body.discountValue <= 0) {
    return { error: "Discount value must be a positive number" };
  }
  if (body.discountType === "percent" && body.discountValue > 100) {
    return { error: "Percent discount can't exceed 100" };
  }
  if (!body.startsAt || Number.isNaN(Date.parse(body.startsAt))) return { error: "Start date is required" };
  if (!body.endsAt || Number.isNaN(Date.parse(body.endsAt))) return { error: "End date is required" };
  if (Date.parse(body.endsAt) <= Date.parse(body.startsAt)) return { error: "End date must be after the start date" };
  if (body.maxUses != null && (!Number.isInteger(body.maxUses) || body.maxUses <= 0)) {
    return { error: "Number of uses must be a positive whole number" };
  }
  if (body.minSpend != null && (typeof body.minSpend !== "number" || body.minSpend < 0)) {
    return { error: "Minimum spend must be a non-negative number" };
  }

  return {
    input: {
      category: body.category,
      name: body.name.trim(),
      discountType: body.discountType,
      discountValue: body.discountValue,
      startsAt: new Date(body.startsAt).toISOString(),
      endsAt: new Date(body.endsAt).toISOString(),
      maxUses: body.maxUses ?? null,
      minSpend: body.minSpend ?? null,
      internalNotes: body.internalNotes?.trim() || null,
      enabled: body.enabled !== false,
      productIds: Array.isArray(body.productIds) ? body.productIds.filter((id) => typeof id === "string") : [],
      productTypeIds:
        body.category === "atelier_supply" && Array.isArray(body.productTypeIds)
          ? body.productTypeIds.filter((id) => typeof id === "string")
          : [],
    },
  };
}
