import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { normalizeListParams, toListResult, type ListParams, type ListResult } from "@/lib/admin/list-params";

export type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  country: string | null;
  inquiryType: string | null;
  message: string;
  viewedAt: string | null;
  junkedAt: string | null;
  createdAt: string;
};

const SELECT = "id, name, email, country, inquiry_type, message, viewed_at, junked_at, created_at";

function mapRow(row: Record<string, unknown>): ContactInquiry {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    country: row.country as string | null,
    inquiryType: row.inquiry_type as string | null,
    message: row.message as string,
    viewedAt: row.viewed_at as string | null,
    junkedAt: row.junked_at as string | null,
    createdAt: row.created_at as string,
  };
}

export async function listContactInquiries(params: ListParams = {}): Promise<ListResult<ContactInquiry>> {
  const { page, pageSize, view } = normalizeListParams(params);
  const supabase = getSupabaseAdminClient();
  const from = (page - 1) * pageSize;

  let query = supabase
    .from("contact_inquiries")
    .select(SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);
  query = view === "junk" ? query.not("junked_at", "is", null) : query.is("junked_at", null);

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to list contact inquiries: ${error.message}`);
  return toListResult((data ?? []).map(mapRow), count ?? 0, page, pageSize);
}

export async function countUnviewedContactInquiries(): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("contact_inquiries")
    .select("id", { count: "exact", head: true })
    .is("viewed_at", null)
    .is("junked_at", null);

  if (error) throw new Error(`Failed to count unviewed contact inquiries: ${error.message}`);
  return count ?? 0;
}

export async function markContactInquiryViewed(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  await supabase
    .from("contact_inquiries")
    .update({ viewed_at: new Date().toISOString() })
    .eq("id", id)
    .is("viewed_at", null);
}

export async function junkContactInquiry(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("contact_inquiries")
    .update({ junked_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Failed to move contact inquiry to junk: ${error.message}`);
}

export async function restoreContactInquiryFromJunk(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("contact_inquiries").update({ junked_at: null }).eq("id", id);
  if (error) throw new Error(`Failed to restore contact inquiry: ${error.message}`);
}

// Permanent delete, only offered from the Junk view -- also clears the
// reply thread recorded against it (see general-mail.ts's
// deleteGeneralMail for why this is an explicit two-step delete rather
// than an ON DELETE CASCADE: inquiry_id points at three different
// tables depending on source, so there's no FK to cascade through).
export async function deleteContactInquiry(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error: threadError } = await supabase
    .from("inquiry_messages")
    .delete()
    .eq("source", "contact")
    .eq("inquiry_id", id);
  if (threadError) throw new Error(`Failed to delete contact inquiry thread: ${threadError.message}`);

  const { error } = await supabase.from("contact_inquiries").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete contact inquiry: ${error.message}`);
}

export async function countJunkedContactInquiries(): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("contact_inquiries")
    .select("id", { count: "exact", head: true })
    .not("junked_at", "is", null);

  if (error) throw new Error(`Failed to count junked rows: ${error.message}`);
  return count ?? 0;
}
