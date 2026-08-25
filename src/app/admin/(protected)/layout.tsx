import type { Metadata } from "next";
import { getSessionAdminUser, requireAdmin } from "@/lib/admin/auth";
import { countUnviewedOrders } from "@/lib/admin/orders";
import { countNewAffiliateApplications } from "@/lib/admin/affiliates";
import { countUnviewedContactInquiries } from "@/lib/admin/contact-inquiries";
import { countUnviewedWholesaleInquiries } from "@/lib/admin/wholesale-inquiries";
import { countUnviewedCustomisationQuotes } from "@/lib/admin/customisation-quotes";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "Admin | Aurielle Paris Atelier",
  robots: { index: false, follow: false },
};

// The login page has its own (unauthenticated) check; every other
// /admin/* route is guarded here. This is the page-navigation guard;
// every Server Action / API route under /api/admin also calls
// requireAdmin() itself, since a layout alone doesn't protect a
// directly-invoked action or fetch (spec: "protected server-side, not
// only through frontend route protection").
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  const [unviewedOrders, newAffiliates, unviewedContactInquiries, unviewedBusinessInquiries, unviewedStudioInquiries] =
    await Promise.all([
      countUnviewedOrders(),
      countNewAffiliateApplications(),
      countUnviewedContactInquiries(),
      countUnviewedWholesaleInquiries(),
      countUnviewedCustomisationQuotes(),
    ]);

  return (
    <div className="flex min-h-screen bg-ivory text-ink">
      <AdminNav
        username={user.username}
        unviewedOrders={unviewedOrders}
        newAffiliates={newAffiliates}
        unviewedContactInquiries={unviewedContactInquiries}
        unviewedBusinessInquiries={unviewedBusinessInquiries}
        unviewedStudioInquiries={unviewedStudioInquiries}
      />
      <main className="flex-1 overflow-x-auto px-8 py-8">{children}</main>
    </div>
  );
}

// Re-exported so route handlers/pages under /admin can import a single
// "am I logged in" check without reaching into src/lib/admin/auth.
export { getSessionAdminUser };
