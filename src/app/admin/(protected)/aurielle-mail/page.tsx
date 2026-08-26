import { listGeneralMail } from "@/lib/admin/general-mail";
import { getMessageAttachmentSignedUrl } from "@/lib/admin/inquiry-messages";
import { AurielleMailClient } from "@/components/admin/aurielle-mail-client";

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
        <h1 className="font-serif text-2xl text-ink">Aurielle Mail</h1>
        <p className="mt-1 text-sm text-ink/60">hello@auriellefragrancestudio.com</p>
      </div>
      <AurielleMailClient initialMessages={withSignedAttachments} />
    </div>
  );
}
