import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { createDiscountCode, DuplicateCodeError, type DiscountCodeInput } from "@/lib/admin/discount-codes";
import { validateDiscountCodeInput } from "@/lib/admin/discount-code-validation";
import { withErrorHandling } from "@/lib/with-error-handling";

export const POST = withErrorHandling(async (request: Request) => {
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

  try {
    const { id } = await createDiscountCode(validated.input);
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    if (err instanceof DuplicateCodeError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
});
