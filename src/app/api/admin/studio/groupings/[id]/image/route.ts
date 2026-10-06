import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { getGrouping, uploadGroupingImage } from "@/lib/admin/studio-content";
import { revalidateStudioContent } from "@/lib/admin/revalidate";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string }> };

export const POST = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getGrouping(id);
  if (!existing) return NextResponse.json({ error: "Grouping not found" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof Blob)) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const result = await uploadGroupingImage(id, file);
  revalidateStudioContent();
  return NextResponse.json(result);
});
