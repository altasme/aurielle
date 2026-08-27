import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { MessageAttachment } from "@/lib/admin/inquiry-messages";
import { normalizeListParams, toListResult, type ListParams, type ListResult } from "@/lib/admin/list-params";

export type GeneralMailMessage = {
  id: string;
  toEmail: string;
  fromEmail: string;
  fromName: string | null;
  subject: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  attachments: MessageAttachment[];
  viewedAt: string | null;
  junkedAt: string | null;
  createdAt: string;
};

const SELECT =
  "id, to_email, from_email, from_name, subject, body_text, body_html, attachments, viewed_at, junked_at, created_at";

function mapRow(row: Record<string, unknown>): GeneralMailMessage {
  return {
    id: row.id as string,
    toEmail: row.to_email as string,
    fromEmail: row.from_email as string,
    fromName: row.from_name as string | null,
    subject: row.subject as string | null,
    bodyText: row.body_text as string | null,
    bodyHtml: row.body_html as string | null,
    attachments: (row.attachments ?? []) as MessageAttachment[],
    viewedAt: row.viewed_at as string | null,
    junkedAt: row.junked_at as string | null,
    createdAt: row.created_at as string,
  };
}

// "Aurielle Mail": anything sent to hello@ that doesn't match a Quotes
// and Inquiries reply address (email-worker/src/index.ts's "unmatched"
// fallback writes here). Separate inbox, separate unread badge --
// Quotes and Inquiries is untouched by this.
export async function listGeneralMail(params: ListParams = {}): Promise<ListResult<GeneralMailMessage>> {
  const { page, pageSize, view } = normalizeListParams(params);
  const supabase = getSupabaseAdminClient();
  const from = (page - 1) * pageSize;

  let query = supabase
    .from("general_mail")
    .select(SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);
  query = view === "junk" ? query.not("junked_at", "is", null) : query.is("junked_at", null);

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to list Aurielle Mail: ${error.message}`);
  return toListResult((data ?? []).map(mapRow), count ?? 0, page, pageSize);
}

export async function getGeneralMail(id: string): Promise<GeneralMailMessage | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("general_mail").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to load Aurielle Mail message: ${error.message}`);
  return data ? mapRow(data) : null;
}

export async function countUnviewedGeneralMail(): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("general_mail")
    .select("id", { count: "exact", head: true })
    .is("viewed_at", null)
    .is("junked_at", null);

  if (error) throw new Error(`Failed to count unviewed Aurielle Mail: ${error.message}`);
  return count ?? 0;
}

export async function markGeneralMailViewed(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  await supabase.from("general_mail").update({ viewed_at: new Date().toISOString() }).eq("id", id).is("viewed_at", null);
}

export async function junkGeneralMail(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("general_mail").update({ junked_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(`Failed to move Aurielle Mail message to junk: ${error.message}`);
}

export async function restoreGeneralMailFromJunk(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("general_mail").update({ junked_at: null }).eq("id", id);
  if (error) throw new Error(`Failed to restore Aurielle Mail message: ${error.message}`);
}

// Permanent delete, only offered from the Junk view -- also clears the
// reply thread (inquiry_messages rows with source "mail") recorded
// against this message -- there's no FK between them (inquiry_id
// points at three different tables depending on source), so this has
// to be an explicit two-step delete rather than an ON DELETE CASCADE.
export async function deleteGeneralMail(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error: threadError } = await supabase
    .from("inquiry_messages")
    .delete()
    .eq("source", "mail")
    .eq("inquiry_id", id);
  if (threadError) throw new Error(`Failed to delete Aurielle Mail thread: ${threadError.message}`);

  const { error } = await supabase.from("general_mail").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete Aurielle Mail message: ${error.message}`);
}

export async function countJunkedGeneralMail(): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("general_mail")
    .select("id", { count: "exact", head: true })
    .not("junked_at", "is", null);

  if (error) throw new Error(`Failed to count junked rows: ${error.message}`);
  return count ?? 0;
}
