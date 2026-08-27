import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/orders/order-number";
import { resolveCartLines } from "@/lib/orders/resolve-lines";
import { applyProductPromotions, validateDiscountCode, incrementPromotionUsage, incrementDiscountCodeUsage } from "@/lib/promotions/apply";
import { sendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";
import type { Address, OrderLineItem, OrderPayload } from "@/lib/orders/types";
import { withErrorHandling } from "@/lib/with-error-handling";

const MAX_PROOF_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function isValidAddress(a: unknown): a is Address {
  if (!a || typeof a !== "object") return false;
  const addr = a as Record<string, unknown>;
  return (
    typeof addr.address === "string" &&
    addr.address.trim().length > 0 &&
    typeof addr.city === "string" &&
    addr.city.trim().length > 0 &&
    typeof addr.stateProvince === "string" &&
    typeof addr.postalCode === "string" &&
    addr.postalCode.trim().length > 0 &&
    typeof addr.country === "string" &&
    addr.country.trim().length > 0
  );
}

export const POST = withErrorHandling(async (request: Request) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const payloadRaw = formData.get("payload");
  const proof = formData.get("proof");

  if (typeof payloadRaw !== "string") {
    return NextResponse.json({ error: "Missing order payload" }, { status: 400 });
  }
  if (!(proof instanceof File) || proof.size === 0) {
    return NextResponse.json(
      { error: "Proof of payment file is required" },
      { status: 400 },
    );
  }
  if (proof.size > MAX_PROOF_SIZE) {
    return NextResponse.json(
      { error: "Proof of payment file is too large (max 8MB)" },
      { status: 400 },
    );
  }
  if (!ALLOWED_PROOF_TYPES.includes(proof.type)) {
    return NextResponse.json(
      { error: "Proof of payment must be a JPEG/PNG/WebP image or a PDF" },
      { status: 400 },
    );
  }

  let payload: OrderPayload;
  try {
    payload = JSON.parse(payloadRaw);
  } catch {
    return NextResponse.json({ error: "Malformed order payload" }, { status: 400 });
  }

  if (payload.businessLine !== "collection" && payload.businessLine !== "atelier_supply") {
    return NextResponse.json({ error: "Invalid business line" }, { status: 400 });
  }
  if (payload.paymentMethod !== "gcash" && payload.paymentMethod !== "bank_transfer") {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }
  if (
    !payload.customerName?.trim() ||
    !payload.customerEmail?.trim() ||
    !payload.customerCountry?.trim()
  ) {
    return NextResponse.json({ error: "Missing customer details" }, { status: 400 });
  }
  if (!isValidAddress(payload.billing)) {
    return NextResponse.json({ error: "Missing billing address" }, { status: 400 });
  }
  const shipping = payload.shippingSameAsBilling ? payload.billing : payload.shipping;
  if (!isValidAddress(shipping)) {
    return NextResponse.json({ error: "Missing shipping address" }, { status: 400 });
  }
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Re-derive every line from the authoritative catalogue by slug, then
  // price it (auto-applied Product Promotions and, if present, a
  // discount code) server-side. Never trust client-submitted price,
  // name, or discount amounts -- only slug/quantity/discountCode come
  // from the client.
  const resolved = await resolveCartLines(payload.businessLine, payload.items);
  if (!resolved.ok) return NextResponse.json({ error: resolved.error }, { status: 400 });
  if (!resolved.currency) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const promo = await applyProductPromotions(resolved.category, resolved.lines);

  let discountCodeMatch: { id: string; code: string; name: string; discountAmount: number } | null = null;
  if (payload.discountCode?.trim()) {
    const result = await validateDiscountCode(resolved.category, payload.discountCode, promo.subtotal);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    discountCodeMatch = result;
  }

  // A valid code overrides any auto-applied Product Promotions for the
  // whole order -- the two never stack (spec).
  const promotionDiscountTotal = discountCodeMatch ? 0 : promo.promotionDiscountTotal;
  const discountCodeAmount = discountCodeMatch?.discountAmount ?? 0;
  const subtotal = promo.subtotal;
  const shippingCost = 0; // Phase 2, spec §18
  const total = Math.max(0, Number((subtotal - promotionDiscountTotal - discountCodeAmount + shippingCost).toFixed(2)));

  const pricedLines = discountCodeMatch
    ? promo.lines.map((line) => ({ ...line, promotionId: null, promotionName: null, promotionDiscountAmount: 0 }))
    : promo.lines;

  const resolvedItems: OrderLineItem[] = pricedLines.map((line, i) => ({
    productType: payload.businessLine === "collection" ? "perfume" : "supply_material",
    slug: line.slug,
    serialNumber: resolved.lines[i].serialNumber,
    name: line.name,
    price: line.price,
    currency: resolved.currency,
    pricingUnit: resolved.lines[i].pricingUnit,
    quantity: line.quantity,
    lineSubtotal: line.lineSubtotal,
    promotionName: line.promotionName,
    promotionDiscountAmount: line.promotionDiscountAmount,
  }));

  const supabase = getSupabaseAdminClient();
  const proofBytes = new Uint8Array(await proof.arrayBuffer());

  let orderNumber = "";
  let orderId = "";
  let lastError: { message: string; code?: string } | null = null;

  for (let attempt = 0; attempt < 5 && !orderId; attempt++) {
    orderNumber = generateOrderNumber();
    const { data, error } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        source: "website",
        business_line: payload.businessLine,
        customer_name: payload.customerName.trim(),
        customer_email: payload.customerEmail.trim().toLowerCase(),
        customer_phone: payload.customerPhone?.trim() || null,
        customer_country: payload.customerCountry.trim(),
        billing_address: payload.billing,
        shipping_address: shipping,
        shipping_same_as_billing: payload.shippingSameAsBilling,
        currency: resolved.currency,
        subtotal,
        shipping_cost: shippingCost,
        total,
        promotion_discount_total: promotionDiscountTotal,
        discount_code_id: discountCodeMatch?.id ?? null,
        discount_code_amount: discountCodeAmount,
        payment_method: payload.paymentMethod,
        payment_status: "pending",
        order_status: "pending_verification",
      })
      .select("id")
      .single();

    if (!error) {
      orderId = data.id;
      lastError = null;
      break;
    }
    lastError = error;
    if (error.code !== "23505") break; // not a unique-violation on order_number, don't retry
  }

  if (!orderId) {
    console.error("Order insert failed", lastError);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }

  const proofPath = `${orderNumber}/${crypto.randomUUID()}-${proof.name}`;
  const { error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(proofPath, proofBytes, { contentType: proof.type });

  if (uploadError) {
    console.error("Proof upload failed", uploadError);
    // The order record already exists, so leave order_status as
    // pending_verification for manual follow-up rather than losing the
    // order; the team can re-request proof from the customer directly.
  } else {
    await supabase.from("orders").update({ proof_url: proofPath }).eq("id", orderId);
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    pricedLines.map((line) => ({
      order_id: orderId,
      product_type: payload.businessLine === "collection" ? "perfume" : "supply_material",
      catalogue_slug: line.slug,
      serial_number: resolved.lines.find((r) => r.slug === line.slug)?.serialNumber ?? null,
      name_snapshot: line.name,
      quantity: line.quantity,
      unit_price: line.price,
      currency: resolved.currency,
      pricing_unit: resolved.lines.find((r) => r.slug === line.slug)?.pricingUnit ?? null,
      line_subtotal: line.lineSubtotal,
      promotion_id: line.promotionId,
      promotion_discount_amount: line.promotionDiscountAmount,
    })),
  );

  if (itemsError) {
    console.error("Order items insert failed", itemsError);
    return NextResponse.json({ error: "Could not save order items" }, { status: 500 });
  }

  // Reserved at submission, same as the rest of this order flow (which
  // treats order creation, not later payment verification, as the
  // authoritative moment) -- not released if the order is later
  // cancelled.
  if (discountCodeMatch) {
    await incrementDiscountCodeUsage(discountCodeMatch.id);
  } else {
    const usedPromotionIds = new Set(pricedLines.map((l) => l.promotionId).filter((id): id is string => id !== null));
    await Promise.all([...usedPromotionIds].map((id) => incrementPromotionUsage(id)));
  }

  // Best-effort -- the order is already committed, so a failed
  // confirmation email must not fail the request or roll anything
  // back; just log it for follow-up.
  const emailResult = await sendOrderConfirmationEmail({
    toEmail: payload.customerEmail.trim().toLowerCase(),
    toName: payload.customerName.trim(),
    orderNumber,
    items: resolvedItems,
    currency: resolved.currency,
    subtotal,
    promotionDiscountTotal,
    discountCode: discountCodeMatch ? { code: discountCodeMatch.code, amount: discountCodeMatch.discountAmount } : null,
    shippingCost,
    total,
    paymentMethod: payload.paymentMethod,
    shippingAddress: shipping,
  });
  if (!emailResult.ok) {
    console.error("Order confirmation email failed", emailResult.error);
  }

  return NextResponse.json({
    orderNumber,
    items: resolvedItems,
    currency: resolved.currency,
    subtotal,
    shippingCost,
    promotionDiscountTotal,
    discountCode: discountCodeMatch ? { code: discountCodeMatch.code, name: discountCodeMatch.name, amount: discountCodeMatch.discountAmount } : null,
    total,
    paymentMethod: payload.paymentMethod,
    customerEmail: payload.customerEmail.trim().toLowerCase(),
  });
});
