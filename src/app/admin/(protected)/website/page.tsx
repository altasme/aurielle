import Link from "next/link";
import { listPageSummaries } from "@/lib/admin/site-content";

export default function AdminWebsiteManagementPage() {
  const pages = listPageSummaries();

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Website Management</h1>
      <p className="mt-1 text-sm text-ink/60">
        Edit the photos and wording shown on the public site, organized one page at a time. Changes go live as soon
        as you save.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={`/admin/website/${page.slug}`}
            className="border border-taupe/20 bg-white p-6 transition-colors hover:border-burgundy"
          >
            <h2 className="font-serif text-lg text-ink">{page.label}</h2>
            <p className="mt-2 text-sm text-ink/60">{page.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
