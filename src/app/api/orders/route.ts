import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/orders/order-number";
import { getPerfumeBySlug } from "@/lib/data/perfumes";
import { getSupplyMaterialBySlug } from "@/lib/data/supply-materials";
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

  // Re-derive every line from the authoritative static catalogue by slug.
  // Never trust client-submitted price/name, which could be tampered
  // with before the request is sent. Only quantity comes from the client
  // (clamped to a sane range).
  const resolvedItems: OrderLineItem[] = [];
  let currency: string | null = null;

  for (const rawItem of payload.items as Array<Record<string, unknown>>) {
    const quantity = Math.min(Math.max(Math.floor(Number(rawItem?.quantity)), 1), 10000);
    if (!Number.isFinite(quantity)) {
      return NextResponse.json({ error: "Invalid item quantity" }, { status: 400 });
    }
    const slug = String(rawItem?.slug ?? "");

    if (payload.businessLine === "collection") {
      const perfume = await getPerfumeBySlug(slug);
      if (!perfume || perfume.price == null || !perfume.currency) {
        return NextResponse.json(
          { error: `Unknown or unpriced perfume: ${slug}` },
          { status: 400 },
        );
      }
      currency ??= perfume.currency;
      if (perfume.currency !== currency) {
        return NextResponse.json({ error: "Mixed currencies in one order" }, { status: 400 });
      }
      resolvedItems.push({
        productType: "perfume",
        slug: perfume.slug,
        serialNumber: null,
        name: perfume.name,
        price: perfume.price,
        currency: perfume.currency,
        pricingUnit: null,
        quantity,
        lineSubtotal: Number((perfume.price * quantity).toFixed(2)),
      });
    } else {
      const material = await getSupplyMaterialBySlug(slug);
      if (!material) {
        return NextResponse.json({ error: `Unknown material: ${slug}` }, { status: 400 });
      }
      currency ??= material.currency;
      if (material.currency !== currency) {
        return NextResponse.json({ error: "Mixed currencies in one order" }, { status: 400 });
      }
      resolvedItems.push({
        productType: "supply_material",
        slug: material.slug,
        serialNumber: material.serialNumber,
        name: material.displayName,
        price: material.price,
        currency: material.currency,
        pricingUnit: material.pricingUnit,
        quantity,
        lineSubtotal: Number((material.price * quantity).toFixed(2)),
      });
    }
  }

  const subtotal = Number(
    resolvedItems.reduce((sum, item) => sum + item.lineSubtotal, 0).toFixed(2),
  );
  const shippingCost = 0; // Phase 2, spec §18
  const total = Number((subtotal + shippingCost).toFixed(2));

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
        currency,
        subtotal,
        shipping_cost: shippingCost,
        total,
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
    resolvedItems.map((item) => ({
      order_id: orderId,
      product_type: item.productType,
      catalogue_slug: item.slug,
      serial_number: item.serialNumber,
      name_snapshot: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      currency: item.currency,
      pricing_unit: item.pricingUnit,
      line_subtotal: item.lineSubtotal,
    })),
  );

  if (itemsError) {
    console.error("Order items insert failed", itemsError);
    return NextResponse.json({ error: "Could not save order items" }, { status: 500 });
  }

  return NextResponse.json({
    orderNumber,
    items: resolvedItems,
    currency,
    subtotal,
    shippingCost,
    total,
    paymentMethod: payload.paymentMethod,
    customerEmail: payload.customerEmail.trim().toLowerCase(),
  });
});
