import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { updateGroupingItemLabel, deleteGroupingItem } from "@/lib/admin/studio-content";
import { revalidateStudioContent } from "@/lib/admin/revalidate";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string; itemId: string }> };

export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await params;
  const body = await request.json().catch(() => ({}));
  if (!body.label?.trim()) return NextResponse.json({ error: "Label is required" }, { status: 400 });

  await updateGroupingItemLabel(itemId, body.label.trim());
  revalidateStudioContent();
  return NextResponse.json({ ok: true });
});

export const DELETE = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await params;
  await deleteGroupingItem(itemId);
  revalidateStudioContent();
  return NextResponse.json({ ok: true });
});
