import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { listAffiliateApplications, countAffiliateApplicationsByStatus } from "@/lib/admin/affiliates";
import { AFFILIATE_STATUSES, type AffiliateStatus } from "@/lib/admin/affiliate-constants";
import { withErrorHandling } from "@/lib/with-error-handling";

function parseStatus(value: string | null): AffiliateStatus | undefined {
  if (!value) return undefined;
  return AFFILIATE_STATUSES.includes(value as AffiliateStatus) ? (value as AffiliateStatus) : undefined;
}

export const GET = withErrorHandling(async (request: Request) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = parseStatus(new URL(request.url).searchParams.get("status"));
  const [applications, counts] = await Promise.all([
    listAffiliateApplications(status),
    countAffiliateApplicationsByStatus(),
  ]);
  return NextResponse.json({ applications, counts });
});
