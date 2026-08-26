import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { sendReplyEmail, SendReplyError, type ReplyAttachment } from "@/lib/email/send-reply";
import { markContactInquiryViewed } from "@/lib/admin/contact-inquiries";
import { markWholesaleInquiryViewed } from "@/lib/admin/wholesale-inquiries";
import { markCustomisationQuoteViewed } from "@/lib/admin/customisation-quotes";
import { withErrorHandling } from "@/lib/with-error-handling";

const SOURCES = ["contact", "business", "studio"] as const;
type Source = (typeof SOURCES)[number];

function isSource(value: FormDataEntryValue | null): value is Source {
  return typeof value === "string" && (SOURCES as readonly string[]).includes(value);
}

async function markViewed(source: Source, id: string): Promise<void> {
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
  const attachments: ReplyAttachment[] = await Promise.all(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      return {
        filename: file.name,
        content: buffer.toString("base64"),
        mimeType: file.type || undefined,
      };
    }),
  );

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
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    const log = err instanceof SendReplyError ? err.smtpLog : [];
    return NextResponse.json({ error: message, smtpLog: log }, { status: 500 });
  }

  await markViewed(source, id);

  return NextResponse.json({ ok: true, smtpLog });
});
