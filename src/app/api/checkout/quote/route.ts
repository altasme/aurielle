import { NextResponse } from "next/server";
import { resolveCartLines } from "@/lib/orders/resolve-lines";
import { applyProductPromotions, validateDiscountCode } from "@/lib/promotions/apply";
import { withErrorHandling } from "@/lib/with-error-handling";

// Public, no auth: live pricing preview for the checkout page (item
// totals with any auto-applied Product Promotion, plus discount-code
// validation) so the customer sees the real total before submitting.
// /api/orders re-derives everything again independently at submit
// time -- this route never gets trusted as the source of truth for an
// actual order, same as the catalogue-by-slug re-derivation it's built
// on (src/lib/orders/resolve-lines.ts).
export const POST = withErrorHandling(async (request: Request) => {
  let body: { businessLine?: string; items?: { slug: string; quantity: number }[]; discountCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (body.businessLine !== "collection" && body.businessLine !== "atelier_supply") {
    return NextResponse.json({ error: "Invalid business line" }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const resolved = await resolveCartLines(body.businessLine, body.items);
  if (!resolved.ok) return NextResponse.json({ error: resolved.error }, { status: 400 });

  const promo = await applyProductPromotions(resolved.category, resolved.lines);

  let discountCode: { id: string; code: string; name: string; discountAmount: number } | null = null;
  let codeError: string | null = null;
  if (body.discountCode?.trim()) {
    const result = await validateDiscountCode(resolved.category, body.discountCode, promo.subtotal);
    if (result.ok) discountCode = result;
    else codeError = result.error;
  }

  // A valid code overrides any auto-applied Product Promotions for the
  // whole order (spec: the two never stack) -- strip the per-line
  // promotion display too, so the breakdown shown to the customer
  // doesn't imply both discounts are in effect at once.
  const lines = discountCode
    ? promo.lines.map((line) => ({
        ...line,
        promotionId: null,
        promotionName: null,
        promotionDiscountAmount: 0,
        lineTotal: line.lineSubtotal,
      }))
    : promo.lines;
  const promotionDiscountTotal = discountCode ? 0 : promo.promotionDiscountTotal;
  const discountCodeAmount = discountCode?.discountAmount ?? 0;
  const total = Math.max(0, Number((promo.subtotal - promotionDiscountTotal - discountCodeAmount).toFixed(2)));

  return NextResponse.json({
    lines,
    currency: resolved.currency,
    subtotal: promo.subtotal,
    promotionDiscountTotal,
    discountCode,
    codeError,
    total,
  });
});
