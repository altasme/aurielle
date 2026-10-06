import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { uploadGroupingItemImage } from "@/lib/admin/studio-content";
import { revalidateStudioContent } from "@/lib/admin/revalidate";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string; itemId: string }> };

export const POST = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await params;
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof Blob)) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const result = await uploadGroupingItemImage(itemId, file);
  revalidateStudioContent();
  return NextResponse.json(result);
});
