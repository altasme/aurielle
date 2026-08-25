import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { listCustomisationQuotes } from "@/lib/admin/customisation-quotes";
import { withErrorHandling } from "@/lib/with-error-handling";

export const GET = withErrorHandling(async () => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quotes = await listCustomisationQuotes();
  return NextResponse.json({ quotes });
});
