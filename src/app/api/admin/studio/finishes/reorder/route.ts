import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { listFinishes, reorderFinishes } from "@/lib/admin/studio-content";
import { revalidateStudioContent } from "@/lib/admin/revalidate";
import { withErrorHandling } from "@/lib/with-error-handling";

export const PATCH = withErrorHandling(async (request: Request) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const order = body.order;
  const finishes = await listFinishes();
  const knownIds = new Set(finishes.map((f) => f.id));
  if (!Array.isArray(order) || order.length !== finishes.length || !order.every((id) => knownIds.has(id))) {
    return NextResponse.json({ error: "order must list every finish ID exactly once" }, { status: 400 });
  }

  await reorderFinishes(order);
  revalidateStudioContent();
  return NextResponse.json({ ok: true });
});
