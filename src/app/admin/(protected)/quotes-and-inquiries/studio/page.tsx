import { listCustomisationQuotes, countJunkedCustomisationQuotes } from "@/lib/admin/customisation-quotes";
import { CustomisationQuoteArtworkViewer } from "@/components/admin/customisation-quote-artwork-viewer";
import { InquiryRowActions } from "@/components/admin/inquiry-row-actions";
import { InquiryThreadRow } from "@/components/admin/inquiry-thread-row";
import { ListViewTabs } from "@/components/admin/list-view-tabs";
import { Pager } from "@/components/admin/pager";

export default async function AdminCustomisationStudioInquiriesPage({
  searchParams,
}: PageProps<"/admin/quotes-and-inquiries/studio">) {
  const params = await searchParams;
  const view = params.view === "junk" ? "junk" : "inbox";
  const page = Math.max(1, Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1);

  const [{ items: quotes, totalPages }, junkCount] = await Promise.all([
    listCustomisationQuotes({ page, view }),
    countJunkedCustomisationQuotes(),
  ]);

  const buildHref = (targetView: "inbox" | "junk", targetPage: number) =>
    `/admin/quotes-and-inquiries/studio?view=${targetView}${targetPage > 1 ? `&page=${targetPage}` : ""}`;

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Customisation Studio Inquiries</h1>
      <p className="mt-1 text-sm text-ink/60">
        Quote requests submitted through the public Customisation Studio page.
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
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="border-b border-taupe/20 bg-beige/40 text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Grouping</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Artwork</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <InquiryThreadRow
                key={quote.id}
                source="studio"
                id={quote.id}
                toEmail={quote.email}
                toName={quote.name}
                defaultSubject="Re: Your Customisation Studio quote"
                originalMessage={quote.message ?? ""}
                originalCreatedAt={quote.createdAt}
                meta={[
                  { label: "Country", value: quote.country ?? "—" },
                  { label: "Phone", value: quote.phone ?? "—" },
                  { label: "Grouping", value: quote.grouping ?? "—" },
                  { label: "Item", value: quote.itemInterest ?? "—" },
                  { label: "Quantity", value: quote.quantity ?? "—" },
                ]}
                extra={quote.artworkPath ? <CustomisationQuoteArtworkViewer quoteId={quote.id} /> : undefined}
              >
                <td className="px-4 py-3 text-ink">
                  {quote.name}
                  {quote.country && <div className="text-xs text-ink/50">{quote.country}</div>}
                </td>
                <td className="px-4 py-3 text-ink/70">
                  <div>{quote.email}</div>
                  {quote.phone && <div className="text-xs text-ink/50">{quote.phone}</div>}
                </td>
                <td className="px-4 py-3 text-ink/70">{quote.grouping ?? "—"}</td>
                <td className="px-4 py-3 text-ink/70">{quote.itemInterest ?? "—"}</td>
                <td className="px-4 py-3 text-ink/70">{quote.quantity ?? "—"}</td>
                <td className="px-4 py-3 max-w-xs text-ink/70">
                  <p className="line-clamp-2">{quote.message ?? "—"}</p>
                </td>
                <td className="px-4 py-3">
                  {quote.artworkPath ? (
                    <CustomisationQuoteArtworkViewer quoteId={quote.id} />
                  ) : (
                    <span className="text-xs text-ink/40">None</span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink/70">{new Date(quote.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <InquiryRowActions
                    endpoint="customisation-quotes"
                    id={quote.id}
                    viewed={Boolean(quote.viewedAt)}
                    view={view}
                  />
                </td>
              </InquiryThreadRow>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-ink/50">
                  {view === "junk" ? "No junked quote requests." : "No customisation quote requests yet."}
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
