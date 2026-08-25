// Split out from src/lib/admin/affiliates.ts (server-only, reads from
// Supabase) so client components can still import these plain
// constants/labels.

export type AffiliateStatus = "pending" | "approved" | "rejected";

export const AFFILIATE_STATUSES: AffiliateStatus[] = ["pending", "approved", "rejected"];

export const AFFILIATE_STATUS_LABELS: Record<AffiliateStatus, string> = {
  pending: "New",
  approved: "Approved",
  rejected: "Rejected",
};
