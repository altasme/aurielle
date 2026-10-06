import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { listGroupings, createGrouping } from "@/lib/admin/studio-content";
import { revalidateStudioContent } from "@/lib/admin/revalidate";
import { withErrorHandling } from "@/lib/with-error-handling";

export const GET = withErrorHandling(async () => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const groupings = await listGroupings();
  return NextResponse.json({ groupings });
});

export const POST = withErrorHandling(async (request: Request) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (!body.name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!body.intro?.trim()) return NextResponse.json({ error: "Intro is required" }, { status: 400 });

  const { id } = await createGrouping({
    name: body.name.trim(),
    intro: body.intro.trim(),
    imageBrief: body.imageBrief?.trim() ?? "",
    spotlight: body.spotlight === true,
  });

  revalidateStudioContent();
  return NextResponse.json({ id });
});
