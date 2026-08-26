"use client";

import { useRouter } from "next/navigation";
import { useSubmit } from "@/lib/use-submit";

// Actions column for the three Quotes and Inquiries tables (Contact,
// Business, Customisation Studio): an unread badge and a "mark as
// read" action. The row itself opens the full conversation
// (InquiryThreadRow/InquiryThreadModal) on click, so this whole cell
// stops propagation -- otherwise clicking "Mark as Read" would also
// pop the thread modal open.
export function InquiryRowActions({
  endpoint,
  id,
  viewed,
}: {
  endpoint: "contact-inquiries" | "wholesale-inquiries" | "customisation-quotes";
  id: string;
  viewed: boolean;
}) {
  const router = useRouter();
  const { submitting, error, submit } = useSubmit();

  async function markAsRead() {
    const result = await submit(async () => {
      const res = await fetch(`/api/admin/${endpoint}/${id}`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      return data;
    });
    if (result) router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1.5" onClick={(e) => e.stopPropagation()}>
      {!viewed && (
        <span className="rounded-sm bg-burgundy px-2 py-0.5 text-[10px] uppercase tracking-wide text-ivory">
          New
        </span>
      )}
      {!viewed && (
        <button
          type="button"
          disabled={submitting}
          onClick={markAsRead}
          className="text-xs uppercase tracking-wide text-ink/60 underline disabled:opacity-50"
        >
          Mark as Read
        </button>
      )}
      <span className="text-xs text-ink/40">View conversation &rarr;</span>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
