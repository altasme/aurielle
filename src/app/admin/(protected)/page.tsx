import Link from "next/link";
import { countUnviewedOrders } from "@/lib/admin/orders";
import { countNewAffiliateApplications } from "@/lib/admin/affiliates";
import { countUnviewedContactInquiries } from "@/lib/admin/contact-inquiries";
import { countUnviewedWholesaleInquiries } from "@/lib/admin/wholesale-inquiries";
import { countUnviewedCustomisationQuotes } from "@/lib/admin/customisation-quotes";

const MODULES = [
  {
    title: "Order Management",
    description: "Orders, order status, customer information, payment status, fulfillment, shipping.",
    href: "/admin/orders",
  },
  {
    title: "Product & Pricing",
    description: "Manage the Aurielle Collection and Atelier Supply catalogues shown on the public site.",
    href: "/admin/products",
  },
  {
    title: "Affiliate Management",
    description: "Applications submitted through the public \"Be an Affiliate\" form.",
    href: "/admin/affiliates",
  },
  {
    title: "Quotes and Inquiries",
    note: "Under development",
    description: "Contact, business and Customisation Studio inquiries submitted from the public site.",
    href: "/admin/quotes-and-inquiries",
  },
  {
    title: "Promotion",
    description: "Discount codes, promotional pricing, campaigns, product-specific promotions.",
    href: null,
  },
  {
    title: "Reports & Analytics",
    description: "Sales, orders, product performance, revenue, customer activity.",
    href: null,
  },
];

export default async function AdminDashboardPage() {
  const [unviewedOrders, newAffiliates, unviewedContactInquiries, unviewedBusinessInquiries, unviewedStudioInquiries] =
    await Promise.all([
      countUnviewedOrders(),
      countNewAffiliateApplications(),
      countUnviewedContactInquiries(),
      countUnviewedWholesaleInquiries(),
      countUnviewedCustomisationQuotes(),
    ]);

  const badgeByHref: Record<string, number> = {
    "/admin/orders": unviewedOrders,
    "/admin/affiliates": newAffiliates,
    "/admin/quotes-and-inquiries": unviewedContactInquiries + unviewedBusinessInquiries + unviewedStudioInquiries,
  };

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink/60">Select a module to get started.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MODULES.map((mod) => {
          const count = mod.href ? (badgeByHref[mod.href] ?? 0) : 0;
          return mod.href ? (
            <Link
              key={mod.title}
              href={mod.href}
              className="border border-taupe/20 bg-white p-6 transition-colors hover:border-burgundy"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg text-ink">
                  {mod.title}
                  {mod.note && (
                    <span className="ml-1.5 text-[10px] uppercase tracking-wide text-taupe">({mod.note})</span>
                  )}
                </h2>
                {count > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-burgundy px-1.5 text-[11px] font-medium text-ivory">
                    {count}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-ink/60">{mod.description}</p>
            </Link>
          ) : (
            <div key={mod.title} className="border border-taupe/20 bg-white/60 p-6 opacity-60">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg text-ink">{mod.title}</h2>
                <span className="rounded-sm bg-beige px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink/50">
                  Coming Soon
                </span>
              </div>
              <p className="mt-2 text-sm text-ink/60">{mod.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
