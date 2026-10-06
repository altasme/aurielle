import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { getGrouping, listGroupingItems, createGroupingItem } from "@/lib/admin/studio-content";
import { revalidateStudioContent } from "@/lib/admin/revalidate";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const items = await listGroupingItems(id);
  return NextResponse.json({ items });
});

export const POST = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getGrouping(id);
  if (!existing) return NextResponse.json({ error: "Grouping not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  if (!body.label?.trim()) return NextResponse.json({ error: "Label is required" }, { status: 400 });

  const item = await createGroupingItem(id, body.label.trim());
  revalidateStudioContent();
  return NextResponse.json({ item });
});
