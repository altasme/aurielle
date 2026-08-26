import { listCustomisationQuotes } from "@/lib/admin/customisation-quotes";
import { CustomisationQuoteArtworkViewer } from "@/components/admin/customisation-quote-artwork-viewer";
import { InquiryRowActions } from "@/components/admin/inquiry-row-actions";
import { InquiryThreadRow } from "@/components/admin/inquiry-thread-row";

export default async function AdminCustomisationStudioInquiriesPage() {
  const quotes = await listCustomisationQuotes();

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Customisation Studio Inquiries</h1>
      <p className="mt-1 text-sm text-ink/60">
        Quote requests submitted through the public Customisation Studio page.
      </p>

      <div className="mt-6 overflow-x-auto border border-taupe/20 bg-white">
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
                <td className="px-4 py-3 max-w-xs text-ink/70">{quote.message ?? "—"}</td>
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
                  />
                </td>
              </InquiryThreadRow>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-ink/50">
                  No customisation quote requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
