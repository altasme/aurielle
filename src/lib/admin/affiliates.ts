import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { AFFILIATE_STATUSES, type AffiliateStatus } from "@/lib/admin/affiliate-constants";

export type AffiliateApplication = {
  id: string;
  name: string;
  mobileNumber: string;
  email: string;
  shopeeId: string | null;
  fbPage: string | null;
  tiktokAccount: string | null;
  status: AffiliateStatus;
  createdAt: string;
};

const SELECT =
  "id, name, mobile_number, email, shopee_id, fb_page, tiktok_account, status, created_at";

function mapRow(row: {
  id: string;
  name: string;
  mobile_number: string;
  email: string;
  shopee_id: string | null;
  fb_page: string | null;
  tiktok_account: string | null;
  status: AffiliateStatus;
  created_at: string;
}): AffiliateApplication {
  return {
    id: row.id,
    name: row.name,
    mobileNumber: row.mobile_number,
    email: row.email,
    shopeeId: row.shopee_id,
    fbPage: row.fb_page,
    tiktokAccount: row.tiktok_account,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function listAffiliateApplications(status?: AffiliateStatus): Promise<AffiliateApplication[]> {
  const supabase = getSupabaseAdminClient();
  let query = supabase.from("affiliate_applications").select(SELECT).order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list affiliate applications: ${error.message}`);
  return (data ?? []).map(mapRow);
}

export async function countAffiliateApplicationsByStatus(): Promise<Record<AffiliateStatus, number>> {
  const supabase = getSupabaseAdminClient();
  const counts = { pending: 0, approved: 0, rejected: 0 } as Record<AffiliateStatus, number>;

  await Promise.all(
    AFFILIATE_STATUSES.map(async (status) => {
      const { count, error } = await supabase
        .from("affiliate_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      if (error) throw new Error(`Failed to count ${status} affiliate applications: ${error.message}`);
      counts[status] = count ?? 0;
    }),
  );

  return counts;
}

export async function countNewAffiliateApplications(): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("affiliate_applications")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) throw new Error(`Failed to count new affiliate applications: ${error.message}`);
  return count ?? 0;
}

export async function updateAffiliateStatus(id: string, status: AffiliateStatus): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("affiliate_applications").update({ status }).eq("id", id);
  if (error) throw new Error(`Failed to update affiliate application status: ${error.message}`);
}
