import "server-only";
import type { PromotionCategory, DiscountType } from "@/lib/admin/promotions";
import type { DiscountCodeInput } from "@/lib/admin/discount-codes";

function isCategory(value: unknown): value is PromotionCategory {
  return value === "aurielle_collection" || value === "atelier_supply";
}

function isDiscountType(value: unknown): value is DiscountType {
  return value === "fixed" || value === "percent";
}

// Shared by the create and update discount-code routes -- see
// src/lib/admin/promotion-validation.ts for why this isn't a plain
// export from a route.ts file.
export function validateDiscountCodeInput(
  body: Partial<DiscountCodeInput>,
): { error: string } | { input: DiscountCodeInput } {
  if (!isCategory(body.category)) return { error: "category must be aurielle_collection or atelier_supply" };
  if (!body.name?.trim()) return { error: "Campaign name is required" };
  const code = body.code?.trim().toUpperCase() ?? "";
  if (!code) return { error: "A discount code is required" };
  if (code.length > 6) return { error: "Discount code must be 6 characters or fewer" };
  if (!/^[A-Z0-9]+$/.test(code)) return { error: "Discount code can only contain letters and numbers" };
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
      code,
      discountType: body.discountType,
      discountValue: body.discountValue,
      startsAt: new Date(body.startsAt).toISOString(),
      endsAt: new Date(body.endsAt).toISOString(),
      maxUses: body.maxUses ?? null,
      minSpend: body.minSpend ?? null,
      internalNotes: body.internalNotes?.trim() || null,
      enabled: body.enabled !== false,
    },
  };
}
