import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { junkCustomisationQuote } from "@/lib/admin/customisation-quotes";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string }> };

export const POST = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await junkCustomisationQuote(id);
  return NextResponse.json({ ok: true });
});
