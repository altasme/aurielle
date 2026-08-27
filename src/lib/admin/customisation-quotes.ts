import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { normalizeListParams, toListResult, type ListParams, type ListResult } from "@/lib/admin/list-params";

export type CustomisationQuote = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  grouping: string | null;
  itemInterest: string | null;
  quantity: string | null;
  message: string | null;
  artworkPath: string | null;
  viewedAt: string | null;
  junkedAt: string | null;
  createdAt: string;
};

const SELECT =
  "id, name, email, phone, country, grouping, item_interest, quantity, message, artwork_path, viewed_at, junked_at, created_at";

function mapRow(row: Record<string, unknown>): CustomisationQuote {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string | null,
    country: row.country as string | null,
    grouping: row.grouping as string | null,
    itemInterest: row.item_interest as string | null,
    quantity: row.quantity as string | null,
    message: row.message as string | null,
    artworkPath: row.artwork_path as string | null,
    viewedAt: row.viewed_at as string | null,
    junkedAt: row.junked_at as string | null,
    createdAt: row.created_at as string,
  };
}

export async function listCustomisationQuotes(params: ListParams = {}): Promise<ListResult<CustomisationQuote>> {
  const { page, pageSize, view } = normalizeListParams(params);
  const supabase = getSupabaseAdminClient();
  const from = (page - 1) * pageSize;

  let query = supabase
    .from("customisation_quotes")
    .select(SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);
  query = view === "junk" ? query.not("junked_at", "is", null) : query.is("junked_at", null);

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to list customisation quotes: ${error.message}`);
  return toListResult((data ?? []).map(mapRow), count ?? 0, page, pageSize);
}

export async function countUnviewedCustomisationQuotes(): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("customisation_quotes")
    .select("id", { count: "exact", head: true })
    .is("viewed_at", null)
    .is("junked_at", null);

  if (error) throw new Error(`Failed to count unviewed customisation quotes: ${error.message}`);
  return count ?? 0;
}

export async function markCustomisationQuoteViewed(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  await supabase
    .from("customisation_quotes")
    .update({ viewed_at: new Date().toISOString() })
    .eq("id", id)
    .is("viewed_at", null);
}

export async function junkCustomisationQuote(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("customisation_quotes")
    .update({ junked_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Failed to move customisation quote to junk: ${error.message}`);
}

export async function restoreCustomisationQuoteFromJunk(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("customisation_quotes").update({ junked_at: null }).eq("id", id);
  if (error) throw new Error(`Failed to restore customisation quote: ${error.message}`);
}

export async function deleteCustomisationQuote(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error: threadError } = await supabase
    .from("inquiry_messages")
    .delete()
    .eq("source", "studio")
    .eq("inquiry_id", id);
  if (threadError) throw new Error(`Failed to delete customisation quote thread: ${threadError.message}`);

  const { error } = await supabase.from("customisation_quotes").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete customisation quote: ${error.message}`);
}

export async function getCustomisationQuote(id: string): Promise<CustomisationQuote | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("customisation_quotes")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load customisation quote: ${error.message}`);
  return data ? mapRow(data) : null;
}

export async function getArtworkSignedUrl(path: string): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage.from("customisation-artwork").createSignedUrl(path, 300);
  if (error || !data) throw new Error(`Failed to sign artwork URL: ${error?.message}`);
  return data.signedUrl;
}

export async function countJunkedCustomisationQuotes(): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("customisation_quotes")
    .select("id", { count: "exact", head: true })
    .not("junked_at", "is", null);

  if (error) throw new Error(`Failed to count junked rows: ${error.message}`);
  return count ?? 0;
}
