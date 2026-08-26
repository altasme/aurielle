import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { createPromotion, type PromotionInput } from "@/lib/admin/promotions";
import { validatePromotionInput } from "@/lib/admin/promotion-validation";
import { withErrorHandling } from "@/lib/with-error-handling";

export const POST = withErrorHandling(async (request: Request) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Partial<PromotionInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validated = validatePromotionInput(body);
  if ("error" in validated) return NextResponse.json({ error: validated.error }, { status: 400 });

  const { id } = await createPromotion(validated.input);
  return NextResponse.json({ id }, { status: 201 });
});
