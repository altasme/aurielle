import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

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
  createdAt: string;
};

const SELECT =
  "id, name, email, phone, country, grouping, item_interest, quantity, message, artwork_path, created_at";

export async function listCustomisationQuotes(): Promise<CustomisationQuote[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("customisation_quotes")
    .select(SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list customisation quotes: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    country: row.country,
    grouping: row.grouping,
    itemInterest: row.item_interest,
    quantity: row.quantity,
    message: row.message,
    artworkPath: row.artwork_path,
    createdAt: row.created_at,
  }));
}

export async function getCustomisationQuote(id: string): Promise<CustomisationQuote | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("customisation_quotes")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load customisation quote: ${error.message}`);
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    country: data.country,
    grouping: data.grouping,
    itemInterest: data.item_interest,
    quantity: data.quantity,
    message: data.message,
    artworkPath: data.artwork_path,
    createdAt: data.created_at,
  };
}

export async function getArtworkSignedUrl(path: string): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage.from("customisation-artwork").createSignedUrl(path, 300);
  if (error || !data) throw new Error(`Failed to sign artwork URL: ${error?.message}`);
  return data.signedUrl;
}
