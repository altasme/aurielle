import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { getOrder, getProofSignedUrl } from "@/lib/admin/orders";
import { withErrorHandling } from "@/lib/admin/with-error-handling";

type Params = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!order.proofPath) return NextResponse.json({ error: "No proof of payment on file" }, { status: 404 });

  const url = await getProofSignedUrl(order.proofPath);
  return NextResponse.json({ url });
});
