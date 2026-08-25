import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { markContactInquiryViewed } from "@/lib/admin/contact-inquiries";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await markContactInquiryViewed(id);
  return NextResponse.json({ ok: true });
});
