import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { updateAffiliateStatus, deleteAffiliateApplication } from "@/lib/admin/affiliates";
import { AFFILIATE_STATUSES, type AffiliateStatus } from "@/lib/admin/affiliate-constants";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { status?: AffiliateStatus };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.status || !AFFILIATE_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { id } = await params;
  await updateAffiliateStatus(id, body.status);
  return NextResponse.json({ ok: true });
});

export const DELETE = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await deleteAffiliateApplication(id);
  return NextResponse.json({ ok: true });
});
