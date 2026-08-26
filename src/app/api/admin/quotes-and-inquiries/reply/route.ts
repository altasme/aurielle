import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { sendReplyEmail, SendReplyError, type ReplyAttachment } from "@/lib/email/send-reply";
import { markContactInquiryViewed } from "@/lib/admin/contact-inquiries";
import { markWholesaleInquiryViewed } from "@/lib/admin/wholesale-inquiries";
import { markCustomisationQuoteViewed } from "@/lib/admin/customisation-quotes";
import {
  buildReplyToAddress,
  recordOutboundMessage,
  type InquirySource,
  type MessageAttachment,
} from "@/lib/admin/inquiry-messages";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/with-error-handling";

const SOURCES = ["contact", "business", "studio"] as const;

function isSource(value: FormDataEntryValue | null): value is InquirySource {
  return typeof value === "string" && (SOURCES as readonly string[]).includes(value);
}

async function markViewed(source: InquirySource, id: string): Promise<void> {
  if (source === "contact") return markContactInquiryViewed(id);
  if (source === "business") return markWholesaleInquiryViewed(id);
  return markCustomisationQuoteViewed(id);
}

export const POST = withErrorHandling(async (request: Request) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const source = formData.get("source");
  const id = formData.get("id");
  const toEmail = formData.get("toEmail");
  const toName = formData.get("toName");
  const subject = formData.get("subject");
  const body = formData.get("body");

  if (!isSource(source)) return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  if (typeof id !== "string" || !id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (typeof toEmail !== "string" || !toEmail.trim()) {
    return NextResponse.json({ error: "Recipient email is required" }, { status: 400 });
  }
  if (typeof subject !== "string" || !subject.trim()) {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  }
  if (typeof body !== "string" || !body.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const files = formData.getAll("attachments").filter((entry): entry is File => entry instanceof File);

  // Each file is read once and used two ways: base64 for the outgoing
  // SMTP attachment, and a copy in the "inquiry-attachments" bucket so
  // it still shows up in the thread history after the email is sent.
  const supabase = getSupabaseAdminClient();
  const attachments: ReplyAttachment[] = [];
  const storedAttachments: MessageAttachment[] = [];
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    attachments.push({
      filename: file.name,
      content: Buffer.from(bytes).toString("base64"),
      mimeType: file.type || undefined,
    });

    const path = `${source}/${id}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("inquiry-attachments")
      .upload(path, bytes, { contentType: file.type || undefined });
    if (uploadError) {
      console.error("Attachment upload failed", uploadError);
      // Don't fail the whole reply over a failed thread-history copy --
      // the email itself (with its own attachment) still goes out.
      continue;
    }
    storedAttachments.push({ filename: file.name, mimeType: file.type || null, path });
  }

  const fromEmail = process.env.SMTP_FROM_EMAIL;
  const fromName = process.env.SMTP_FROM_NAME ?? "Aurielle Paris Atelier";
  const replyToEmail = fromEmail ? buildReplyToAddress(fromEmail, source, id) : "";

  // TEMPORARY: surfaces the captured SMTP transcript directly in the
  // response either way, so the admin can see it without a separately
  // timed Cloudflare dashboard log-tail session -- remove once the
  // silent non-delivery issue (send() resolves, but nothing reaches
  // the recipient, spam, or the z.com Sent folder) is found.
  let smtpLog: string[];
  try {
    smtpLog = await sendReplyEmail({
      toEmail: toEmail.trim(),
      toName: typeof toName === "string" ? toName.trim() : "",
      subject: subject.trim(),
      bodyText: body.trim(),
      attachments,
      replyToEmail,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    const log = err instanceof SendReplyError ? err.smtpLog : [];
    return NextResponse.json({ error: message, smtpLog: log }, { status: 500 });
  }

  await markViewed(source, id);
  if (fromEmail) {
    await recordOutboundMessage({
      source,
      inquiryId: id,
      fromEmail,
      fromName,
      toEmail: toEmail.trim(),
      subject: subject.trim(),
      bodyText: body.trim(),
      attachments: storedAttachments,
    });
  }

  return NextResponse.json({ ok: true, smtpLog });
});
