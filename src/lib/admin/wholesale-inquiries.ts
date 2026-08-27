import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { normalizeListParams, toListResult, type ListParams, type ListResult } from "@/lib/admin/list-params";

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
  junkedAt: string | null;
  createdAt: string;
};

const SELECT =
  "id, name, business_name, email, country, product_interest, estimated_quantity, message, viewed_at, junked_at, created_at";

function mapRow(row: Record<string, unknown>): WholesaleInquiry {
  return {
    id: row.id as string,
    name: row.name as string,
    businessName: row.business_name as string | null,
    email: row.email as string,
    country: row.country as string,
    productInterest: row.product_interest as string | null,
    estimatedQuantity: row.estimated_quantity as string | null,
    message: row.message as string | null,
    viewedAt: row.viewed_at as string | null,
    junkedAt: row.junked_at as string | null,
    createdAt: row.created_at as string,
  };
}

export async function listWholesaleInquiries(params: ListParams = {}): Promise<ListResult<WholesaleInquiry>> {
  const { page, pageSize, view } = normalizeListParams(params);
  const supabase = getSupabaseAdminClient();
  const from = (page - 1) * pageSize;

  let query = supabase
    .from("wholesale_inquiries")
    .select(SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);
  query = view === "junk" ? query.not("junked_at", "is", null) : query.is("junked_at", null);

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to list business inquiries: ${error.message}`);
  return toListResult((data ?? []).map(mapRow), count ?? 0, page, pageSize);
}

export async function countUnviewedWholesaleInquiries(): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("wholesale_inquiries")
    .select("id", { count: "exact", head: true })
    .is("viewed_at", null)
    .is("junked_at", null);

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

export async function junkWholesaleInquiry(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("wholesale_inquiries")
    .update({ junked_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Failed to move business inquiry to junk: ${error.message}`);
}

export async function restoreWholesaleInquiryFromJunk(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("wholesale_inquiries").update({ junked_at: null }).eq("id", id);
  if (error) throw new Error(`Failed to restore business inquiry: ${error.message}`);
}

export async function deleteWholesaleInquiry(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error: threadError } = await supabase
    .from("inquiry_messages")
    .delete()
    .eq("source", "business")
    .eq("inquiry_id", id);
  if (threadError) throw new Error(`Failed to delete business inquiry thread: ${threadError.message}`);

  const { error } = await supabase.from("wholesale_inquiries").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete business inquiry: ${error.message}`);
}

export async function countJunkedWholesaleInquiries(): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("wholesale_inquiries")
    .select("id", { count: "exact", head: true })
    .not("junked_at", "is", null);

  if (error) throw new Error(`Failed to count junked rows: ${error.message}`);
  return count ?? 0;
}
