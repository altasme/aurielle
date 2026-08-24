import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export type AffiliateApplication = {
  id: string;
  name: string;
  mobileNumber: string;
  email: string;
  shopeeId: string | null;
  fbPage: string | null;
  tiktokAccount: string | null;
  createdAt: string;
};

export async function listAffiliateApplications(): Promise<AffiliateApplication[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("affiliate_applications")
    .select("id, name, mobile_number, email, shopee_id, fb_page, tiktok_account, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list affiliate applications: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    mobileNumber: row.mobile_number,
    email: row.email,
    shopeeId: row.shopee_id,
    fbPage: row.fb_page,
    tiktokAccount: row.tiktok_account,
    createdAt: row.created_at,
  }));
}
