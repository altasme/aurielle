"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BetaBadge } from "./beta-badge";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Order Management" },
  { href: "/admin/products", label: "Product & Pricing" },
  { href: "/admin/affiliates", label: "Affiliate Management" },
  {
    href: "/admin/quotes-and-inquiries",
    label: "Quotes and Inquiries",
    note: "Under development",
    children: [
      { href: "/admin/quotes-and-inquiries/contact", label: "Contact Page Inquiries" },
      { href: "/admin/quotes-and-inquiries/business", label: "Business Inquiries" },
      { href: "/admin/quotes-and-inquiries/studio", label: "Customisation Studio Inquiries" },
    ],
  },
  { href: "/admin/aurielle-mail", label: "Aurielle Mail", beta: true },
];

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-burgundy px-1.5 text-[11px] font-medium text-ivory">
      {count}
    </span>
  );
}

export function AdminNav({
  username,
  unviewedOrders,
  newAffiliates,
  unviewedContactInquiries,
  unviewedBusinessInquiries,
  unviewedStudioInquiries,
  unviewedGeneralMail,
}: {
  username: string;
  unviewedOrders: number;
  newAffiliates: number;
  unviewedContactInquiries: number;
  unviewedBusinessInquiries: number;
  unviewedStudioInquiries: number;
  unviewedGeneralMail: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const badgeByHref: Record<string, number> = {
    "/admin/orders": unviewedOrders,
    "/admin/affiliates": newAffiliates,
    "/admin/quotes-and-inquiries/contact": unviewedContactInquiries,
    "/admin/quotes-and-inquiries/business": unviewedBusinessInquiries,
    "/admin/quotes-and-inquiries/studio": unviewedStudioInquiries,
    "/admin/quotes-and-inquiries": unviewedContactInquiries + unviewedBusinessInquiries + unviewedStudioInquiries,
    "/admin/aurielle-mail": unviewedGeneralMail,
  };

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-taupe/20 bg-white">
      <div className="border-b border-taupe/20 px-6 py-5">
        <p className="font-serif text-lg tracking-[0.15em] text-burgundy">AURIELLE</p>
        <p className="text-xs text-ink/50">Admin Panel</p>
      </div>
      <nav className="flex-1 px-3 py-4">
        {NAV_LINKS.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <div key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center justify-between rounded-sm px-3 py-2 text-sm transition-colors ${
                  active ? "bg-beige text-burgundy" : "text-ink/70 hover:bg-beige/60"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {link.label}
                  {"beta" in link && link.beta && <BetaBadge />}
                  {"note" in link && link.note && (
                    <span className="text-[10px] uppercase tracking-wide text-taupe">({link.note})</span>
                  )}
                </span>
                <Badge count={badgeByHref[link.href] ?? 0} />
              </Link>
              {link.children && active && (
                <div className="ml-3 mt-0.5 flex flex-col border-l border-taupe/20 pl-3">
                  {link.children.map((child) => {
                    const childActive = pathname.startsWith(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center justify-between rounded-sm px-3 py-1.5 text-xs transition-colors ${
                          childActive ? "text-burgundy" : "text-ink/60 hover:text-ink"
                        }`}
                      >
                        {child.label}
                        <Badge count={badgeByHref[child.href] ?? 0} />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-taupe/20 px-6 py-4">
        <p className="truncate text-xs text-ink/50">Signed in as {username}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 text-xs uppercase tracking-wide text-burgundy underline"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
}
