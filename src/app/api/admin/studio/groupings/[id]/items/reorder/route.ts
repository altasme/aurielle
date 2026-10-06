import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { getGrouping, listGroupingItems, reorderGroupingItems } from "@/lib/admin/studio-content";
import { revalidateStudioContent } from "@/lib/admin/revalidate";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string }> };

// Reorders every item for a grouping: body is the full list of item
// IDs in the desired display order (same convention as product image
// reordering, src/app/api/admin/products/[id]/images/route.ts).
export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getGrouping(id);
  if (!existing) return NextResponse.json({ error: "Grouping not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const order = body.order;
  const items = await listGroupingItems(id);
  const knownIds = new Set(items.map((item) => item.id));
  if (!Array.isArray(order) || order.length !== items.length || !order.every((itemId) => knownIds.has(itemId))) {
    return NextResponse.json({ error: "order must list every item ID for this grouping exactly once" }, { status: 400 });
  }

  await reorderGroupingItems(id, order);
  revalidateStudioContent();
  return NextResponse.json({ ok: true });
});
