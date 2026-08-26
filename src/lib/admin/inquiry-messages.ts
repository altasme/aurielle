import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export type InquirySource = "contact" | "business" | "studio" | "mail";

export type MessageAttachment = {
  filename: string;
  mimeType: string | null;
  path: string;
};

export type InquiryMessage = {
  id: string;
  direction: "inbound" | "outbound";
  fromEmail: string;
  fromName: string | null;
  toEmail: string;
  subject: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  attachments: MessageAttachment[];
  createdAt: string;
};

const SELECT =
  "id, direction, from_email, from_name, to_email, subject, body_text, body_html, attachments, created_at";

// The reply-to address that makes an inbound reply self-identifying:
// the email-worker (a separate Cloudflare Worker, see email-worker/)
// parses this same pattern back out of the recipient address to know
// which inquiry a customer's reply belongs to, without any other
// matching heuristics (subject lines change, customers reuse the same
// address across multiple inquiries, etc).
export function buildReplyToAddress(fromEmail: string, source: InquirySource, inquiryId: string): string {
  const [localPart, domain] = fromEmail.split("@");
  return `${localPart}+${source}-${inquiryId}@${domain}`;
}

export async function listInquiryMessages(source: InquirySource, inquiryId: string): Promise<InquiryMessage[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("inquiry_messages")
    .select(SELECT)
    .eq("source", source)
    .eq("inquiry_id", inquiryId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to load message thread: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    direction: row.direction,
    fromEmail: row.from_email,
    fromName: row.from_name,
    toEmail: row.to_email,
    subject: row.subject,
    bodyText: row.body_text,
    bodyHtml: row.body_html,
    attachments: (row.attachments ?? []) as MessageAttachment[],
    createdAt: row.created_at,
  }));
}

export async function recordOutboundMessage(params: {
  source: InquirySource;
  inquiryId: string;
  fromEmail: string;
  fromName: string | null;
  toEmail: string;
  subject: string;
  bodyText: string;
  attachments: MessageAttachment[];
}): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("inquiry_messages").insert({
    source: params.source,
    inquiry_id: params.inquiryId,
    direction: "outbound",
    from_email: params.fromEmail,
    from_name: params.fromName,
    to_email: params.toEmail,
    subject: params.subject,
    body_text: params.bodyText,
    attachments: params.attachments,
  });
  if (error) throw new Error(`Failed to record outbound message: ${error.message}`);
}

export async function getMessageAttachmentSignedUrl(path: string): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage.from("inquiry-attachments").createSignedUrl(path, 300);
  if (error || !data) throw new Error(`Failed to sign attachment URL: ${error?.message}`);
  return data.signedUrl;
}
