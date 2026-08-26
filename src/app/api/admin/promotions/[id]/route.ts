import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { updatePromotion, deletePromotion, type PromotionInput } from "@/lib/admin/promotions";
import { validatePromotionInput } from "@/lib/admin/promotion-validation";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
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

  const { id } = await params;
  await updatePromotion(id, validated.input);
  return NextResponse.json({ ok: true });
});

export const DELETE = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await deletePromotion(id);
  return NextResponse.json({ ok: true });
});
