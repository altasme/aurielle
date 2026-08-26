import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/with-error-handling";

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber")?.trim();
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!orderNumber || !email) {
    return NextResponse.json(
      { error: "Order number and email are required" },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, business_line, customer_name, customer_email, currency, subtotal, shipping_cost, promotion_discount_total, discount_code_amount, discount_codes(code, name), total, payment_method, payment_status, order_status, courier_name, tracking_number, created_at",
    )
    .eq("order_number", orderNumber)
    .eq("customer_email", email)
    .maybeSingle();

  if (error) {
    console.error("Order lookup failed", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ error: "No matching order found" }, { status: 404 });
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("name_snapshot, quantity, unit_price, currency, pricing_unit, line_subtotal, promotion_discount_amount, promotions(name)")
    .eq("order_id", order.id);

  if (itemsError) {
    console.error("Order items lookup failed", itemsError);
  }

  const { id: _id, discount_codes: discountCodeRow, ...orderWithoutId } = order;
  void _id;
  const discountCode = discountCodeRow as unknown as { code: string; name: string } | null;

  return NextResponse.json({
    order: {
      ...orderWithoutId,
      discount_code: discountCode ? { code: discountCode.code, name: discountCode.name } : null,
    },
    items: (items ?? []).map((item) => ({
      ...item,
      promotion_name: (item.promotions as unknown as { name: string } | null)?.name ?? null,
    })),
  });
});
