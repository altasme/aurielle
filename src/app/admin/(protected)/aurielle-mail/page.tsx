import { listGeneralMail } from "@/lib/admin/general-mail";
import { getMessageAttachmentSignedUrl } from "@/lib/admin/inquiry-messages";
import { AurielleMailClient } from "@/components/admin/aurielle-mail-client";
import { BetaBadge } from "@/components/admin/beta-badge";

export default async function AurielleMailPage() {
  const messages = await listGeneralMail();
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

  return (
    <div className="flex h-[80vh] min-h-[560px] flex-col">
      <div className="mb-4 shrink-0">
        <h1 className="flex items-center gap-2 font-serif text-2xl text-ink">
          Aurielle Mail
          <BetaBadge />
        </h1>
        <p className="mt-1 text-sm text-ink/60">hello@auriellefragrancestudio.com</p>
        <p className="mt-1 text-xs text-ink/50">
          Under continuous development -- safe to use live in production.
        </p>
      </div>
      <AurielleMailClient initialMessages={withSignedAttachments} />
    </div>
  );
}
