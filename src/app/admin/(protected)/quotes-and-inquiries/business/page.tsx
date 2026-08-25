import { listWholesaleInquiries } from "@/lib/admin/wholesale-inquiries";
import { InquiryRowActions } from "@/components/admin/inquiry-row-actions";

export default async function AdminBusinessInquiriesPage() {
  const inquiries = await listWholesaleInquiries();

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Business Inquiries</h1>
      <p className="mt-1 text-sm text-ink/60">
        Inquiries submitted through the public &ldquo;For Your Business&rdquo; page.
      </p>

      <div className="mt-6 overflow-x-auto border border-taupe/20 bg-white">
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
              <tr key={inquiry.id} className="border-b border-taupe/10 last:border-0 align-top">
                <td className="px-4 py-3 text-ink">{inquiry.name}</td>
                <td className="px-4 py-3 text-ink/70">{inquiry.businessName ?? "—"}</td>
                <td className="px-4 py-3 text-ink/70">{inquiry.email}</td>
                <td className="px-4 py-3 text-ink/70">{inquiry.country}</td>
                <td className="px-4 py-3 text-ink/70">{inquiry.productInterest ?? "—"}</td>
                <td className="px-4 py-3 text-ink/70">{inquiry.estimatedQuantity ?? "—"}</td>
                <td className="px-4 py-3 max-w-xs text-ink/70">{inquiry.message ?? "—"}</td>
                <td className="px-4 py-3 text-ink/70">{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <InquiryRowActions
                    endpoint="wholesale-inquiries"
                    id={inquiry.id}
                    viewed={Boolean(inquiry.viewedAt)}
                    toEmail={inquiry.email}
                    toName={inquiry.name}
                  />
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-ink/50">
                  No business inquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
