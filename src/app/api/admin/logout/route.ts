import { NextResponse } from "next/server";
import { destroySession } from "@/lib/admin/auth";
import { withErrorHandling } from "@/lib/admin/with-error-handling";

export const POST = withErrorHandling(async () => {
  await destroySession();
  return NextResponse.json({ ok: true });
});
