import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { updateFinish, deleteFinish } from "@/lib/admin/studio-content";
import { revalidateStudioContent } from "@/lib/admin/revalidate";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (!body.name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!body.description?.trim()) return NextResponse.json({ error: "Description is required" }, { status: 400 });

  await updateFinish(id, { name: body.name.trim(), description: body.description.trim() });
  revalidateStudioContent();
  return NextResponse.json({ ok: true });
});

export const DELETE = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await deleteFinish(id);
  revalidateStudioContent();
  return NextResponse.json({ ok: true });
});
