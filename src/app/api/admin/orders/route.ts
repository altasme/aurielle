import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { listOrders, type BusinessLine, type OrderStatus } from "@/lib/admin/orders";
import { withErrorHandling } from "@/lib/with-error-handling";

function isBusinessLine(value: string | null): value is BusinessLine {
  return value === "collection" || value === "atelier_supply";
}

function isOrderStatus(value: string | null): value is OrderStatus {
  return (
    value === "pending_verification" ||
    value === "received" ||
    value === "processing" ||
    value === "fulfilled" ||
    value === "cancelled"
  );
}

export const GET = withErrorHandling(async (request: Request) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const businessLineParam = searchParams.get("businessLine");
  const orderStatusParam = searchParams.get("orderStatus");

  const orders = await listOrders({
    businessLine: isBusinessLine(businessLineParam) ? businessLineParam : undefined,
    orderStatus: isOrderStatus(orderStatusParam) ? orderStatusParam : undefined,
    search: searchParams.get("search") ?? undefined,
  });
  return NextResponse.json({ orders });
});
