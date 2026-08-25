import Link from "next/link";
import { countUnviewedContactInquiries } from "@/lib/admin/contact-inquiries";
import { countUnviewedWholesaleInquiries } from "@/lib/admin/wholesale-inquiries";
import { countUnviewedCustomisationQuotes } from "@/lib/admin/customisation-quotes";

export default async function AdminQuotesAndInquiriesPage() {
  const [contactCount, businessCount, studioCount] = await Promise.all([
    countUnviewedContactInquiries(),
    countUnviewedWholesaleInquiries(),
    countUnviewedCustomisationQuotes(),
  ]);

  const sections = [
    {
      title: "Contact Page Inquiries",
      description: "Messages submitted through the public Contact page.",
      href: "/admin/quotes-and-inquiries/contact",
      count: contactCount,
    },
    {
      title: "Business Inquiries",
      description: "Inquiries submitted through the public \"For Your Business\" page.",
      href: "/admin/quotes-and-inquiries/business",
      count: businessCount,
    },
    {
      title: "Customisation Studio Inquiries",
      description: "Quote requests submitted through the public Customisation Studio page.",
      href: "/admin/quotes-and-inquiries/studio",
      count: studioCount,
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Quotes and Inquiries</h1>
      <p className="mt-1 text-sm text-ink/60">
        Every message and quote request submitted from the public site, grouped by where it came
        from.{" "}
        <span className="text-taupe">
          Replying is currently manual, using the email address on each entry -- direct reply from
          the admin panel is under development.
        </span>
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="border border-taupe/20 bg-white p-6 transition-colors hover:border-burgundy"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-ink">{section.title}</h2>
              {section.count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-burgundy px-1.5 text-[11px] font-medium text-ivory">
                  {section.count}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-ink/60">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
