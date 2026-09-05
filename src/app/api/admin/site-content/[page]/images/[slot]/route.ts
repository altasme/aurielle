import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { uploadImageSlot, resetImageSlot, UnknownFieldError } from "@/lib/admin/site-content";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ page: string; slot: string }> };

export const POST = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { page, slot } = await params;
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const result = await uploadImageSlot(page, slot, file);
    return NextResponse.json({ url: result.url });
  } catch (err) {
    if (err instanceof UnknownFieldError) return NextResponse.json({ error: err.message }, { status: 404 });
    const message = err instanceof Error ? err.message : "Image upload failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
});

// Reverts to the site's original photo.
export const DELETE = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { page, slot } = await params;
  await resetImageSlot(page, slot);
  return NextResponse.json({ ok: true });
});
