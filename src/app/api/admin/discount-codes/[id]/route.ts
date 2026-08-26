import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { updateDiscountCode, deleteDiscountCode, DuplicateCodeError, type DiscountCodeInput } from "@/lib/admin/discount-codes";
import { validateDiscountCodeInput } from "@/lib/admin/discount-code-validation";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Partial<DiscountCodeInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validated = validateDiscountCodeInput(body);
  if ("error" in validated) return NextResponse.json({ error: validated.error }, { status: 400 });

  const { id } = await params;
  try {
    await updateDiscountCode(id, validated.input);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof DuplicateCodeError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
});

export const DELETE = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await deleteDiscountCode(id);
  return NextResponse.json({ ok: true });
});
