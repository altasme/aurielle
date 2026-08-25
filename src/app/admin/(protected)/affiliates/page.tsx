import { listAffiliateApplications, countAffiliateApplicationsByStatus } from "@/lib/admin/affiliates";
import { AFFILIATE_STATUSES, AFFILIATE_STATUS_LABELS, type AffiliateStatus } from "@/lib/admin/affiliate-constants";
import { AffiliateStatusActions } from "@/components/admin/affiliate-status-actions";
import Link from "next/link";

const STATUS_BADGE: Record<AffiliateStatus, string> = {
  pending: "bg-beige text-ink/60",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function isAffiliateStatus(value: string | undefined): value is AffiliateStatus {
  return (AFFILIATE_STATUSES as string[]).includes(value ?? "");
}

export default async function AdminAffiliatesPage({ searchParams }: PageProps<"/admin/affiliates">) {
  const params = await searchParams;
  const statusParam = Array.isArray(params.status) ? params.status[0] : params.status;
  const status = isAffiliateStatus(statusParam) ? statusParam : undefined;

  const [applications, counts] = await Promise.all([
    listAffiliateApplications(status),
    countAffiliateApplicationsByStatus(),
  ]);
  const total = counts.pending + counts.approved + counts.rejected;

  const tabs: { value: AffiliateStatus | "all"; label: string; count: number }[] = [
    { value: "all", label: "All", count: total },
    { value: "pending", label: "New", count: counts.pending },
    { value: "approved", label: "Approved", count: counts.approved },
    { value: "rejected", label: "Rejected", count: counts.rejected },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Affiliate Management</h1>
      <p className="mt-1 text-sm text-ink/60">
        Applications submitted through the public &ldquo;Be an Affiliate&rdquo; form. New
        applications are subject to approval before an affiliate is considered active.
      </p>

      <div className="mt-6 flex gap-2 border-b border-taupe/20">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/affiliates" : `/admin/affiliates?status=${tab.value}`}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm transition-colors ${
              (status ?? "all") === tab.value
                ? "border-burgundy text-burgundy"
                : "border-transparent text-ink/60 hover:text-ink"
            }`}
          >
            {tab.label}
            <span className="rounded-full bg-beige px-1.5 text-[11px] text-ink/60">{tab.count}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto border border-taupe/20 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-taupe/20 bg-beige/40 text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Mobile Number</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Shopee ID</th>
              <th className="px-4 py-3">FB Page</th>
              <th className="px-4 py-3">TikTok</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b border-taupe/10 last:border-0">
                <td className="px-4 py-3 text-ink">{app.name}</td>
                <td className="px-4 py-3 text-ink/70">{app.mobileNumber}</td>
                <td className="px-4 py-3 text-ink/70">{app.email}</td>
                <td className="px-4 py-3 text-ink/70">{app.shopeeId ?? "—"}</td>
                <td className="px-4 py-3 text-ink/70">{app.fbPage ?? "—"}</td>
                <td className="px-4 py-3 text-ink/70">{app.tiktokAccount ?? "—"}</td>
                <td className="px-4 py-3 text-ink/70">{new Date(app.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-sm px-2 py-0.5 text-xs uppercase tracking-wide ${STATUS_BADGE[app.status]}`}>
                    {AFFILIATE_STATUS_LABELS[app.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <AffiliateStatusActions id={app.id} status={app.status} />
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-ink/50">
                  No affiliate applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
