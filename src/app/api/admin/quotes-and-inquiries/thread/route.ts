import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import {
  getMessageAttachmentSignedUrl,
  listInquiryMessages,
  type InquirySource,
} from "@/lib/admin/inquiry-messages";
import { withErrorHandling } from "@/lib/with-error-handling";

const SOURCES = ["contact", "business", "studio"] as const;

function isSource(value: string | null): value is InquirySource {
  return typeof value === "string" && (SOURCES as readonly string[]).includes(value);
}

export const GET = withErrorHandling(async (request: Request) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const source = url.searchParams.get("source");
  const id = url.searchParams.get("id");

  if (!isSource(source)) return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const messages = await listInquiryMessages(source, id);
  const withSignedAttachments = await Promise.all(
    messages.map(async (message) => ({
      ...message,
      attachments: await Promise.all(
        message.attachments.map(async (attachment) => ({
          ...attachment,
          url: await getMessageAttachmentSignedUrl(attachment.path),
        })),
      ),
    })),
  );

  return NextResponse.json({ messages: withSignedAttachments });
});
