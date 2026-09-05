import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { updateTextField, resetTextField, UnknownFieldError } from "@/lib/admin/site-content";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ page: string }> };

export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { page } = await params;
  let body: { fieldKey?: string; value?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (typeof body.fieldKey !== "string" || typeof body.value !== "string") {
    return NextResponse.json({ error: "fieldKey and value are required" }, { status: 400 });
  }

  try {
    await updateTextField(page, body.fieldKey, body.value);
  } catch (err) {
    if (err instanceof UnknownFieldError) return NextResponse.json({ error: err.message }, { status: 404 });
    throw err;
  }
  return NextResponse.json({ ok: true });
});

// Reverts one field back to the site's original wording.
export const DELETE = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { page } = await params;
  const fieldKey = new URL(request.url).searchParams.get("field");
  if (!fieldKey) return NextResponse.json({ error: "field is required" }, { status: 400 });

  await resetTextField(page, fieldKey);
  return NextResponse.json({ ok: true });
});
