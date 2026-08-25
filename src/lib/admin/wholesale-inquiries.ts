import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

// Displayed in the admin as "Business Inquiries" -- table name matches
// the public Business page's original "wholesale" framing.
export type WholesaleInquiry = {
  id: string;
  name: string;
  businessName: string | null;
  email: string;
  country: string;
  productInterest: string | null;
  estimatedQuantity: string | null;
  message: string | null;
  viewedAt: string | null;
  createdAt: string;
};

const SELECT =
  "id, name, business_name, email, country, product_interest, estimated_quantity, message, viewed_at, created_at";

export async function listWholesaleInquiries(): Promise<WholesaleInquiry[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("wholesale_inquiries")
    .select(SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list business inquiries: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    businessName: row.business_name,
    email: row.email,
    country: row.country,
    productInterest: row.product_interest,
    estimatedQuantity: row.estimated_quantity,
    message: row.message,
    viewedAt: row.viewed_at,
    createdAt: row.created_at,
  }));
}

export async function countUnviewedWholesaleInquiries(): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("wholesale_inquiries")
    .select("id", { count: "exact", head: true })
    .is("viewed_at", null);

  if (error) throw new Error(`Failed to count unviewed business inquiries: ${error.message}`);
  return count ?? 0;
}

export async function markWholesaleInquiryViewed(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  await supabase
    .from("wholesale_inquiries")
    .update({ viewed_at: new Date().toISOString() })
    .eq("id", id)
    .is("viewed_at", null);
}
