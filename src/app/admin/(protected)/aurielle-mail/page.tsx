import { listGeneralMail, countJunkedGeneralMail } from "@/lib/admin/general-mail";
import { getMessageAttachmentSignedUrl } from "@/lib/admin/inquiry-messages";
import { AurielleMailClient } from "@/components/admin/aurielle-mail-client";
import { BetaBadge } from "@/components/admin/beta-badge";
import { ListViewTabs } from "@/components/admin/list-view-tabs";
import { Pager } from "@/components/admin/pager";

export default async function AurielleMailPage({
  searchParams,
}: PageProps<"/admin/aurielle-mail">) {
  const params = await searchParams;
  const view = params.view === "junk" ? "junk" : "inbox";
  const page = Math.max(1, Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1);

  const [{ items: messages, totalPages }, junkCount] = await Promise.all([
    listGeneralMail({ page, view }),
    countJunkedGeneralMail(),
  ]);
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

  const buildHref = (targetView: "inbox" | "junk", targetPage: number) =>
    `/admin/aurielle-mail?view=${targetView}${targetPage > 1 ? `&page=${targetPage}` : ""}`;

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

      <div className="mb-3 shrink-0">
        <ListViewTabs
          inboxHref={buildHref("inbox", 1)}
          junkHref={buildHref("junk", 1)}
          view={view}
          junkCount={junkCount}
        />
      </div>

      <AurielleMailClient initialMessages={withSignedAttachments} view={view} />

      <div className="mt-2 shrink-0">
        <Pager page={page} totalPages={totalPages} buildHref={(p) => buildHref(view, p)} />
      </div>
    </div>
  );
}
