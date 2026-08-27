import { listContactInquiries, countJunkedContactInquiries } from "@/lib/admin/contact-inquiries";
import { InquiryRowActions } from "@/components/admin/inquiry-row-actions";
import { InquiryThreadRow } from "@/components/admin/inquiry-thread-row";
import { ListViewTabs } from "@/components/admin/list-view-tabs";
import { Pager } from "@/components/admin/pager";

export default async function AdminContactInquiriesPage({
  searchParams,
}: PageProps<"/admin/quotes-and-inquiries/contact">) {
  const params = await searchParams;
  const view = params.view === "junk" ? "junk" : "inbox";
  const page = Math.max(1, Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1);

  const [{ items: inquiries, totalPages }, junkCount] = await Promise.all([
    listContactInquiries({ page, view }),
    countJunkedContactInquiries(),
  ]);

  const buildHref = (targetView: "inbox" | "junk", targetPage: number) =>
    `/admin/quotes-and-inquiries/contact?view=${targetView}${targetPage > 1 ? `&page=${targetPage}` : ""}`;

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Contact Page Inquiries</h1>
      <p className="mt-1 text-sm text-ink/60">
        Messages submitted through the public Contact page.
      </p>

      <div className="mt-6">
        <ListViewTabs
          inboxHref={buildHref("inbox", 1)}
          junkHref={buildHref("junk", 1)}
          view={view}
          junkCount={junkCount}
        />
      </div>

      <div className="overflow-x-auto border border-t-0 border-taupe/20 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-taupe/20 bg-beige/40 text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Inquiry Type</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <InquiryThreadRow
                key={inquiry.id}
                source="contact"
                id={inquiry.id}
                toEmail={inquiry.email}
                toName={inquiry.name}
                defaultSubject="Re: Your inquiry to Aurielle Paris Atelier"
                originalMessage={inquiry.message}
                originalCreatedAt={inquiry.createdAt}
                meta={[
                  { label: "Country", value: inquiry.country ?? "—" },
                  { label: "Inquiry Type", value: inquiry.inquiryType ?? "—" },
                ]}
              >
                <td className="px-4 py-3 text-ink">{inquiry.name}</td>
                <td className="px-4 py-3 text-ink/70">{inquiry.email}</td>
                <td className="px-4 py-3 text-ink/70">{inquiry.country ?? "—"}</td>
                <td className="px-4 py-3 text-ink/70">{inquiry.inquiryType ?? "—"}</td>
                <td className="px-4 py-3 max-w-xs text-ink/70">
                  <p className="line-clamp-2">{inquiry.message}</p>
                </td>
                <td className="px-4 py-3 text-ink/70">{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <InquiryRowActions
                    endpoint="contact-inquiries"
                    id={inquiry.id}
                    viewed={Boolean(inquiry.viewedAt)}
                    view={view}
                  />
                </td>
              </InquiryThreadRow>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink/50">
                  {view === "junk" ? "No junked messages." : "No contact page inquiries yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} totalPages={totalPages} buildHref={(p) => buildHref(view, p)} />
    </div>
  );
}
