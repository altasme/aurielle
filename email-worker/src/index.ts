import PostalMime from "postal-mime";

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

type StoredAttachment = { filename: string; mimeType: string | null; path: string };

// Table names keyed by the "source" segment the admin app already uses
// (src/lib/admin/{contact,wholesale,customisation}-*.ts) -- kept in
// sync manually since this worker deploys independently of the Next.js
// app and doesn't share a module graph with it.
const SOURCE_TABLES: Record<string, string> = {
  contact: "contact_inquiries",
  business: "wholesale_inquiries",
  studio: "customisation_quotes",
  mail: "general_mail",
};

// Matches the hello+<source>-<uuid>@domain reply-to address the admin
// composer sets on every outbound reply (buildReplyToAddress in
// src/lib/admin/inquiry-messages.ts). A customer hitting "reply" keeps
// this address, which is how we know which inquiry a reply belongs to
// without any subject-line or sender-address guessing.
const PLUS_ADDRESS_PATTERN = /^[^+@]+\+([a-z]+)-([0-9a-fA-F-]{36})@/;

function parsePlusAddress(address: string): { source: string; inquiryId: string } | null {
  const match = PLUS_ADDRESS_PATTERN.exec(address);
  if (!match) return null;
  const [, source, inquiryId] = match;
  if (!(source in SOURCE_TABLES)) return null;
  return { source, inquiryId };
}

function toBytes(content: ArrayBuffer | Uint8Array | string): Uint8Array {
  if (content instanceof Uint8Array) return content;
  if (typeof content === "string") return new TextEncoder().encode(content);
  return new Uint8Array(content);
}

async function uploadAttachments(
  attachments: { filename: string | null; mimeType: string; content: ArrayBuffer | Uint8Array | string }[],
  env: Env,
): Promise<StoredAttachment[]> {
  const stored: StoredAttachment[] = [];
  for (const attachment of attachments) {
    const filename = attachment.filename || "attachment";
    const path = `inbound/${crypto.randomUUID()}-${filename}`;
    const res = await fetch(`${env.SUPABASE_URL}/storage/v1/object/inquiry-attachments/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": attachment.mimeType || "application/octet-stream",
      },
      body: toBytes(attachment.content),
    });
    if (res.ok) stored.push({ filename, mimeType: attachment.mimeType || null, path });
    else console.error("Attachment upload failed", await res.text());
  }
  return stored;
}

function restHeaders(env: Env): Record<string, string> {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };
}

export default {
  async email(message: ForwardableEmailMessage, env: Env, _ctx: ExecutionContext): Promise<void> {
    const raw = new Response(message.raw);
    const parsed = await PostalMime.parse(await raw.arrayBuffer());
    const attachments = await uploadAttachments(parsed.attachments, env);
    const fromEmail = parsed.from?.address ?? message.from;
    const fromName = parsed.from && "name" in parsed.from ? parsed.from.name || null : null;

    const match = parsePlusAddress(message.to);

    if (match) {
      await fetch(`${env.SUPABASE_URL}/rest/v1/inquiry_messages`, {
        method: "POST",
        headers: restHeaders(env),
        body: JSON.stringify({
          source: match.source,
          inquiry_id: match.inquiryId,
          direction: "inbound",
          from_email: fromEmail,
          from_name: fromName,
          to_email: message.to,
          subject: parsed.subject ?? null,
          body_text: parsed.text ?? null,
          body_html: parsed.html ?? null,
          attachments,
        }),
      });

      // A customer replying is new activity -- reopen the unread
      // counter on the parent inquiry/quote row the same way a fresh
      // submission would.
      const table = SOURCE_TABLES[match.source];
      await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?id=eq.${match.inquiryId}`, {
        method: "PATCH",
        headers: restHeaders(env),
        body: JSON.stringify({ viewed_at: null }),
      });
      return;
    }

    // Doesn't match any known reply address (e.g. someone emailed
    // hello@ directly instead of replying to an admin message) -- goes
    // into Aurielle Mail (general_mail) rather than being silently
    // dropped, now that this address no longer lands in the z.com
    // webmail inbox at all. A reply to *this* later (hello+mail-<id>@)
    // is what the `match` branch above picks up.
    await fetch(`${env.SUPABASE_URL}/rest/v1/general_mail`, {
      method: "POST",
      headers: restHeaders(env),
      body: JSON.stringify({
        to_email: message.to,
        from_email: fromEmail,
        from_name: fromName,
        subject: parsed.subject ?? null,
        body_text: parsed.text ?? null,
        body_html: parsed.html ?? null,
        attachments,
      }),
    });
  },
};
