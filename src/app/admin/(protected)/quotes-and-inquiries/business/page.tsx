import { listWholesaleInquiries, countJunkedWholesaleInquiries } from "@/lib/admin/wholesale-inquiries";
import { InquiryRowActions } from "@/components/admin/inquiry-row-actions";
import { InquiryThreadRow } from "@/components/admin/inquiry-thread-row";
import { ListViewTabs } from "@/components/admin/list-view-tabs";
import { Pager } from "@/components/admin/pager";

export default async function AdminBusinessInquiriesPage({
  searchParams,
}: PageProps<"/admin/quotes-and-inquiries/business">) {
  const params = await searchParams;
  const view = params.view === "junk" ? "junk" : "inbox";
  const page = Math.max(1, Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1);

  const [{ items: inquiries, totalPages }, junkCount] = await Promise.all([
    listWholesaleInquiries({ page, view }),
    countJunkedWholesaleInquiries(),
  ]);

  const buildHref = (targetView: "inbox" | "junk", targetPage: number) =>
    `/admin/quotes-and-inquiries/business?view=${targetView}${targetPage > 1 ? `&page=${targetPage}` : ""}`;

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Business Inquiries</h1>
      <p className="mt-1 text-sm text-ink/60">
        Inquiries submitted through the public &ldquo;For Your Business&rdquo; page.
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
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="border-b border-taupe/20 bg-beige/40 text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Product Interest</th>
              <th className="px-4 py-3">Est. Quantity</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <InquiryThreadRow
                key={inquiry.id}
                source="business"
                id={inquiry.id}
                toEmail={inquiry.email}
                toName={inquiry.name}
                defaultSubject="Re: Your inquiry to Aurielle Paris Atelier"
                originalMessage={inquiry.message ?? ""}
                originalCreatedAt={inquiry.createdAt}
                meta={[
                  { label: "Business", value: inquiry.businessName ?? "—" },
                  { label: "Country", value: inquiry.country },
                  { label: "Product Interest", value: inquiry.productInterest ?? "—" },
                  { label: "Est. Quantity", value: inquiry.estimatedQuantity ?? "—" },
                ]}
              >
                <td className="px-4 py-3 text-ink">{inquiry.name}</td>
                <td className="px-4 py-3 text-ink/70">{inquiry.businessName ?? "—"}</td>
                <td className="px-4 py-3 text-ink/70">{inquiry.email}</td>
                <td className="px-4 py-3 text-ink/70">{inquiry.country}</td>
                <td className="px-4 py-3 text-ink/70">{inquiry.productInterest ?? "—"}</td>
                <td className="px-4 py-3 text-ink/70">{inquiry.estimatedQuantity ?? "—"}</td>
                <td className="px-4 py-3 max-w-xs text-ink/70">
                  <p className="line-clamp-2">{inquiry.message ?? "—"}</p>
                </td>
                <td className="px-4 py-3 text-ink/70">{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <InquiryRowActions
                    endpoint="wholesale-inquiries"
                    id={inquiry.id}
                    viewed={Boolean(inquiry.viewedAt)}
                    view={view}
                  />
                </td>
              </InquiryThreadRow>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-ink/50">
                  {view === "junk" ? "No junked inquiries." : "No business inquiries yet."}
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
