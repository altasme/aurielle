import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { listFinishes, createFinish } from "@/lib/admin/studio-content";
import { revalidateStudioContent } from "@/lib/admin/revalidate";
import { withErrorHandling } from "@/lib/with-error-handling";

export const GET = withErrorHandling(async () => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const finishes = await listFinishes();
  return NextResponse.json({ finishes });
});

export const POST = withErrorHandling(async (request: Request) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (!body.name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!body.description?.trim()) return NextResponse.json({ error: "Description is required" }, { status: 400 });

  const finish = await createFinish({ name: body.name.trim(), description: body.description.trim() });
  revalidateStudioContent();
  return NextResponse.json({ finish });
});
