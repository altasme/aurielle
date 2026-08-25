import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  country: string | null;
  inquiryType: string | null;
  message: string;
  viewedAt: string | null;
  createdAt: string;
};

const SELECT = "id, name, email, country, inquiry_type, message, viewed_at, created_at";

export async function listContactInquiries(): Promise<ContactInquiry[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("contact_inquiries")
    .select(SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list contact inquiries: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    country: row.country,
    inquiryType: row.inquiry_type,
    message: row.message,
    viewedAt: row.viewed_at,
    createdAt: row.created_at,
  }));
}

export async function countUnviewedContactInquiries(): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("contact_inquiries")
    .select("id", { count: "exact", head: true })
    .is("viewed_at", null);

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
