import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { getOrder, updateOrderStatus } from "@/lib/admin/orders";
import { ORDER_STATUSES, PAYMENT_STATUSES, type OrderStatus, type PaymentStatus } from "@/lib/admin/order-constants";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
});

export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOrder(id);
  if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  let body: {
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    courierName?: string;
    trackingNumber?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.orderStatus || !ORDER_STATUSES.includes(body.orderStatus)) {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }
  if (!body.paymentStatus || !PAYMENT_STATUSES.includes(body.paymentStatus)) {
    return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
  }
  if (body.orderStatus === "shipped_out" && (!body.courierName?.trim() || !body.trackingNumber?.trim())) {
    return NextResponse.json(
      { error: "Courier name and tracking number are required for Shipped Out" },
      { status: 400 },
    );
  }

  await updateOrderStatus(id, {
    orderStatus: body.orderStatus,
    paymentStatus: body.paymentStatus,
    courierName: body.courierName?.trim(),
    trackingNumber: body.trackingNumber?.trim(),
  });
  return NextResponse.json({ ok: true });
});
