import Link from "next/link";

// Shared pager for every paginated admin list (Quotes and Inquiries'
// three tables, Aurielle Mail's list pane) -- Previous/Next only, no
// numbered pages, since these lists are sorted by date and admins are
// almost always just paging back through recent activity.
export function Pager({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-6 text-xs uppercase tracking-wide">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className="text-burgundy underline">
          &larr; Previous
        </Link>
      ) : (
        <span className="text-ink/30">&larr; Previous</span>
      )}
      <span className="text-ink/50">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className="text-burgundy underline">
          Next &rarr;
        </Link>
      ) : (
        <span className="text-ink/30">Next &rarr;</span>
      )}
    </div>
  );
}
