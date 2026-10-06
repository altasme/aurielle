import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { getGrouping, updateGrouping, deleteGrouping } from "@/lib/admin/studio-content";
import { revalidateStudioContent } from "@/lib/admin/revalidate";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const grouping = await getGrouping(id);
  if (!grouping) return NextResponse.json({ error: "Grouping not found" }, { status: 404 });
  return NextResponse.json({ grouping });
});

export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getGrouping(id);
  if (!existing) return NextResponse.json({ error: "Grouping not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  if (!body.name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!body.intro?.trim()) return NextResponse.json({ error: "Intro is required" }, { status: 400 });

  await updateGrouping(id, {
    name: body.name.trim(),
    intro: body.intro.trim(),
    imageBrief: body.imageBrief?.trim() ?? "",
    spotlight: body.spotlight === true,
  });

  revalidateStudioContent();
  return NextResponse.json({ ok: true });
});

export const DELETE = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getGrouping(id);
  if (!existing) return NextResponse.json({ error: "Grouping not found" }, { status: 404 });

  await deleteGrouping(id);
  revalidateStudioContent();
  return NextResponse.json({ ok: true });
});
