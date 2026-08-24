import { listAffiliateApplications } from "@/lib/admin/affiliates";

export default async function AdminAffiliatesPage() {
  const applications = await listAffiliateApplications();

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Affiliate Management</h1>
      <p className="mt-1 text-sm text-ink/60">Applications submitted through the public &ldquo;Be an Affiliate&rdquo; form.</p>

      <div className="mt-6 overflow-x-auto border border-taupe/20 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-taupe/20 bg-beige/40 text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Mobile Number</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Shopee ID</th>
              <th className="px-4 py-3">FB Page</th>
              <th className="px-4 py-3">TikTok</th>
              <th className="px-4 py-3">Date</th>
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
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink/50">
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
