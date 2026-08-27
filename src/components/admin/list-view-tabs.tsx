import Link from "next/link";

// Inbox / Junk switch, shared by Quotes and Inquiries' three tables and
// Aurielle Mail. "Move to Junk" (a soft delete -- see the *_junked_at
// columns, 0017_junk.sql) needs somewhere for the admin to actually
// see what got junked, restore it, or delete it permanently.
export function ListViewTabs({
  inboxHref,
  junkHref,
  view,
  junkCount,
}: {
  inboxHref: string;
  junkHref: string;
  view: "inbox" | "junk";
  junkCount: number;
}) {
  return (
    <div className="flex gap-2 border-b border-taupe/20">
      <Link
        href={inboxHref}
        className={`border-b-2 px-3 py-2 text-xs uppercase tracking-wide transition-colors ${
          view === "inbox" ? "border-burgundy text-burgundy" : "border-transparent text-ink/50 hover:text-ink"
        }`}
      >
        Inbox
      </Link>
      <Link
        href={junkHref}
        className={`border-b-2 px-3 py-2 text-xs uppercase tracking-wide transition-colors ${
          view === "junk" ? "border-burgundy text-burgundy" : "border-transparent text-ink/50 hover:text-ink"
        }`}
      >
        Junk{junkCount > 0 ? ` (${junkCount})` : ""}
      </Link>
    </div>
  );
}
